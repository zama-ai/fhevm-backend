use tfhe::{integer::U256, prelude::FheDecrypt};

#[derive(Debug)]
pub enum CoprocessorError {
    DbError(sqlx::Error),
    Unauthorized,
    UnknownFheOperation(i32),
    UnknownFheType(i32),
    DuplicateOutputHandleInBatch(String),
    CiphertextHandleLongerThan64Bytes,
    CiphertextHandleMustBeAtLeast4Bytes(String),
    CiphertextHandleMustHaveEvenAmountOfHexNibblets(String),
    InvalidHandle(String),
    UnexistingInputCiphertextsFound(Vec<String>),
    OutputHandleIsAlsoInputHandle(String),
    UnknownCiphertextType(i16),
    TooManyCiphertextsInBatch {
        maximum_allowed: usize,
        got: usize,
    },
    CiphertextComputationDependencyLoopDetected {
        uncomputable_output_handle: String,
        uncomputable_handle_dependencies: Vec<String>,
    },
    UnexpectedOperandCountForFheOperation {
        fhe_operation: i32,
        fhe_operation_name: String,
        expected_operands: usize,
        got_operands: usize,
    },
    FheOperationDoesntSupportScalar {
        fhe_operation: i32,
        fhe_operation_name: String,
        scalar_requested: bool,
        scalar_supported: bool,
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
}

impl std::fmt::Display for CoprocessorError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CoprocessorError::DbError(dbe) => {
                write!(f, "Coprocessor db error: {:?}", dbe)
            }
            CoprocessorError::Unauthorized => {
                write!(f, "API key unknown/invalid/not provided")
            }
            CoprocessorError::UnknownFheOperation(op) => {
                write!(f, "Unknown fhe operation: {}", op)
            }
            CoprocessorError::UnknownFheType(op) => {
                write!(f, "Unknown fhe type: {}", op)
            }
            CoprocessorError::DuplicateOutputHandleInBatch(op) => {
                write!(f, "Duplicate output handle in ciphertext batch: {}", op)
            }
            CoprocessorError::CiphertextHandleLongerThan64Bytes => {
                write!(f, "Found ciphertext handle longer than 64 bytes")
            }
            CoprocessorError::CiphertextHandleMustBeAtLeast4Bytes(handle) => {
                write!(f, "Found ciphertext handle less than 4 bytes: {handle}")
            }
            CoprocessorError::CiphertextHandleMustHaveEvenAmountOfHexNibblets(handle) => {
                write!(f, "Found uneven amount of hex nibblets in handle, can't deserialize to bytes: {handle}")
            }
            CoprocessorError::InvalidHandle(handle) => {
                write!(f, "Invalid handle found: {}", handle)
            }
            CoprocessorError::UnexistingInputCiphertextsFound(handles) => {
                write!(f, "Ciphertexts not found: {:?}", handles)
            }
            CoprocessorError::OutputHandleIsAlsoInputHandle(handle) => {
                write!(f, "Output handle is also on of the input handles: {}", handle)
            }
            CoprocessorError::UnknownCiphertextType(the_type) => {
                write!(f, "Unknown input ciphertext type: {}", the_type)
            }
            CoprocessorError::UnexpectedOperandCountForFheOperation { fhe_operation, fhe_operation_name, expected_operands, got_operands } => {
                write!(f, "fhe operation number {fhe_operation} ({fhe_operation_name}) received unexpected operand count, expected: {expected_operands}, received: {got_operands}")
            },
            CoprocessorError::FheOperationDoesntSupportScalar { fhe_operation, fhe_operation_name, .. } => {
                write!(f, "fhe operation number {fhe_operation} ({fhe_operation_name}) doesn't support scalar computation")
            },
            CoprocessorError::FheOperationDoesntHaveUniformTypesAsInput { fhe_operation, fhe_operation_name, operand_types } => {
                write!(f, "fhe operation number {fhe_operation} ({fhe_operation_name}) expects uniform types as input, received: {:?}", operand_types)
            },
            CoprocessorError::CiphertextComputationDependencyLoopDetected { uncomputable_output_handle, uncomputable_handle_dependencies  } => {
                write!(f, "fhe computation with output handle {uncomputable_output_handle} with dependencies {:?} has circular dependency and is uncomputable", uncomputable_handle_dependencies)
            },
            CoprocessorError::TooManyCiphertextsInBatch { maximum_allowed, got } => {
                write!(f, "maximum ciphertexts exceeded in batch, maximum: {maximum_allowed}, got: {got}")
            },
            CoprocessorError::FheOperationScalarDivisionByZero { lhs_handle, rhs_value, fhe_operation, fhe_operation_name  } => {
                write!(f, "zero on the right side of scalar division, lhs handle: {lhs_handle}, rhs value: {rhs_value}, fhe operation: {fhe_operation} fhe operation name:{fhe_operation_name}")
            },
        }
    }
}

impl std::error::Error for CoprocessorError {}

impl From<sqlx::Error> for CoprocessorError {
    fn from(err: sqlx::Error) -> Self {
        CoprocessorError::DbError(err)
    }
}

impl From<CoprocessorError> for tonic::Status {
    fn from(err: CoprocessorError) -> Self {
        tonic::Status::from_error(Box::new(err))
    }
}

pub struct TfheTenantKeys {
    pub sks: tfhe::ServerKey,
    // maybe we'll need this
    #[allow(dead_code)]
    pub pks: tfhe::CompactPublicKey,
}

pub enum SupportedFheCiphertexts {
    FheBool(tfhe::FheBool),
    FheUint8(tfhe::FheUint8),
    FheUint16(tfhe::FheUint16),
    FheUint32(tfhe::FheUint32),
    FheUint64(tfhe::FheUint64),
    Scalar(U256),
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
    FheIfThenElse = 40,
}

#[derive(PartialEq, Eq)]
pub enum FheOperationType {
    Binary,
    Unary,
    Other,
}

impl SupportedFheCiphertexts {
    pub fn serialize(&self) -> (i16, Vec<u8>) {
        match self {
            SupportedFheCiphertexts::FheBool(v) => (1, bincode::serialize(v).unwrap()),
            SupportedFheCiphertexts::FheUint8(v) => (2, bincode::serialize(v).unwrap()),
            SupportedFheCiphertexts::FheUint16(v) => (3, bincode::serialize(v).unwrap()),
            SupportedFheCiphertexts::FheUint32(v) => (4, bincode::serialize(v).unwrap()),
            SupportedFheCiphertexts::FheUint64(v) => (5, bincode::serialize(v).unwrap()),
            SupportedFheCiphertexts::Scalar(_) => {
                panic!("we should never need to serialize scalar")
            }
        }
    }

    pub fn decrypt(&self, client_key: &tfhe::ClientKey) -> String {
        match self {
            SupportedFheCiphertexts::FheBool(v) => v.decrypt(client_key).to_string(),
            SupportedFheCiphertexts::FheUint8(v) => FheDecrypt::<u8>::decrypt(v, client_key).to_string(),
            SupportedFheCiphertexts::FheUint16(v) => FheDecrypt::<u16>::decrypt(v, client_key).to_string(),
            SupportedFheCiphertexts::FheUint32(v) => FheDecrypt::<u32>::decrypt(v, client_key).to_string(),
            SupportedFheCiphertexts::FheUint64(v) => FheDecrypt::<u64>::decrypt(v, client_key).to_string(),
            SupportedFheCiphertexts::Scalar(v) => {
                let (l, h) = v.to_low_high_u128();
                format!("{l}{h}")
            },
        }
    }
}

impl SupportedFheOperations {
    pub fn op_type(&self) -> FheOperationType {
        match self {
            SupportedFheOperations::FheAdd |
            SupportedFheOperations::FheSub |
            SupportedFheOperations::FheMul |
            SupportedFheOperations::FheDiv |
            SupportedFheOperations::FheRem |
            SupportedFheOperations::FheBitAnd |
            SupportedFheOperations::FheBitOr |
            SupportedFheOperations::FheBitXor |
            SupportedFheOperations::FheShl |
            SupportedFheOperations::FheShr |
            SupportedFheOperations::FheRotl |
            SupportedFheOperations::FheRotr |
            SupportedFheOperations::FheEq |
            SupportedFheOperations::FheNe |
            SupportedFheOperations::FheGe |
            SupportedFheOperations::FheGt |
            SupportedFheOperations::FheLe |
            SupportedFheOperations::FheLt |
            SupportedFheOperations::FheMin |
            SupportedFheOperations::FheMax
            => FheOperationType::Binary,
            SupportedFheOperations::FheNot | SupportedFheOperations::FheNeg
            => FheOperationType::Unary,
            SupportedFheOperations::FheIfThenElse => FheOperationType::Other,
        }
    }

    pub fn is_comparison(&self) -> bool {
        match self {
            SupportedFheOperations::FheEq |
            SupportedFheOperations::FheNe |
            SupportedFheOperations::FheGe |
            SupportedFheOperations::FheGt |
            SupportedFheOperations::FheLe |
            SupportedFheOperations::FheLt
            => true,
            _ => false,
        }
    }
}

impl TryFrom<i16> for SupportedFheOperations {
    type Error = CoprocessorError;

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
            _ => Err(CoprocessorError::UnknownFheOperation(value as i32))
        };

        // ensure we're always having the same value serialized back and forth
        if let Ok(v) = &res {
            assert_eq!(v.clone() as i16, value);
        }

        res
    }
}

// we get i32 from protobuf (smaller types unsupported)
// but in database we store i16
impl TryFrom<i32> for SupportedFheOperations {
    type Error = CoprocessorError;

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        let initial_value: i16 = value.try_into().map_err(|_| {
            CoprocessorError::UnknownFheOperation(value)
        })?;

        let final_value: Result<SupportedFheOperations, Self::Error> = initial_value.try_into();
        final_value
    }
}

impl From<SupportedFheOperations> for i16 {
    fn from(value: SupportedFheOperations) -> Self {
        value as i16
    }
}