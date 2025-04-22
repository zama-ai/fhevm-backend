use anyhow::Result;
use bigdecimal::num_bigint::BigInt;
use tfhe::integer::bigint::static_signed::StaticSignedBigInt;
use tfhe::integer::bigint::StaticUnsignedBigInt;
use tfhe::integer::ciphertext::BaseRadixCiphertext;
use tfhe::integer::{IntegerRadixCiphertext, RadixCiphertext, SignedRadixCiphertext};
use tfhe::prelude::{CiphertextList, FheDecrypt};
use tfhe::shortint::Ciphertext;
use tfhe::{CompressedCiphertextList, CompressedCiphertextListBuilder};

use crate::utils::{safe_deserialize, safe_serialize};

#[derive(Debug)]
pub enum FhevmError {
    UnknownFheOperation(i32),
    UnknownFheType(i32),
    DeserializationError(Box<dyn std::error::Error + Sync + Send>),
    CiphertextExpansionError(tfhe::Error),
    CiphertextExpansionUnsupportedCiphertextKind(tfhe::FheTypes),
    FheOperationOnlyOneOperandCanBeScalar {
        fhe_operation: i32,
        fhe_operation_name: String,
        scalar_operand_count: usize,
        max_scalar_operands: usize,
    },
    FheOperationDoesntSupportScalar {
        fhe_operation: i32,
        fhe_operation_name: String,
        scalar_requested: bool,
        scalar_supported: bool,
    },
    FheOperationOnlySecondOperandCanBeScalar {
        scalar_input_index: usize,
        only_allowed_scalar_input_index: usize,
    },
    FheOperationDoesntHaveUniformTypesAsInput {
        fhe_operation: i32,
        fhe_operation_name: String,
        operand_types: Vec<i16>,
    },
    FheOperationScalarDivisionByZero {
        lhs_handle: String,
        rhs_value: String,
        fhe_operation: i32,
        fhe_operation_name: String,
    },
    FheOperationDoesntSupportEbytesAsInput {
        lhs_handle: String,
        rhs_handle: String,
        fhe_operation: i32,
        fhe_operation_name: String,
    },
    UnexpectedOperandCountForFheOperation {
        fhe_operation: i32,
        fhe_operation_name: String,
        expected_operands: usize,
        got_operands: usize,
    },
    OperationDoesntSupportBooleanInputs {
        fhe_operation: i32,
        fhe_operation_name: String,
        operand_type: i16,
    },
    FheIfThenElseUnexpectedOperandTypes {
        fhe_operation: i32,
        fhe_operation_name: String,
        first_operand_type: i16,
        first_expected_operand_type: i16,
        first_expected_operand_type_name: String,
    },
    FheIfThenElseMismatchingSecondAndThirdOperatorTypes {
        fhe_operation: i32,
        fhe_operation_name: String,
        second_operand_type: i16,
        third_operand_type: i16,
    },
    UnexpectedCastOperandTypes {
        fhe_operation: i32,
        fhe_operation_name: String,
        expected_operator_combination: Vec<String>,
        got_operand_combination: Vec<String>,
    },
    UnexpectedCastOperandSizeForScalarOperand {
        fhe_operation: i32,
        fhe_operation_name: String,
        expected_scalar_operand_bytes: usize,
        got_bytes: usize,
    },
    AllInputsForTrivialEncryptionMustBeScalar {
        fhe_operation: i32,
        fhe_operation_name: String,
    },
    UnexpectedTrivialEncryptionOperandSizeForScalarOperand {
        fhe_operation: i32,
        fhe_operation_name: String,
        expected_scalar_operand_bytes: usize,
        got_bytes: usize,
    },
    UnexpectedRandOperandSizeForOutputType {
        fhe_operation: i32,
        fhe_operation_name: String,
        expected_operand_bytes: usize,
        got_bytes: usize,
    },
    RandOperationUpperBoundCannotBeZero {
        fhe_operation: i32,
        fhe_operation_name: String,
        upper_bound_value: String,
    },
    RandOperationInputsMustAllBeScalar {
        fhe_operation: i32,
        fhe_operation_name: String,
        scalar_operand_count: usize,
        expected_scalar_operand_count: usize,
    },
    BadInputs,
    MissingTfheRsData,
    InvalidHandle,
    UnsupportedFheTypes {
        fhe_operation: String,
        input_types: Vec<&'static str>,
    },
    UnknownCastType {
        fhe_operation: String,
        type_to_cast_to: i16,
    },
}

impl std::error::Error for FhevmError {}

impl std::fmt::Display for FhevmError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Self::UnknownFheOperation(op) => {
                write!(f, "Unknown fhe operation: {}", op)
            }
            Self::UnknownFheType(op) => {
                write!(f, "Unknown fhe type: {}", op)
            }
            Self::DeserializationError(e) => {
                write!(f, "error deserializing ciphertext: {:?}", e)
            }
            Self::CiphertextExpansionError(e) => {
                write!(f, "error expanding compact ciphertext list: {:?}", e)
            }
            Self::CiphertextExpansionUnsupportedCiphertextKind(e) => {
                write!(
                    f,
                    "unsupported tfhe type found while expanding ciphertexts: {:?}",
                    e
                )
            }
            Self::FheOperationDoesntSupportScalar {
                fhe_operation,
                fhe_operation_name,
                ..
            } => {
                write!(f, "fhe operation number {fhe_operation} ({fhe_operation_name}) doesn't support scalar computation")
            }
            Self::FheOperationDoesntHaveUniformTypesAsInput {
                fhe_operation,
                fhe_operation_name,
                operand_types,
            } => {
                write!(f, "fhe operation number {fhe_operation} ({fhe_operation_name}) expects uniform types as input, received: {:?}", operand_types)
            }
            Self::FheOperationScalarDivisionByZero {
                lhs_handle,
                rhs_value,
                fhe_operation,
                fhe_operation_name,
            } => {
                write!(f, "zero on the right side of scalar division, lhs handle: {lhs_handle}, rhs value: {rhs_value}, fhe operation: {fhe_operation} fhe operation name:{fhe_operation_name}")
            }
            Self::FheOperationDoesntSupportEbytesAsInput {
                lhs_handle,
                rhs_handle: rhs_value,
                fhe_operation,
                fhe_operation_name,
            } => {
                write!(f, "zero on the right side of scalar division, lhs handle: {lhs_handle}, rhs value: {rhs_value}, fhe operation: {fhe_operation} fhe operation name:{fhe_operation_name}")
            }
            Self::UnexpectedOperandCountForFheOperation {
                fhe_operation,
                fhe_operation_name,
                expected_operands,
                got_operands,
            } => {
                write!(f, "fhe operation number {fhe_operation} ({fhe_operation_name}) received unexpected operand count, expected: {expected_operands}, received: {got_operands}")
            }
            Self::OperationDoesntSupportBooleanInputs {
                fhe_operation,
                fhe_operation_name,
                operand_type,
            } => {
                write!(f, "fhe operation number {fhe_operation} ({fhe_operation_name}) does not support booleans as inputs, input type: {operand_type}")
            }
            Self::FheOperationOnlySecondOperandCanBeScalar {
                scalar_input_index,
                only_allowed_scalar_input_index,
            } => {
                write!(f, "computation has scalar operand which is not the second operand, scalar input index: {scalar_input_index}, only allowed scalar input index: {only_allowed_scalar_input_index}")
            }
            Self::UnexpectedCastOperandTypes {
                fhe_operation,
                fhe_operation_name,
                expected_operator_combination,
                got_operand_combination,
            } => {
                write!(f, "unexpected operand types for cast, fhe operation: {fhe_operation}, fhe operation name: {fhe_operation_name}, expected operand combination: {:?}, got operand combination: {:?}", expected_operator_combination, got_operand_combination)
            }
            Self::UnexpectedCastOperandSizeForScalarOperand {
                fhe_operation,
                fhe_operation_name,
                expected_scalar_operand_bytes,
                got_bytes,
            } => {
                write!(f, "unexpected operand size for cast, fhe operation: {fhe_operation}, fhe operation name: {fhe_operation_name}, expected bytes: {}, got bytes: {}", expected_scalar_operand_bytes, got_bytes)
            }
            Self::AllInputsForTrivialEncryptionMustBeScalar {
                fhe_operation,
                fhe_operation_name,
            } => {
                write!(f, "all inputs for trivial encryption must be scalar, fhe operation: {fhe_operation}, fhe operation name: {fhe_operation_name}")
            }
            Self::UnexpectedTrivialEncryptionOperandSizeForScalarOperand {
                fhe_operation,
                fhe_operation_name,
                expected_scalar_operand_bytes,
                got_bytes,
            } => {
                write!(f, "unexpected operand size for trivial encryption, fhe operation: {fhe_operation}, fhe operation name: {fhe_operation_name}, expected bytes: {}, got bytes: {}", expected_scalar_operand_bytes, got_bytes)
            }
            Self::FheIfThenElseUnexpectedOperandTypes {
                fhe_operation,
                fhe_operation_name,
                first_operand_type,
                first_expected_operand_type,
                ..
            } => {
                write!(f, "fhe if then else first operand should always be FheBool, fhe operation: {fhe_operation}, fhe operation name: {fhe_operation_name}, first operand type: {first_operand_type}, first operand expected type: {first_expected_operand_type}")
            }
            Self::FheIfThenElseMismatchingSecondAndThirdOperatorTypes {
                fhe_operation,
                fhe_operation_name,
                second_operand_type,
                third_operand_type,
            } => {
                write!(f, "fhe if then else second and third operand types don't match, fhe operation: {fhe_operation}, fhe operation name: {fhe_operation_name}, second operand type: {second_operand_type}, third operand type: {third_operand_type}")
            }
            Self::FheOperationOnlyOneOperandCanBeScalar {
                fhe_operation,
                fhe_operation_name,
                scalar_operand_count,
                max_scalar_operands,
            } => {
                write!(f, "only one operand can be scalar, fhe operation: {fhe_operation}, fhe operation name: {fhe_operation_name}, second operand count: {scalar_operand_count}, max scalar operands: {max_scalar_operands}")
            }
            Self::UnexpectedRandOperandSizeForOutputType {
                fhe_operation,
                fhe_operation_name,
                expected_operand_bytes,
                got_bytes,
            } => {
                write!(f, "operation must have only one byte for output operand type {fhe_operation} ({fhe_operation_name}) expects bytes {}, received: {}", expected_operand_bytes, got_bytes)
            }
            Self::RandOperationUpperBoundCannotBeZero {
                fhe_operation,
                fhe_operation_name,
                upper_bound_value,
            } => {
                write!(f, "rand bounded operation cannot receive zero as upper bound {fhe_operation} ({fhe_operation_name}) received: {}", upper_bound_value)
            }
            Self::RandOperationInputsMustAllBeScalar {
                fhe_operation,
                fhe_operation_name,
                scalar_operand_count,
                expected_scalar_operand_count,
            } => {
                write!(f, "operation must have all operands as scalar {fhe_operation} ({fhe_operation_name}) expected scalar operands {}, received: {}", expected_scalar_operand_count, scalar_operand_count)
            }
            Self::BadInputs => {
                write!(f, "Bad inputs")
            }
            Self::MissingTfheRsData => {
                write!(f, "Missing TFHE-rs data")
            }
            Self::InvalidHandle => {
                write!(f, "Invalid ciphertext handle")
            }
            Self::UnsupportedFheTypes {
                fhe_operation,
                input_types,
            } => {
                write!(
                    f,
                    "Unsupported type combination for fhe operation {fhe_operation}: {:?}",
                    input_types
                )
            }
            Self::UnknownCastType {
                fhe_operation,
                type_to_cast_to,
            } => {
                write!(
                    f,
                    "Unknown type to cast to for fhe operation {fhe_operation}: {}",
                    type_to_cast_to
                )
            }
        }
    }
}

type Unsupported = ();

#[derive(Clone)]
pub enum SupportedFheCiphertexts {
    FheBool(tfhe::FheBool),
    FheUint4(tfhe::FheUint4),
    FheUint8(tfhe::FheUint8),
    FheUint16(tfhe::FheUint16),
    FheUint32(tfhe::FheUint32),
    FheUint64(tfhe::FheUint64),
    FheUint128(tfhe::FheUint128),
    FheUint160(tfhe::FheUint160),
    FheUint256(tfhe::FheUint256),
    FheBytes64(tfhe::FheUint512),
    FheBytes128(tfhe::FheUint1024),
    FheBytes256(tfhe::FheUint2048),
    FheUint2(tfhe::FheUint2),
    FheUint6(tfhe::FheUint6),
    FheUint10(tfhe::FheUint10),
    FheUint12(tfhe::FheUint12),
    FheUint14(tfhe::FheUint14),

    FheInt2(tfhe::FheInt2),
    FheInt4(tfhe::FheInt4),
    FheInt6(tfhe::FheInt6),
    FheInt8(tfhe::FheInt8),
    FheInt10(tfhe::FheInt10),
    FheInt12(tfhe::FheInt12),
    FheInt14(tfhe::FheInt14),
    FheInt16(tfhe::FheInt16),
    FheInt32(tfhe::FheInt32),
    FheInt64(tfhe::FheInt64),
    FheInt128(tfhe::FheInt128),
    FheInt160(tfhe::FheInt160),
    FheInt256(tfhe::FheInt256),
    FheAsciiString(Unsupported),
    FheInt512(Unsupported),
    FheInt1024(Unsupported),
    FheInt2048(Unsupported),
    FheUint24(Unsupported),
    FheUint40(Unsupported),
    FheUint48(Unsupported),
    FheUint56(Unsupported),
    FheUint72(Unsupported),
    FheUint80(Unsupported),
    FheUint88(Unsupported),
    FheUint96(Unsupported),
    FheUint104(Unsupported),
    FheUint112(Unsupported),
    FheUint120(Unsupported),
    FheUint136(Unsupported),
    FheUint144(Unsupported),
    FheUint152(Unsupported),
    FheUint168(Unsupported),
    FheUint176(Unsupported),
    FheUint184(Unsupported),
    FheUint192(Unsupported),
    FheUint200(Unsupported),
    FheUint208(Unsupported),
    FheUint216(Unsupported),
    FheUint224(Unsupported),
    FheUint232(Unsupported),
    FheUint240(Unsupported),
    FheUint248(Unsupported),
    FheInt24(Unsupported),
    FheInt40(Unsupported),
    FheInt48(Unsupported),
    FheInt56(Unsupported),
    FheInt72(Unsupported),
    FheInt80(Unsupported),
    FheInt88(Unsupported),
    FheInt96(Unsupported),
    FheInt104(Unsupported),
    FheInt112(Unsupported),
    FheInt120(Unsupported),
    FheInt136(Unsupported),
    FheInt144(Unsupported),
    FheInt152(Unsupported),
    FheInt168(Unsupported),
    FheInt176(Unsupported),
    FheInt184(Unsupported),
    FheInt192(Unsupported),
    FheInt200(Unsupported),
    FheInt208(Unsupported),
    FheInt216(Unsupported),
    FheInt224(Unsupported),
    FheInt232(Unsupported),
    FheInt240(Unsupported),
    FheInt248(Unsupported),
    // big endian unsigned integer bytes
    Scalar(Vec<u8>),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, strum::EnumIter)]
#[repr(i8)]
pub enum SupportedFheOperations {
    FheAdd = 0,
    FheSub = 1,
    FheMul = 2,
    FheDiv = 3,
    FheRem = 4,
    FheBitAnd = 5,
    FheBitOr = 6,
    FheBitXor = 7,
    FheShl = 8,
    FheShr = 9,
    FheRotl = 10,
    FheRotr = 11,
    FheEq = 12,
    FheNe = 13,
    FheGe = 14,
    FheGt = 15,
    FheLe = 16,
    FheLt = 17,
    FheMin = 18,
    FheMax = 19,
    FheNeg = 20,
    FheNot = 21,
    FheCast = 23,
    FheTrivialEncrypt = 24,
    FheIfThenElse = 25,
    FheRand = 26,
    FheRandBounded = 27,
    FheGetInputCiphertext = 32,
}

#[derive(PartialEq, Eq)]
pub enum FheOperationType {
    Binary,
    Unary,
    Other,
}


fn decrypt_big(ct: &impl FheDecrypt<StaticUnsignedBigInt<256>>, client_key: &tfhe::ClientKey) -> String {
    let dec = FheDecrypt::<StaticUnsignedBigInt<256>>::decrypt(ct, client_key);
    let mut slice: [u8; 256*8] = [0; 256*8];
    dec.copy_to_be_byte_slice(&mut slice);
    BigInt::from_bytes_be(bigdecimal::num_bigint::Sign::Plus, &slice).to_string()
}

fn decrypt_big_signed(ct: &impl FheDecrypt<StaticSignedBigInt<256>>, client_key: &tfhe::ClientKey) -> String {
    let dec = FheDecrypt::<StaticSignedBigInt<256>>::decrypt(ct, client_key);
    let dec_abs = dec.wrapping_abs();
    let dec_unsigned = StaticUnsignedBigInt::<256>::from(dec_abs.data().clone());
    let mut slice: [u8; 256*8] = [0; 256*8];
    if dec.ge(&StaticSignedBigInt::<256>::ZERO) {
        dec_unsigned.copy_to_be_byte_slice(&mut slice);
        BigInt::from_bytes_be(bigdecimal::num_bigint::Sign::Plus, &slice).to_string()
    } else {
        dec_unsigned.copy_to_be_byte_slice(&mut slice);
        BigInt::from_bytes_be(bigdecimal::num_bigint::Sign::Minus, &slice).to_string()
    }
}

impl SupportedFheCiphertexts {
    pub fn serialize(&self) -> (i16, Vec<u8>) {
        use SupportedFheCiphertexts as S;
        let type_num = self.type_num();
        match self {
            S::FheBool(v) => (type_num, safe_serialize(v)),
            S::FheUint4(v) => (type_num, safe_serialize(v)),
            S::FheUint8(v) => (type_num, safe_serialize(v)),
            S::FheUint16(v) => (type_num, safe_serialize(v)),
            S::FheUint32(v) => (type_num, safe_serialize(v)),
            S::FheUint64(v) => (type_num, safe_serialize(v)),
            S::FheUint128(v) => (type_num, safe_serialize(v)),
            S::FheUint160(v) => (type_num, safe_serialize(v)),
            S::FheUint256(v) => (type_num, safe_serialize(v)),
            S::FheBytes64(v) => (type_num, safe_serialize(v)),
            S::FheBytes128(v) => (type_num, safe_serialize(v)),
            S::FheBytes256(v) => (type_num, safe_serialize(v)),
            S::FheUint2(v) => (type_num, safe_serialize(v)),
            S::FheUint6(v) => (type_num, safe_serialize(v)),
            S::FheUint10(v) => (type_num, safe_serialize(v)),
            S::FheUint12(v) => (type_num, safe_serialize(v)),
            S::FheUint14(v) => (type_num, safe_serialize(v)),
            S::FheInt2(v) => (type_num, safe_serialize(v)),
            S::FheInt4(v) => (type_num, safe_serialize(v)),
            S::FheInt6(v) => (type_num, safe_serialize(v)),
            S::FheInt8(v) => (type_num, safe_serialize(v)),
            S::FheInt10(v) => (type_num, safe_serialize(v)),
            S::FheInt12(v) => (type_num, safe_serialize(v)),
            S::FheInt14(v) => (type_num, safe_serialize(v)),
            S::FheInt16(v) => (type_num, safe_serialize(v)),
            S::FheInt32(v) => (type_num, safe_serialize(v)),
            S::FheInt64(v) => (type_num, safe_serialize(v)),
            S::FheInt128(v) => (type_num, safe_serialize(v)),
            S::FheInt160(v) => (type_num, safe_serialize(v)),
            S::FheInt256(v) => (type_num, safe_serialize(v)),
            S::FheAsciiString(()) | S::FheInt512(()) | S::FheInt1024(()) | S::FheInt2048(()) |
            S::FheUint24(()) | S::FheUint40(()) | S::FheUint48(()) | S::FheUint56(()) |S::FheUint72(()) |
            S::FheUint80(()) | S::FheUint88(()) | S::FheUint96(()) | S::FheUint104(()) |
            S::FheUint112(()) | S::FheUint120(()) | S::FheUint136(()) | S::FheUint144(()) |
            S::FheUint152(()) | S::FheUint168(()) | S::FheUint176(()) | S::FheUint184(()) |
            S::FheUint192(()) | S::FheUint200(()) | S::FheUint208(()) | S::FheUint216(()) |
            S::FheUint224(()) | S::FheUint232(()) | S::FheUint240(()) | S::FheUint248(()) |
            S::FheInt24(()) | S::FheInt40(()) | S::FheInt48(()) | S::FheInt56(()) |
            S::FheInt72(()) | S::FheInt80(()) | S::FheInt88(()) | S::FheInt96(()) |
            S::FheInt104(()) | S::FheInt112(()) | S::FheInt120(()) | S::FheInt136(()) |
            S::FheInt144(()) | S::FheInt152(()) | S::FheInt168(()) | S::FheInt176(()) |
            S::FheInt184(()) | S::FheInt192(()) | S::FheInt200(()) | S::FheInt208(()) |
            S::FheInt216(()) | S::FheInt224(()) | S::FheInt232(()) | S::FheInt240(()) |
            S::FheInt248(())
            => {
                panic!("unsupported ciphertext")
            }
            S::Scalar(_) => {
                panic!("we should never need to serialize scalar")
            }
        }
    }

    pub fn to_ciphertext64(self) -> Vec<Ciphertext> {
        use SupportedFheCiphertexts as S;
        match self {
            S::FheBool(v) => {
                BaseRadixCiphertext::from(vec![v.into_raw_parts()]).into_blocks()
            }
            S::FheUint4(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint8(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint16(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint32(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint64(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint128(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint160(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint256(v) => v.into_raw_parts().0.into_blocks(),
            S::FheBytes64(v) => v.into_raw_parts().0.into_blocks(),
            S::FheBytes128(v) => v.into_raw_parts().0.into_blocks(),
            S::FheBytes256(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint2(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint6(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint10(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint12(v) => v.into_raw_parts().0.into_blocks(),
            S::FheUint14(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt2(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt4(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt6(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt8(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt10(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt12(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt14(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt16(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt32(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt64(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt128(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt160(v) => v.into_raw_parts().0.into_blocks(),
            S::FheInt256(v) => v.into_raw_parts().0.into_blocks(),
            S::FheAsciiString(()) | S::FheInt512(()) | S::FheInt1024(()) | S::FheInt2048(()) |
            S::FheUint24(()) | S::FheUint40(()) | S::FheUint48(()) | S::FheUint56(()) |S::FheUint72(()) |
            S::FheUint80(()) | S::FheUint88(()) | S::FheUint96(()) | S::FheUint104(()) |
            S::FheUint112(()) | S::FheUint120(()) | S::FheUint136(()) | S::FheUint144(()) |
            S::FheUint152(()) | S::FheUint168(()) | S::FheUint176(()) | S::FheUint184(()) |
            S::FheUint192(()) | S::FheUint200(()) | S::FheUint208(()) | S::FheUint216(()) |
            S::FheUint224(()) | S::FheUint232(()) | S::FheUint240(()) | S::FheUint248(()) |
            S::FheInt24(()) | S::FheInt40(()) | S::FheInt48(()) | S::FheInt56(()) |
            S::FheInt72(()) | S::FheInt80(()) | S::FheInt88(()) | S::FheInt96(()) |
            S::FheInt104(()) | S::FheInt112(()) | S::FheInt120(()) | S::FheInt136(()) |
            S::FheInt144(()) | S::FheInt152(()) | S::FheInt168(()) | S::FheInt176(()) |
            S::FheInt184(()) | S::FheInt192(()) | S::FheInt200(()) | S::FheInt208(()) |
            S::FheInt216(()) | S::FheInt224(()) | S::FheInt232(()) | S::FheInt240(()) |
            S::FheInt248(())
            => {
                panic!("unsupported ciphertext")
            }
            S::Scalar(_) => {
                panic!("scalar cannot be converted to regular ciphertext")
            }
        }
    }

    pub fn to_unsigned_radix_ciphertext(self) -> Result<RadixCiphertext, FhevmError> {
        use SupportedFheCiphertexts as S;
        match self {
            S::FheBool(..) => Err(FhevmError::BadInputs),
            S::FheUint4(v) => Ok(v.into_raw_parts().0),
            S::FheUint8(v) => Ok(v.into_raw_parts().0),
            S::FheUint16(v) => Ok(v.into_raw_parts().0),
            S::FheUint32(v) => Ok(v.into_raw_parts().0),
            S::FheUint64(v) => Ok(v.into_raw_parts().0),
            S::FheUint128(v) => Ok(v.into_raw_parts().0),
            S::FheUint160(v) => Ok(v.into_raw_parts().0),
            S::FheUint256(v) => Ok(v.into_raw_parts().0),
            S::FheBytes64(v) => Ok(v.into_raw_parts().0),
            S::FheBytes128(v) => Ok(v.into_raw_parts().0),
            S::FheBytes256(v) => Ok(v.into_raw_parts().0),
            S::FheUint2(v) => Ok(v.into_raw_parts().0),
            S::FheUint6(v) => Ok(v.into_raw_parts().0),
            S::FheUint10(v) => Ok(v.into_raw_parts().0),
            S::FheUint12(v) => Ok(v.into_raw_parts().0),
            S::FheUint14(v) => Ok(v.into_raw_parts().0),

            S::FheInt2(_) | S::FheInt4(_) | S::FheInt6(_) | S::FheInt8(_) | S::FheInt10(_) |
            S::FheInt12(_) | S::FheInt14(_) | S::FheInt16(_) | S::FheInt32(_) | S::FheInt64(_) |
            S::FheInt128(_) | S::FheInt160(_) | S::FheInt256(_)
            => Err(FhevmError::BadInputs),

            S::FheAsciiString(()) | S::FheInt512(()) | S::FheInt1024(()) | S::FheInt2048(()) |
            S::FheUint24(()) | S::FheUint40(()) | S::FheUint48(()) | S::FheUint56(()) |S::FheUint72(()) |
            S::FheUint80(()) | S::FheUint88(()) | S::FheUint96(()) | S::FheUint104(()) |
            S::FheUint112(()) | S::FheUint120(()) | S::FheUint136(()) | S::FheUint144(()) |
            S::FheUint152(()) | S::FheUint168(()) | S::FheUint176(()) | S::FheUint184(()) |
            S::FheUint192(()) | S::FheUint200(()) | S::FheUint208(()) | S::FheUint216(()) |
            S::FheUint224(()) | S::FheUint232(()) | S::FheUint240(()) | S::FheUint248(()) |
            S::FheInt24(()) | S::FheInt40(()) | S::FheInt48(()) | S::FheInt56(()) |
            S::FheInt72(()) | S::FheInt80(()) | S::FheInt88(()) | S::FheInt96(()) |
            S::FheInt104(()) | S::FheInt112(()) | S::FheInt120(()) | S::FheInt136(()) |
            S::FheInt144(()) | S::FheInt152(()) | S::FheInt168(()) | S::FheInt176(()) |
            S::FheInt184(()) | S::FheInt192(()) | S::FheInt200(()) | S::FheInt208(()) |
            S::FheInt216(()) | S::FheInt224(()) | S::FheInt232(()) | S::FheInt240(()) |
            S::FheInt248(())
            => Err(FhevmError::BadInputs),
            S::Scalar(_)
            => Err(FhevmError::BadInputs),
        }
    }

    pub fn to_signed_radix_ciphertext(self) -> Result<SignedRadixCiphertext, FhevmError> {
        use SupportedFheCiphertexts as S;
        match self {
            S::FheInt2(v) => Ok(v.into_raw_parts().0),
            S::FheInt4(v) => Ok(v.into_raw_parts().0),
            S::FheInt6(v) => Ok(v.into_raw_parts().0),
            S::FheInt8(v) => Ok(v.into_raw_parts().0),
            S::FheInt10(v) => Ok(v.into_raw_parts().0),
            S::FheInt12(v) => Ok(v.into_raw_parts().0),
            S::FheInt14(v) => Ok(v.into_raw_parts().0),
            S::FheInt16(v) => Ok(v.into_raw_parts().0),
            S::FheInt32(v) => Ok(v.into_raw_parts().0),
            S::FheInt64(v) => Ok(v.into_raw_parts().0),
            S::FheInt128(v) => Ok(v.into_raw_parts().0),
            S::FheInt160(v) => Ok(v.into_raw_parts().0),
            S::FheInt256(v) => Ok(v.into_raw_parts().0),

            S::FheBool(_) | S::FheUint2(_) | S::FheUint4(_) | S::FheUint6(_) | S::FheUint8(_) |
            S::FheUint10(_) | S::FheUint12(_) | S::FheUint14(_) | S::FheUint16(_) | S::FheUint32(_) |
            S::FheUint64(_) | S::FheUint128(_) | S::FheUint160(_) | S::FheUint256(_) |
            S::FheBytes64(_) | S::FheBytes128(_) | S::FheBytes256(_)
            => Err(FhevmError::BadInputs),

            S::FheAsciiString(()) | S::FheInt512(()) | S::FheInt1024(()) | S::FheInt2048(()) |
            S::FheUint24(()) | S::FheUint40(()) | S::FheUint48(()) | S::FheUint56(()) |S::FheUint72(()) |
            S::FheUint80(()) | S::FheUint88(()) | S::FheUint96(()) | S::FheUint104(()) |
            S::FheUint112(()) | S::FheUint120(()) | S::FheUint136(()) | S::FheUint144(()) |
            S::FheUint152(()) | S::FheUint168(()) | S::FheUint176(()) | S::FheUint184(()) |
            S::FheUint192(()) | S::FheUint200(()) | S::FheUint208(()) | S::FheUint216(()) |
            S::FheUint224(()) | S::FheUint232(()) | S::FheUint240(()) | S::FheUint248(()) |
            S::FheInt24(()) | S::FheInt40(()) | S::FheInt48(()) | S::FheInt56(()) |
            S::FheInt72(()) | S::FheInt80(()) | S::FheInt88(()) | S::FheInt96(()) |
            S::FheInt104(()) | S::FheInt112(()) | S::FheInt120(()) | S::FheInt136(()) |
            S::FheInt144(()) | S::FheInt152(()) | S::FheInt168(()) | S::FheInt176(()) |
            S::FheInt184(()) | S::FheInt192(()) | S::FheInt200(()) | S::FheInt208(()) |
            S::FheInt216(()) | S::FheInt224(()) | S::FheInt232(()) | S::FheInt240(()) |
            S::FheInt248(())
            => Err(FhevmError::BadInputs),
            S::Scalar(_)
            => Err(FhevmError::BadInputs),
        }
    }

    pub fn type_num(&self) -> i16 {
        use SupportedFheCiphertexts as S;
        match self {
            // values taken to match with solidity library
            S::FheBool(_) => 0,
            S::FheUint4(_) => 1,
            S::FheUint8(_) => 2,
            S::FheUint16(_) => 3,
            S::FheUint32(_) => 4,
            S::FheUint64(_) => 5,
            S::FheUint128(_) => 6,
            S::FheUint160(_) => 7,
            S::FheUint256(_) => 8,
            S::FheBytes64(_) => 9,
            S::FheBytes128(_) => 10,
            S::FheBytes256(_) => 11,
            S::FheUint2(_) => 12,
            S::FheUint6(_) => 13,
            S::FheUint10(_) => 14,
            S::FheUint12(_) => 15,
            S::FheUint14(_) => 16,
            S::FheInt2(_) => 17,
            S::FheInt4(_) => 18,
            S::FheInt6(_) => 19,
            S::FheInt8(_) => 20,
            S::FheInt10(_) => 21,
            S::FheInt12(_) => 22,
            S::FheInt14(_) => 23,
            S::FheInt16(_) => 24,
            S::FheInt32(_) => 25,
            S::FheInt64(_) => 26,
            S::FheInt128(_) => 27,
            S::FheInt160(_) => 28,
            S::FheInt256(_) => 29,
            S::FheAsciiString(_) => 30,
            S::FheInt512(_) => 31,
            S::FheInt1024(_) => 32,
            S::FheInt2048(_) => 33,
            S::FheUint24(_) => 34,
            S::FheUint40(_) => 35,
            S::FheUint48(_) => 36,
            S::FheUint56(_) => 37,
            S::FheUint72(_) => 38,
            S::FheUint80(_) => 39,
            S::FheUint88(_) => 40,
            S::FheUint96(_) => 41,
            S::FheUint104(_) => 42,
            S::FheUint112(_) => 43,
            S::FheUint120(_) => 44,
            S::FheUint136(_) => 45,
            S::FheUint144(_) => 46,
            S::FheUint152(_) => 47,
            S::FheUint168(_) => 48,
            S::FheUint176(_) => 49,
            S::FheUint184(_) => 50,
            S::FheUint192(_) => 51,
            S::FheUint200(_) => 52,
            S::FheUint208(_) => 53,
            S::FheUint216(_) => 54,
            S::FheUint224(_) => 55,
            S::FheUint232(_) => 56,
            S::FheUint240(_) => 57,
            S::FheUint248(_) => 58,
            S::FheInt24(_) => 59,
            S::FheInt40(_) => 60,
            S::FheInt48(_) => 61,
            S::FheInt56(_) => 62,
            S::FheInt72(_) => 63,
            S::FheInt80(_) => 64,
            S::FheInt88(_) => 65,
            S::FheInt96(_) => 66,
            S::FheInt104(_) => 67,
            S::FheInt112(_) => 68,
            S::FheInt120(_) => 69,
            S::FheInt136(_) => 70,
            S::FheInt144(_) => 71,
            S::FheInt152(_) => 72,
            S::FheInt168(_) => 73,
            S::FheInt176(_) => 74,
            S::FheInt184(_) => 75,
            S::FheInt192(_) => 76,
            S::FheInt200(_) => 77,
            S::FheInt208(_) => 78,
            S::FheInt216(_) => 79,
            S::FheInt224(_) => 80,
            S::FheInt232(_) => 81,
            S::FheInt240(_) => 82,
            S::FheInt248(_) => 83,
            S::Scalar(_) => {
                // need this for tracing as we join types of computation for a trace
                200
            }
        }
    }

    pub fn is_same_type(&self, other: &SupportedFheCiphertexts) -> bool {
        self.type_num() == other.type_num()
    }

    pub fn is_signed(&self) -> bool {
        use SupportedFheCiphertexts as S;
        match self {
            S::FheBool(_) => false,
            // Fixed size unsigned integers
            S::FheUint2(_) | S::FheUint4(_) | S::FheUint6(_) | S::FheUint8(_) |
            S::FheUint16(_) | S::FheUint32(_) | S::FheUint64(_) | S::FheUint128(_) |
            S::FheUint160(_) | S::FheUint256(_) => false,
            // Bytes
            S::FheBytes64(_) | S::FheBytes128(_) | S::FheBytes256(_) => false,
            // Fixed size unsigned integers
            S::FheUint10(_) | S::FheUint12(_) | S::FheUint14(_) => false,
            // Fixed size signed integers
            S::FheInt2(_) | S::FheInt4(_) | S::FheInt6(_) | S::FheInt8(_) |
            S::FheInt10(_) | S::FheInt12(_) | S::FheInt14(_) | S::FheInt16(_) |
            S::FheInt32(_) | S::FheInt64(_) | S::FheInt128(_) | S::FheInt160(_) |
            S::FheInt256(_) => true,
            // Ascii string
            S::FheAsciiString(_) => true,
            // Fixed size signed integers
            S::FheInt512(_) | S::FheInt1024(_) | S::FheInt2048(_) => true,
            // Fixed size unsigned integers
            S::FheUint24(_) | S::FheUint40(_) | S::FheUint48(_) | S::FheUint56(_) |
            S::FheUint72(_) | S::FheUint80(_) | S::FheUint88(_) | S::FheUint96(_) |
            S::FheUint104(_) | S::FheUint112(_) | S::FheUint120(_) | S::FheUint136(_) |
            S::FheUint144(_) | S::FheUint152(_) | S::FheUint168(_) | S::FheUint176(_) |
            S::FheUint184(_) | S::FheUint192(_) | S::FheUint200(_) | S::FheUint208(_) |
            S::FheUint216(_) | S::FheUint224(_) | S::FheUint232(_) | S::FheUint240(_) |
            S::FheUint248(_) => false,
            // Variable size signed integers
            S::FheInt24(_) | S::FheInt40(_) | S::FheInt48(_) | S::FheInt56(_) |
            S::FheInt72(_) | S::FheInt80(_) | S::FheInt88(_) | S::FheInt96(_) |
            S::FheInt104(_) | S::FheInt112(_) | S::FheInt120(_) | S::FheInt136(_) |
            S::FheInt144(_) | S::FheInt152(_) | S::FheInt168(_) | S::FheInt176(_) |
            S::FheInt184(_) | S::FheInt192(_) | S::FheInt200(_) | S::FheInt208(_) |
            S::FheInt216(_) | S::FheInt224(_) | S::FheInt232(_) | S::FheInt240(_) |
            S::FheInt248(_) => true,
            S::Scalar(_) => false,
        }
    }
    pub fn type_name(&self) -> &'static str {
        match self {
            SupportedFheCiphertexts::FheBool(..) => "FheBool",
            SupportedFheCiphertexts::FheUint4(..) => "FheUint4",
            SupportedFheCiphertexts::FheUint8(..) => "FheUint8",
            SupportedFheCiphertexts::FheUint16(..) => "FheUint16",
            SupportedFheCiphertexts::FheUint32(..) => "FheUint32",
            SupportedFheCiphertexts::FheUint64(..) => "FheUint64",
            SupportedFheCiphertexts::FheUint128(..) => "FheUint128",
            SupportedFheCiphertexts::FheUint160(..) => "FheUint160",
            SupportedFheCiphertexts::FheUint256(..) => "FheUint256",
            SupportedFheCiphertexts::FheBytes64(..) => "FheBytes64",
            SupportedFheCiphertexts::FheBytes128(..) => "FheBytes128",
            SupportedFheCiphertexts::FheBytes256(..) => "FheBytes256",
            SupportedFheCiphertexts::FheUint2(..) => "FheUint2",
            SupportedFheCiphertexts::FheUint6(..) => "FheUint6",
            SupportedFheCiphertexts::FheUint10(..) => "FheUint10",
            SupportedFheCiphertexts::FheUint12(..) => "FheUint12",
            SupportedFheCiphertexts::FheUint14(..) => "FheUint14",
            SupportedFheCiphertexts::FheInt2(..) => "FheInt2",
            SupportedFheCiphertexts::FheInt4(..) => "FheInt4",
            SupportedFheCiphertexts::FheInt6(..) => "FheInt6",
            SupportedFheCiphertexts::FheInt8(..) => "FheInt8",
            SupportedFheCiphertexts::FheInt10(..) => "FheInt10",
            SupportedFheCiphertexts::FheInt12(..) => "FheInt12",
            SupportedFheCiphertexts::FheInt14(..) => "FheInt14",
            SupportedFheCiphertexts::FheInt16(..) => "FheInt16",
            SupportedFheCiphertexts::FheInt32(..) => "FheInt32",
            SupportedFheCiphertexts::FheInt64(..) => "FheInt64",
            SupportedFheCiphertexts::FheInt128(..) => "FheInt128",
            SupportedFheCiphertexts::FheInt160(..) => "FheInt160",
            SupportedFheCiphertexts::FheInt256(..) => "FheInt256",
            SupportedFheCiphertexts::FheAsciiString(..) => "FheAsciiString",
            SupportedFheCiphertexts::FheInt512(..) => "FheInt512",
            SupportedFheCiphertexts::FheInt1024(..) => "FheInt1024",
            SupportedFheCiphertexts::FheInt2048(..) => "FheInt2048",
            SupportedFheCiphertexts::FheInt24(..) => "FheInt24",
            SupportedFheCiphertexts::FheInt40(..) => "FheInt40",
            SupportedFheCiphertexts::FheInt48(..) => "FheInt48",
            SupportedFheCiphertexts::FheInt56(..) => "FheInt56",
            SupportedFheCiphertexts::FheInt72(..) => "FheInt72",
            SupportedFheCiphertexts::FheInt80(..) => "FheInt80",
            SupportedFheCiphertexts::FheInt88(..) => "FheInt88",
            SupportedFheCiphertexts::FheInt96(..) => "FheInt96",
            SupportedFheCiphertexts::FheInt104(..) => "FheInt104",
            SupportedFheCiphertexts::FheInt112(..) => "FheInt112",
            SupportedFheCiphertexts::FheInt120(..) => "FheInt120",
            SupportedFheCiphertexts::FheInt136(..) => "FheInt136",
            SupportedFheCiphertexts::FheInt144(..) => "FheInt144",
            SupportedFheCiphertexts::FheInt152(..) => "FheInt152",
            SupportedFheCiphertexts::FheInt168(..) => "FheInt168",
            SupportedFheCiphertexts::FheInt176(..) => "FheInt176",
            SupportedFheCiphertexts::FheInt184(..) => "FheInt184",
            SupportedFheCiphertexts::FheInt192(..) => "FheInt192",
            SupportedFheCiphertexts::FheInt200(..) => "FheInt200",
            SupportedFheCiphertexts::FheInt208(..) => "FheInt208",
            SupportedFheCiphertexts::FheInt216(..) => "FheInt216",
            SupportedFheCiphertexts::FheInt224(..) => "FheInt224",
            SupportedFheCiphertexts::FheInt232(..) => "FheInt232",
            SupportedFheCiphertexts::FheInt240(..) => "FheInt240",
            SupportedFheCiphertexts::FheInt248(..) => "FheInt248",
            SupportedFheCiphertexts::FheUint24(..) => "FheUint24",
            SupportedFheCiphertexts::FheUint40(..) => "FheUint40",
            SupportedFheCiphertexts::FheUint48(..) => "FheUint48",
            SupportedFheCiphertexts::FheUint56(..) => "FheUint56",
            SupportedFheCiphertexts::FheUint72(..) => "FheUint72",
            SupportedFheCiphertexts::FheUint80(..) => "FheUint80",
            SupportedFheCiphertexts::FheUint88(..) => "FheUint88",
            SupportedFheCiphertexts::FheUint96(..) => "FheUint96",
            SupportedFheCiphertexts::FheUint104(..) => "FheUint104",
            SupportedFheCiphertexts::FheUint112(..) => "FheUint112",
            SupportedFheCiphertexts::FheUint120(..) => "FheUint120",
            SupportedFheCiphertexts::FheUint136(..) => "FheUint136",
            SupportedFheCiphertexts::FheUint144(..) => "FheUint144",
            SupportedFheCiphertexts::FheUint152(..) => "FheUint152",
            SupportedFheCiphertexts::FheUint168(..) => "FheUint168",
            SupportedFheCiphertexts::FheUint176(..) => "FheUint176",
            SupportedFheCiphertexts::FheUint184(..) => "FheUint184",
            SupportedFheCiphertexts::FheUint192(..) => "FheUint192",
            SupportedFheCiphertexts::FheUint200(..) => "FheUint200",
            SupportedFheCiphertexts::FheUint208(..) => "FheUint208",
            SupportedFheCiphertexts::FheUint216(..) => "FheUint216",
            SupportedFheCiphertexts::FheUint224(..) => "FheUint224",
            SupportedFheCiphertexts::FheUint232(..) => "FheUint232",
            SupportedFheCiphertexts::FheUint240(..) => "FheUint240",
            SupportedFheCiphertexts::FheUint248(..) => "FheUint248",
            SupportedFheCiphertexts::Scalar(..) => "Scalar",
        }
    }


    pub fn decrypt(&self, client_key: &tfhe::ClientKey) -> String {
        use SupportedFheCiphertexts as S;
        match self {
            S::FheBool(v) => v.decrypt(client_key).to_string(),
            S::FheUint4(v) => decrypt_big(v, client_key),
            S::FheUint8(v) => decrypt_big(v, client_key),
            S::FheUint16(v) => decrypt_big(v, client_key),
            S::FheUint32(v) => decrypt_big(v, client_key),
            S::FheUint64(v) => decrypt_big(v, client_key),
            S::FheUint128(v) => decrypt_big(v, client_key),
            S::FheUint160(v) => decrypt_big(v, client_key),
            S::FheUint256(v) => decrypt_big(v, client_key),
            S::FheBytes64(v) => decrypt_big(v, client_key),
            S::FheBytes128(v) => decrypt_big(v, client_key),
            S::FheBytes256(v) => decrypt_big(v, client_key),
            S::FheUint2(v) => decrypt_big(v, client_key),
            S::FheUint6(v) => decrypt_big(v, client_key),
            S::FheUint10(v) => decrypt_big(v, client_key),
            S::FheUint12(v) => decrypt_big(v, client_key),
            S::FheUint14(v) => decrypt_big(v, client_key),
            S::FheInt2(v) => decrypt_big_signed(v, client_key),
            S::FheInt4(v) => decrypt_big_signed(v, client_key),
            S::FheInt6(v) => decrypt_big_signed(v, client_key),
            S::FheInt8(v) => decrypt_big_signed(v, client_key),
            S::FheInt10(v) => decrypt_big_signed(v, client_key),
            S::FheInt12(v) => decrypt_big_signed(v, client_key),
            S::FheInt14(v) => decrypt_big_signed(v, client_key),
            S::FheInt16(v) => decrypt_big_signed(v, client_key),
            S::FheInt32(v) => decrypt_big_signed(v, client_key),
            S::FheInt64(v) => decrypt_big_signed(v, client_key),
            S::FheInt128(v) => decrypt_big_signed(v, client_key),
            S::FheInt160(v) => decrypt_big_signed(v, client_key),
            S::FheInt256(v) => decrypt_big_signed(v, client_key),
            S::FheAsciiString(()) | S::FheInt512(()) | S::FheInt1024(()) | S::FheInt2048(()) |
            S::FheUint24(()) | S::FheUint40(()) | S::FheUint48(()) | S::FheUint56(()) |S::FheUint72(()) |
            S::FheUint80(()) | S::FheUint88(()) | S::FheUint96(()) | S::FheUint104(()) |
            S::FheUint112(()) | S::FheUint120(()) | S::FheUint136(()) | S::FheUint144(()) |
            S::FheUint152(()) | S::FheUint168(()) | S::FheUint176(()) | S::FheUint184(()) |
            S::FheUint192(()) | S::FheUint200(()) | S::FheUint208(()) | S::FheUint216(()) |
            S::FheUint224(()) | S::FheUint232(()) | S::FheUint240(()) | S::FheUint248(()) |
            S::FheInt24(()) | S::FheInt40(()) | S::FheInt48(()) | S::FheInt56(()) |
            S::FheInt72(()) | S::FheInt80(()) | S::FheInt88(()) | S::FheInt96(()) |
            S::FheInt104(()) | S::FheInt112(()) | S::FheInt120(()) | S::FheInt136(()) |
            S::FheInt144(()) | S::FheInt152(()) | S::FheInt168(()) | S::FheInt176(()) |
            S::FheInt184(()) | S::FheInt192(()) | S::FheInt200(()) | S::FheInt208(()) |
            S::FheInt216(()) | S::FheInt224(()) | S::FheInt232(()) | S::FheInt240(()) |
            S::FheInt248(())
            => {
                panic!("unsupported ciphertext")
            }
            S::Scalar(..) => {
                panic!("unsupported scalar decryption")
            },
        }
    }

    pub fn compress(&self) -> (i16, Vec<u8>) {
        use SupportedFheCiphertexts as S;
        let type_num = self.type_num();
        let mut builder = CompressedCiphertextListBuilder::new();
        match self.clone() {
            S::FheBool(c) => builder.push(c),
            S::FheUint4(c) => builder.push(c),
            S::FheUint8(c) => builder.push(c),
            S::FheUint16(c) => builder.push(c),
            S::FheUint32(c) => builder.push(c),
            S::FheUint64(c) => builder.push(c),
            S::FheUint128(c) => builder.push(c),
            S::FheUint160(c) => builder.push(c),
            S::FheUint256(c) => builder.push(c),
            S::FheBytes64(c) => builder.push(c),
            S::FheBytes128(c) => builder.push(c),
            S::FheBytes256(c) => builder.push(c),
            S::FheUint2(c) => builder.push(c),
            S::FheUint6(c) => builder.push(c),
            S::FheUint10(c) => builder.push(c),
            S::FheUint12(c) => builder.push(c),
            S::FheUint14(c) => builder.push(c),
            S::FheInt2(c) => builder.push(c),
            S::FheInt4(c) => builder.push(c),
            S::FheInt6(c) => builder.push(c),
            S::FheInt8(c) => builder.push(c),
            S::FheInt10(c) => builder.push(c),
            S::FheInt12(c) => builder.push(c),
            S::FheInt14(c) => builder.push(c),
            S::FheInt16(c) => builder.push(c),
            S::FheInt32(c) => builder.push(c),
            S::FheInt64(c) => builder.push(c),
            S::FheInt128(c) => builder.push(c),
            S::FheInt160(c) => builder.push(c),
            S::FheInt256(c) => builder.push(c),
            S::FheAsciiString(()) | S::FheInt512(()) | S::FheInt1024(()) | S::FheInt2048(()) |
            S::FheUint24(()) | S::FheUint40(()) | S::FheUint48(()) | S::FheUint56(()) |S::FheUint72(()) |
            S::FheUint80(()) | S::FheUint88(()) | S::FheUint96(()) | S::FheUint104(()) |
            S::FheUint112(()) | S::FheUint120(()) | S::FheUint136(()) | S::FheUint144(()) |
            S::FheUint152(()) | S::FheUint168(()) | S::FheUint176(()) | S::FheUint184(()) |
            S::FheUint192(()) | S::FheUint200(()) | S::FheUint208(()) | S::FheUint216(()) |
            S::FheUint224(()) | S::FheUint232(()) | S::FheUint240(()) | S::FheUint248(()) |
            S::FheInt24(()) | S::FheInt40(()) | S::FheInt48(()) | S::FheInt56(()) |
            S::FheInt72(()) | S::FheInt80(()) | S::FheInt88(()) | S::FheInt96(()) |
            S::FheInt104(()) | S::FheInt112(()) | S::FheInt120(()) | S::FheInt136(()) |
            S::FheInt144(()) | S::FheInt152(()) | S::FheInt168(()) | S::FheInt176(()) |
            S::FheInt184(()) | S::FheInt192(()) | S::FheInt200(()) | S::FheInt208(()) |
            S::FheInt216(()) | S::FheInt224(()) | S::FheInt232(()) | S::FheInt240(()) |
            S::FheInt248(())
            => {
                panic!("unsupported ciphertext")
            }
            S::Scalar(_) => {
                // TODO: Need to fix that, scalars are not ciphertexts.
                panic!("cannot compress a scalar");
            }
        };
        let list = builder.build().expect("ciphertext compression");
        (type_num, safe_serialize(&list))
    }

    pub fn decompress(ct_type: i16, list: &[u8]) -> Result<Self> {
        let list: CompressedCiphertextList = safe_deserialize(list)?;
        match ct_type {
            0 => Ok(SupportedFheCiphertexts::FheBool(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            1 => Ok(SupportedFheCiphertexts::FheUint4(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            2 => Ok(SupportedFheCiphertexts::FheUint8(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            3 => Ok(SupportedFheCiphertexts::FheUint16(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            4 => Ok(SupportedFheCiphertexts::FheUint32(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            5 => Ok(SupportedFheCiphertexts::FheUint64(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            6 => Ok(SupportedFheCiphertexts::FheUint128(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            7 => Ok(SupportedFheCiphertexts::FheUint160(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            8 => Ok(SupportedFheCiphertexts::FheUint256(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            9 => Ok(SupportedFheCiphertexts::FheBytes64(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            10 => Ok(SupportedFheCiphertexts::FheBytes128(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            11 => Ok(SupportedFheCiphertexts::FheBytes256(
                list.get(0)?.ok_or(FhevmError::MissingTfheRsData)?,
            )),
            _ => Err(FhevmError::UnknownFheType(ct_type as i32).into()),
        }
    }

    pub fn is_ebytes(&self) -> bool {
        use SupportedFheCiphertexts as S;
        match self {
            S::FheBytes64(_)
            | S::FheBytes128(_)
            | S::FheBytes256(_) => true,
            S::FheBool(_)
            | S::FheUint2(_)
            | S::FheUint4(_)
            | S::FheUint6(_)
            | S::FheUint8(_)
            | S::FheUint10(_)
            | S::FheUint12(_)
            | S::FheUint14(_)
            | S::FheUint16(_)
            | S::FheUint32(_)
            | S::FheUint64(_)
            | S::FheUint128(_)
            | S::FheUint160(_)
            | S::FheUint256(_)
            | S::FheUint24(_)
            | S::FheUint40(_)
            | S::FheUint48(_)
            | S::FheUint56(_)
            | S::FheUint72(_)
            | S::FheUint80(_)
            | S::FheUint88(_)
            | S::FheUint96(_)
            | S::FheUint104(_)
            | S::FheUint112(_)
            | S::FheUint120(_)
            | S::FheUint136(_)
            | S::FheUint144(_)
            | S::FheUint152(_)
            | S::FheUint168(_)
            | S::FheUint176(_)
            | S::FheUint184(_)
            | S::FheUint192(_)
            | S::FheUint200(_)
            | S::FheUint208(_)
            | S::FheUint216(_)
            | S::FheUint224(_)
            | S::FheUint232(_)
            | S::FheUint240(_)
            | S::FheUint248(_)
            | S::FheInt2(_)
            | S::FheInt4(_)
            | S::FheInt6(_)
            | S::FheInt8(_)
            | S::FheInt10(_)
            | S::FheInt12(_)
            | S::FheInt14(_)
            | S::FheInt16(_)
            | S::FheInt24(_)
            | S::FheInt32(_)
            | S::FheInt64(_)
            | S::FheInt128(_)
            | S::FheInt160(_)
            | S::FheInt256(_)
            | S::FheInt40(_)
            | S::FheInt48(_)
            | S::FheInt56(_)
            | S::FheInt72(_)
            | S::FheInt80(_)
            | S::FheInt88(_)
            | S::FheInt96(_)
            | S::FheInt104(_)
            | S::FheInt112(_)
            | S::FheInt120(_)
            | S::FheInt136(_)
            | S::FheInt144(_)
            | S::FheInt152(_)
            | S::FheInt168(_)
            | S::FheInt176(_)
            | S::FheInt184(_)
            | S::FheInt192(_)
            | S::FheInt200(_)
            | S::FheInt208(_)
            | S::FheInt216(_)
            | S::FheInt224(_)
            | S::FheInt232(_)
            | S::FheInt240(_)
            | S::FheInt248(_)
            | S::Scalar(_)
            => false,
            | S::FheAsciiString(()) | S::FheInt512(()) | S::FheInt1024(()) | S::FheInt2048(()) => {
                panic!("cannot check if this ciphertext is an ebytes");
            }
        }
    }
}

impl SupportedFheOperations {
    pub fn op_type(&self) -> FheOperationType {
        match self {
            SupportedFheOperations::FheAdd
            | SupportedFheOperations::FheSub
            | SupportedFheOperations::FheMul
            | SupportedFheOperations::FheDiv
            | SupportedFheOperations::FheRem
            | SupportedFheOperations::FheBitAnd
            | SupportedFheOperations::FheBitOr
            | SupportedFheOperations::FheBitXor
            | SupportedFheOperations::FheShl
            | SupportedFheOperations::FheShr
            | SupportedFheOperations::FheRotl
            | SupportedFheOperations::FheRotr
            | SupportedFheOperations::FheEq
            | SupportedFheOperations::FheNe
            | SupportedFheOperations::FheGe
            | SupportedFheOperations::FheGt
            | SupportedFheOperations::FheLe
            | SupportedFheOperations::FheLt
            | SupportedFheOperations::FheMin
            | SupportedFheOperations::FheMax => FheOperationType::Binary,
            SupportedFheOperations::FheNot | SupportedFheOperations::FheNeg => {
                FheOperationType::Unary
            }
            SupportedFheOperations::FheIfThenElse
            | SupportedFheOperations::FheCast
            | SupportedFheOperations::FheTrivialEncrypt
            | SupportedFheOperations::FheRand
            | SupportedFheOperations::FheRandBounded => FheOperationType::Other,
            SupportedFheOperations::FheGetInputCiphertext => FheOperationType::Other,
        }
    }

    pub fn is_comparison(&self) -> bool {
        matches!(
            self,
            SupportedFheOperations::FheEq
                | SupportedFheOperations::FheNe
                | SupportedFheOperations::FheGe
                | SupportedFheOperations::FheGt
                | SupportedFheOperations::FheLe
                | SupportedFheOperations::FheLt
        )
    }

    pub fn does_have_more_than_one_scalar(&self) -> bool {
        matches!(
            self,
            SupportedFheOperations::FheRand
                | SupportedFheOperations::FheRandBounded
                | SupportedFheOperations::FheTrivialEncrypt
        )
    }

    pub fn supports_bool_inputs(&self) -> bool {
        matches!(
            self,
            SupportedFheOperations::FheEq
                | SupportedFheOperations::FheNe
                | SupportedFheOperations::FheNot
                | SupportedFheOperations::FheBitAnd
                | SupportedFheOperations::FheBitOr
                | SupportedFheOperations::FheBitXor
        )
    }

    pub fn supports_ebytes_inputs(&self) -> bool {
        match self {
            SupportedFheOperations::FheBitAnd
            | SupportedFheOperations::FheBitOr
            | SupportedFheOperations::FheBitXor
            | SupportedFheOperations::FheShl
            | SupportedFheOperations::FheShr
            | SupportedFheOperations::FheRotl
            | SupportedFheOperations::FheRotr
            | SupportedFheOperations::FheEq
            | SupportedFheOperations::FheNe
            | SupportedFheOperations::FheNot
            | SupportedFheOperations::FheRand
            | SupportedFheOperations::FheRandBounded
            | SupportedFheOperations::FheIfThenElse
            | SupportedFheOperations::FheTrivialEncrypt
            | SupportedFheOperations::FheCast => true,
            SupportedFheOperations::FheGe
            | SupportedFheOperations::FheGt
            | SupportedFheOperations::FheLe
            | SupportedFheOperations::FheLt
            | SupportedFheOperations::FheMin
            | SupportedFheOperations::FheMax
            | SupportedFheOperations::FheNeg
            | SupportedFheOperations::FheAdd
            | SupportedFheOperations::FheSub
            | SupportedFheOperations::FheMul
            | SupportedFheOperations::FheDiv
            | SupportedFheOperations::FheRem
            | SupportedFheOperations::FheGetInputCiphertext => false,
        }
    }
}

impl TryFrom<i16> for SupportedFheOperations {
    type Error = FhevmError;

    fn try_from(value: i16) -> Result<Self, Self::Error> {
        let res = match value {
            0 => Ok(SupportedFheOperations::FheAdd),
            1 => Ok(SupportedFheOperations::FheSub),
            2 => Ok(SupportedFheOperations::FheMul),
            3 => Ok(SupportedFheOperations::FheDiv),
            4 => Ok(SupportedFheOperations::FheRem),
            5 => Ok(SupportedFheOperations::FheBitAnd),
            6 => Ok(SupportedFheOperations::FheBitOr),
            7 => Ok(SupportedFheOperations::FheBitXor),
            8 => Ok(SupportedFheOperations::FheShl),
            9 => Ok(SupportedFheOperations::FheShr),
            10 => Ok(SupportedFheOperations::FheRotl),
            11 => Ok(SupportedFheOperations::FheRotr),
            12 => Ok(SupportedFheOperations::FheEq),
            13 => Ok(SupportedFheOperations::FheNe),
            14 => Ok(SupportedFheOperations::FheGe),
            15 => Ok(SupportedFheOperations::FheGt),
            16 => Ok(SupportedFheOperations::FheLe),
            17 => Ok(SupportedFheOperations::FheLt),
            18 => Ok(SupportedFheOperations::FheMin),
            19 => Ok(SupportedFheOperations::FheMax),
            20 => Ok(SupportedFheOperations::FheNeg),
            21 => Ok(SupportedFheOperations::FheNot),
            23 => Ok(SupportedFheOperations::FheCast),
            24 => Ok(SupportedFheOperations::FheTrivialEncrypt),
            25 => Ok(SupportedFheOperations::FheIfThenElse),
            26 => Ok(SupportedFheOperations::FheRand),
            27 => Ok(SupportedFheOperations::FheRandBounded),
            32 => Ok(SupportedFheOperations::FheGetInputCiphertext),
            _ => Err(FhevmError::UnknownFheOperation(value as i32)),
        };

        // ensure we're always having the same value serialized back and forth
        if let Ok(v) = &res {
            assert_eq!(*v as i16, value);
        }

        res
    }
}

// we get i32 from protobuf (smaller types unsupported)
// but in database we store i16
impl TryFrom<i32> for SupportedFheOperations {
    type Error = FhevmError;

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        let initial_value: i16 = value
            .try_into()
            .map_err(|_| FhevmError::UnknownFheOperation(value))?;

        let final_value: Result<SupportedFheOperations, Self::Error> = initial_value.try_into();
        final_value
    }
}

impl From<SupportedFheOperations> for i16 {
    fn from(value: SupportedFheOperations) -> Self {
        value as i16
    }
}

pub type Handle = Vec<u8>;
pub const HANDLE_LEN: usize = 32;

pub fn get_ct_type(handle: &[u8]) -> Result<i16, FhevmError> {
    match handle.len() {
        HANDLE_LEN => Ok(handle[30] as i16),
        _ => Err(FhevmError::InvalidHandle),
    }
}

pub fn is_ebytes_type(inp: i16) -> bool {
    (9..=11).contains(&inp)
}

#[derive(Copy, Clone, Debug)]
pub enum AllowEvents {
    AllowedAccount = 0,
    AllowedForDecryption = 1,
}

pub enum AllowEventsError {
    InvalidValue(i16),
}

impl TryFrom<i16> for AllowEvents {
    type Error = AllowEventsError;
    fn try_from(value: i16) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(AllowEvents::AllowedAccount),
            1 => Ok(AllowEvents::AllowedForDecryption),
            _ => Err(AllowEventsError::InvalidValue(value)),
        }
    }
}
