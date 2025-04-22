use crate::{
    keys::FhevmKeys,
    types::{FheOperationType, FhevmError, SupportedFheCiphertexts, SupportedFheOperations},
    utils::{safe_deserialize, safe_deserialize_conformant},
};
use tfhe::{
    integer::{
        bigint::{static_signed::StaticSignedBigInt, StaticUnsignedBigInt},
        ciphertext::IntegerProvenCompactCiphertextListConformanceParams, U256,
    }, prelude::{
        CastInto, CiphertextList, FheEq, FheOrd, FheTryTrivialEncrypt, IfThenElse,
        RotateLeft, RotateRight, FheMax, FheMin,
    }, zk::CompactPkeCrs, CompactCiphertextListExpander, FheBool, FheUint1024, FheUint128, FheUint16, FheUint160, FheUint2048, FheUint256, FheUint32, FheUint4, FheUint512, FheUint64, FheUint8, Seed
};

pub fn deserialize_fhe_ciphertext(
    input_type: i16,
    input_bytes: &[u8],
) -> Result<SupportedFheCiphertexts, FhevmError> {
    match input_type {
        0 => {
            let v: tfhe::FheBool = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheBool(v))
        }
        1 => {
            let v: tfhe::FheUint4 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint4(v))
        }
        2 => {
            let v: tfhe::FheUint8 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint8(v))
        }
        3 => {
            let v: tfhe::FheUint16 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint16(v))
        }
        4 => {
            let v: tfhe::FheUint32 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint32(v))
        }
        5 => {
            let v: tfhe::FheUint64 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint64(v))
        }
        6 => {
            let v: tfhe::FheUint128 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint128(v))
        }
        7 => {
            let v: tfhe::FheUint160 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint160(v))
        }
        8 => {
            let v: tfhe::FheUint256 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheUint256(v))
        }
        9 => {
            let v: tfhe::FheUint512 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheBytes64(v))
        }
        10 => {
            let v: tfhe::FheUint1024 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheBytes128(v))
        }
        11 => {
            let v: tfhe::FheUint2048 = safe_deserialize(input_bytes)?;
            Ok(SupportedFheCiphertexts::FheBytes256(v))
        }
        _ => Err(FhevmError::UnknownFheType(input_type as i32)),
    }
}

/// Function assumes encryption key already set
pub fn trivial_encrypt_be_bytes(output_type: i16, input_bytes: &[u8]) -> SupportedFheCiphertexts {
    let last_byte = if !input_bytes.is_empty() {
        input_bytes[input_bytes.len() - 1]
    } else {
        0
    };
    match output_type {
        0 => SupportedFheCiphertexts::FheBool(
            FheBool::try_encrypt_trivial(last_byte > 0).expect("trival encrypt bool"),
        ),
        1 => SupportedFheCiphertexts::FheUint4(
            FheUint4::try_encrypt_trivial(last_byte).expect("trivial encrypt 4"),
        ),
        2 => SupportedFheCiphertexts::FheUint8(
            FheUint8::try_encrypt_trivial(last_byte).expect("trivial encrypt 8"),
        ),
        3 => {
            let mut padded: [u8; 2] = [0; 2];
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
            }
            let res = u16::from_be_bytes(padded);
            SupportedFheCiphertexts::FheUint16(
                FheUint16::try_encrypt_trivial(res).expect("trivial encrypt 16"),
            )
        }
        4 => {
            let mut padded: [u8; 4] = [0; 4];
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
            }
            let res: u32 = u32::from_be_bytes(padded);
            SupportedFheCiphertexts::FheUint32(
                FheUint32::try_encrypt_trivial(res).expect("trivial encrypt 32"),
            )
        }
        5 => {
            let mut padded: [u8; 8] = [0; 8];
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
            }
            let res: u64 = u64::from_be_bytes(padded);
            SupportedFheCiphertexts::FheUint64(
                FheUint64::try_encrypt_trivial(res).expect("trivial encrypt 64"),
            )
        }
        6 => {
            let mut padded: [u8; 16] = [0; 16];
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
            }
            let res: u128 = u128::from_be_bytes(padded);
            let output = FheUint128::try_encrypt_trivial(res).expect("trivial encrypt 128");
            SupportedFheCiphertexts::FheUint128(output)
        }
        7 => {
            let mut padded: [u8; 32] = [0; 32];
            let mut be: U256 = U256::ZERO;
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
                be.copy_from_be_byte_slice(&padded);
            }
            let output: FheUint160 = FheUint256::try_encrypt_trivial(be)
                .expect("trivial encrypt 160")
                .cast_into();
            SupportedFheCiphertexts::FheUint160(output)
        }
        8 => {
            let mut padded: [u8; 32] = [0; 32];
            let mut be: U256 = U256::ZERO;
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
                be.copy_from_be_byte_slice(&padded);
            }
            let output = FheUint256::try_encrypt_trivial(be).expect("trivial encrypt 256");
            SupportedFheCiphertexts::FheUint256(output)
        }
        9 => {
            let mut padded: [u8; 64] = [0; 64];
            let mut be: StaticUnsignedBigInt<8> = StaticUnsignedBigInt::<8>::ZERO;
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
                be.copy_from_be_byte_slice(&padded);
            }
            let output = FheUint512::try_encrypt_trivial(be).expect("trivial encrypt 512");
            SupportedFheCiphertexts::FheBytes64(output)
        }
        10 => {
            let mut padded: [u8; 128] = [0; 128];
            let mut be: StaticUnsignedBigInt<16> = StaticUnsignedBigInt::<16>::ZERO;
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
                be.copy_from_be_byte_slice(&padded);
            }
            let output = FheUint1024::try_encrypt_trivial(be).expect("trivial encrypt 1024");
            SupportedFheCiphertexts::FheBytes128(output)
        }
        11 => {
            let mut padded: [u8; 256] = [0; 256];
            let mut be: StaticUnsignedBigInt<32> = StaticUnsignedBigInt::<32>::ZERO;
            if !input_bytes.is_empty() {
                let padded_len = padded.len();
                let copy_from = if padded_len >= input_bytes.len() {
                    padded_len - input_bytes.len()
                } else {
                    0
                };
                let len = padded.len().min(input_bytes.len());
                padded[copy_from..padded_len]
                    .copy_from_slice(&input_bytes[input_bytes.len() - len..]);
                be.copy_from_be_byte_slice(&padded);
            }
            let output = FheUint2048::try_encrypt_trivial(be).expect("trivial encrypt 2048");
            SupportedFheCiphertexts::FheBytes256(output)
        }
        other => {
            panic!("Unknown input type for trivial encryption: {other}")
        }
    }
}

pub fn current_ciphertext_version() -> i16 {
    0
}

pub fn try_expand_ciphertext_list(
    input_ciphertext: &[u8],
    public_params: &CompactPkeCrs,
) -> Result<Vec<SupportedFheCiphertexts>, FhevmError> {
    let pk_params = FhevmKeys::new_config()
        .public_key_encryption_parameters()
        .map_err(|_| FhevmError::MissingTfheRsData)?;

    let the_list: tfhe::ProvenCompactCiphertextList = safe_deserialize_conformant(
        input_ciphertext,
        &IntegerProvenCompactCiphertextListConformanceParams::from_public_key_encryption_parameters_and_crs_parameters(
            pk_params, public_params,
        ),
    )?;

    let expanded = the_list
        .expand_without_verification()
        .map_err(FhevmError::CiphertextExpansionError)?;

    extract_ct_list(&expanded)
}

pub fn extract_ct_list(
    expanded: &CompactCiphertextListExpander,
) -> Result<Vec<SupportedFheCiphertexts>, FhevmError> {
    let mut res = Vec::new();
    for idx in 0..expanded.len() {
        let Some(data_kind) = expanded.get_kind_of(idx) else {
            panic!("we're itering over what ciphertext told us how many ciphertexts are there, it must exist")
        };

        match data_kind {
            tfhe::FheTypes::Bool => {
                let ct: tfhe::FheBool = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheBool(ct));
            }
            tfhe::FheTypes::Uint4 => {
                let ct: tfhe::FheUint4 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint4(ct));
            }
            tfhe::FheTypes::Uint8 => {
                let ct: tfhe::FheUint8 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint8(ct));
            }
            tfhe::FheTypes::Uint16 => {
                let ct: tfhe::FheUint16 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint16(ct));
            }
            tfhe::FheTypes::Uint32 => {
                let ct: tfhe::FheUint32 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint32(ct));
            }
            tfhe::FheTypes::Uint64 => {
                let ct: tfhe::FheUint64 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint64(ct));
            }
            tfhe::FheTypes::Uint128 => {
                let ct: tfhe::FheUint128 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint128(ct));
            }
            tfhe::FheTypes::Uint160 => {
                let ct: tfhe::FheUint160 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint160(ct));
            }
            tfhe::FheTypes::Uint256 => {
                let ct: tfhe::FheUint256 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheUint256(ct));
            }
            tfhe::FheTypes::Uint512 => {
                let ct: tfhe::FheUint512 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheBytes64(ct));
            }
            tfhe::FheTypes::Uint1024 => {
                let ct: tfhe::FheUint1024 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheBytes128(ct));
            }
            tfhe::FheTypes::Uint2048 => {
                let ct: tfhe::FheUint2048 = expanded
                    .get(idx)
                    .map_err(|e| FhevmError::DeserializationError(e.into()))?
                    .ok_or(FhevmError::DeserializationError(
                        "failed to get expected data type".into(),
                    ))?;

                res.push(SupportedFheCiphertexts::FheBytes256(ct));
            }
            other => {
                return Err(FhevmError::CiphertextExpansionUnsupportedCiphertextKind(
                    other,
                ));
            }
        }
    }

    Ok(res)
}

// return output ciphertext type
pub fn check_fhe_operand_types(
    fhe_operation: i32,
    input_handles: &[Vec<u8>],
    is_input_handle_scalar: &[bool],
) -> Result<(), FhevmError> {
    let fhe_op: SupportedFheOperations = fhe_operation.try_into()?;

    assert_eq!(input_handles.len(), is_input_handle_scalar.len());

    let scalar_operands = is_input_handle_scalar
        .iter()
        .enumerate()
        .filter(|(_, is_scalar)| **is_scalar)
        .collect::<Vec<_>>();

    let is_scalar = !scalar_operands.is_empty();

    // do this check for only random ops because
    // all random ops inputs are scalar
    if !fhe_op.does_have_more_than_one_scalar() {
        if scalar_operands.len() > 1 {
            return Err(FhevmError::FheOperationOnlyOneOperandCanBeScalar {
                fhe_operation,
                fhe_operation_name: format!("{:?}", fhe_op),
                scalar_operand_count: scalar_operands.len(),
                max_scalar_operands: 1,
            });
        }

        if is_scalar {
            assert_eq!(
                scalar_operands.len(),
                1,
                "We checked already that not more than 1 scalar operand can be present"
            );

            if !does_fhe_operation_support_scalar(&fhe_op) {
                return Err(FhevmError::FheOperationDoesntSupportScalar {
                    fhe_operation,
                    fhe_operation_name: format!("{:?}", fhe_op),
                    scalar_requested: is_scalar,
                    scalar_supported: false,
                });
            }

            let scalar_input_index = scalar_operands[0].0;
            if scalar_input_index != 1 {
                return Err(FhevmError::FheOperationOnlySecondOperandCanBeScalar {
                    scalar_input_index,
                    only_allowed_scalar_input_index: 1,
                });
            }
        }
    }

    match fhe_op.op_type() {
        FheOperationType::Binary => {
            let expected_operands = 2;
            if input_handles.len() != expected_operands {
                return Err(FhevmError::UnexpectedOperandCountForFheOperation {
                    fhe_operation,
                    fhe_operation_name: format!("{:?}", fhe_op),
                    expected_operands,
                    got_operands: input_handles.len(),
                });
            }

            // special case for div operation, rhs for scalar must not be zero
            if is_scalar && fhe_op == SupportedFheOperations::FheDiv {
                let all_zeroes = input_handles[1].iter().all(|i| *i == 0u8);
                if all_zeroes {
                    return Err(FhevmError::FheOperationScalarDivisionByZero {
                        lhs_handle: format!("0x{}", hex::encode(&input_handles[0])),
                        rhs_value: format!("0x{}", hex::encode(&input_handles[1])),
                        fhe_operation,
                        fhe_operation_name: format!("{:?}", fhe_op),
                    });
                }
            }

            Ok(())
        }
        FheOperationType::Unary => {
            let expected_operands = 1;
            if input_handles.len() != expected_operands {
                return Err(FhevmError::UnexpectedOperandCountForFheOperation {
                    fhe_operation,
                    fhe_operation_name: format!("{:?}", fhe_op),
                    expected_operands,
                    got_operands: input_handles.len(),
                });
            }

            Ok(())
        }
        FheOperationType::Other => {
            match &fhe_op {
                // two ops + uniform types branch
                // what about scalar compute?
                SupportedFheOperations::FheIfThenElse => {
                    let expected_operands = 3;
                    if input_handles.len() != expected_operands {
                        return Err(FhevmError::UnexpectedOperandCountForFheOperation {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            expected_operands,
                            got_operands: input_handles.len(),
                        });
                    }

                    Ok(())
                }
                SupportedFheOperations::FheCast => {
                    let expected_operands = 2;
                    if input_handles.len() != expected_operands {
                        return Err(FhevmError::UnexpectedOperandCountForFheOperation {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            expected_operands,
                            got_operands: input_handles.len(),
                        });
                    }

                    match (is_input_handle_scalar[0], is_input_handle_scalar[1]) {
                        (false, true) => {
                            let op = &input_handles[1];
                            if op.len() != 1 {
                                return Err(
                                    FhevmError::UnexpectedCastOperandSizeForScalarOperand {
                                        fhe_operation,
                                        fhe_operation_name: format!("{:?}", fhe_op),
                                        expected_scalar_operand_bytes: 1,
                                        got_bytes: op.len(),
                                    },
                                );
                            }

                            Ok(())
                        }
                        (other_left, other_right) => {
                            let bool_to_op =
                                |inp| (if inp { "scalar" } else { "handle" }).to_string();

                            Err(FhevmError::UnexpectedCastOperandTypes {
                                fhe_operation,
                                fhe_operation_name: format!("{:?}", fhe_op),
                                expected_operator_combination: vec![
                                    "handle".to_string(),
                                    "scalar".to_string(),
                                ],
                                got_operand_combination: vec![
                                    bool_to_op(other_left),
                                    bool_to_op(other_right),
                                ],
                            })
                        }
                    }
                }
                SupportedFheOperations::FheTrivialEncrypt => {
                    let expected_operands = 2;
                    if input_handles.len() != expected_operands {
                        return Err(FhevmError::UnexpectedOperandCountForFheOperation {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            expected_operands,
                            got_operands: input_handles.len(),
                        });
                    }

                    if !is_input_handle_scalar[0] || !is_input_handle_scalar[1] {
                        return Err(FhevmError::AllInputsForTrivialEncryptionMustBeScalar {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                        });
                    }

                    let op = &input_handles[1];
                    if op.len() != 1 {
                        return Err(
                            FhevmError::UnexpectedTrivialEncryptionOperandSizeForScalarOperand {
                                fhe_operation,
                                fhe_operation_name: format!("{:?}", fhe_op),
                                expected_scalar_operand_bytes: 1,
                                got_bytes: op.len(),
                            },
                        );
                    }

                    Ok(())
                }
                SupportedFheOperations::FheRand => {
                    // counter and output type
                    let expected_operands = 2;
                    if input_handles.len() != expected_operands {
                        return Err(FhevmError::UnexpectedOperandCountForFheOperation {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            expected_operands,
                            got_operands: input_handles.len(),
                        });
                    }

                    let scalar_operands = is_input_handle_scalar.iter().filter(|i| **i).count();
                    if scalar_operands < expected_operands {
                        return Err(FhevmError::RandOperationInputsMustAllBeScalar {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            scalar_operand_count: scalar_operands,
                            expected_scalar_operand_count: expected_operands,
                        });
                    }

                    let rand_type = &input_handles[1];
                    if rand_type.len() != 1 {
                        return Err(FhevmError::UnexpectedRandOperandSizeForOutputType {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            expected_operand_bytes: 1,
                            got_bytes: rand_type.len(),
                        });
                    }

                    validate_fhe_type(rand_type[0] as i32)?;

                    Ok(())
                }
                SupportedFheOperations::FheRandBounded => {
                    // counter, bound and output type
                    let expected_operands = 3;
                    if input_handles.len() != expected_operands {
                        return Err(FhevmError::UnexpectedOperandCountForFheOperation {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            expected_operands,
                            got_operands: input_handles.len(),
                        });
                    }

                    let scalar_operands = is_input_handle_scalar.iter().filter(|i| **i).count();
                    if scalar_operands < expected_operands {
                        return Err(FhevmError::RandOperationInputsMustAllBeScalar {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            scalar_operand_count: scalar_operands,
                            expected_scalar_operand_count: expected_operands,
                        });
                    }

                    let upper_bound = &input_handles[1];
                    if upper_bound.is_empty() && upper_bound.iter().all(|i| *i == 0) {
                        return Err(FhevmError::RandOperationUpperBoundCannotBeZero {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            upper_bound_value: format!("0x{}", hex::encode(upper_bound)),
                        });
                    }

                    let rand_type = &input_handles[2];
                    if rand_type.len() != 1 {
                        return Err(FhevmError::UnexpectedRandOperandSizeForOutputType {
                            fhe_operation,
                            fhe_operation_name: format!("{:?}", fhe_op),
                            expected_operand_bytes: 1,
                            got_bytes: rand_type.len(),
                        });
                    }

                    Ok(())
                }
                other => {
                    panic!("Unexpected branch: {:?}", other)
                }
            }
        }
    }
}

pub fn validate_fhe_type(input_type: i32) -> Result<(), FhevmError> {
    let i16_type: i16 = input_type
        .try_into()
        .or(Err(FhevmError::UnknownFheType(input_type)))?;
    match i16_type {
        0..=11 => Ok(()),
        _ => Err(FhevmError::UnknownFheType(input_type)),
    }
}

pub fn does_fhe_operation_support_scalar(op: &SupportedFheOperations) -> bool {
    match op.op_type() {
        FheOperationType::Binary => true,
        FheOperationType::Unary => false,
        FheOperationType::Other => {
            match op {
                // second operand determines which type to cast to
                SupportedFheOperations::FheCast => true,
                _ => false,
            }
        }
    }
}

// add operations here that don't support both encrypted operands
pub fn does_fhe_operation_support_both_encrypted_operands(op: &SupportedFheOperations) -> bool {
    !matches!(op, SupportedFheOperations::FheDiv)
}

type FheUintAny = tfhe::FheUint256;
type FheIntAny = tfhe::FheInt256;

enum Ct {
    Bool(FheBool),
    Signed(FheIntAny),
    Unsigned(FheUintAny),
    Ascii(()),
    Clear(Vec<u8>),
}

// Integer {bitwidth, ct}
// Ascii
// Clear

fn discard_bitwidth_type(lhs: SupportedFheCiphertexts) -> (Ct, usize) {
    use SupportedFheCiphertexts::*;
    use Ct::*;
    unsafe {
        match lhs {
            FheBool(ct) => (Bool(std::mem::transmute(ct)), 1),
            FheUint2(ct) => (Unsigned(std::mem::transmute(ct)), 2),
            FheUint4(ct) => (Unsigned(std::mem::transmute(ct)), 4),
            FheUint6(ct) => (Unsigned(std::mem::transmute(ct)), 6),
            FheUint8(ct) => (Unsigned(std::mem::transmute(ct)), 8),
            FheUint10(ct) => (Unsigned(std::mem::transmute(ct)), 10),
            FheUint12(ct) => (Unsigned(std::mem::transmute(ct)), 12),
            FheUint14(ct) => (Unsigned(std::mem::transmute(ct)), 14),
            FheUint16(ct) => (Unsigned(std::mem::transmute(ct)), 16),
            FheUint24(_ct) => panic!("unsupported type"),
            FheUint32(ct) => (Unsigned(std::mem::transmute(ct)), 32),
            FheUint40(_ct) => panic!("unsupported type"),
            FheUint48(_ct) => panic!("unsupported type"),
            FheUint56(_ct) => panic!("unsupported type"),
            FheUint64(ct) => (Unsigned(std::mem::transmute(ct)), 64),
            FheUint72(_ct) => panic!("unsupported type"),
            FheUint80(_ct) => panic!("unsupported type"),
            FheUint88(_ct) => panic!("unsupported type"),
            FheUint96(_ct) => panic!("unsupported type"),
            FheUint104(_ct) => panic!("unsupported type"),
            FheUint112(_ct) => panic!("unsupported type"),
            FheUint120(_ct) => panic!("unsupported type"),
            FheUint128(ct) => (Unsigned(std::mem::transmute(ct)), 128),
            FheUint136(_ct) => panic!("unsupported type"),
            FheUint144(_ct) => panic!("unsupported type"),
            FheUint152(_ct) => panic!("unsupported type"),
            FheUint160(ct) => (Unsigned(std::mem::transmute(ct)), 160),
            FheUint168(_ct) => panic!("unsupported type"),
            FheUint176(_ct) => panic!("unsupported type"),
            FheUint184(_ct) => panic!("unsupported type"),
            FheUint192(_ct) => panic!("unsupported type"),
            FheUint200(_ct) => panic!("unsupported type"),
            FheUint208(_ct) => panic!("unsupported type"),
            FheUint216(_ct) => panic!("unsupported type"),
            FheUint224(_ct) => panic!("unsupported type"),
            FheUint232(_ct) => panic!("unsupported type"),
            FheUint240(_ct) => panic!("unsupported type"),
            FheUint248(_ct) => panic!("unsupported type"),
            FheUint256(ct) => (Unsigned(std::mem::transmute(ct)), 256),
            FheInt2(ct) => (Signed(std::mem::transmute(ct)), 2),
            FheInt4(ct) => (Signed(std::mem::transmute(ct)), 4),
            FheInt6(ct) => (Signed(std::mem::transmute(ct)), 6),
            FheInt8(ct) => (Signed(std::mem::transmute(ct)), 8),
            FheInt10(ct) => (Signed(std::mem::transmute(ct)), 10),
            FheInt12(ct) => (Signed(std::mem::transmute(ct)), 12),
            FheInt14(ct) => (Signed(std::mem::transmute(ct)), 14),
            FheInt16(ct) => (Signed(std::mem::transmute(ct)), 16),
            FheInt24(_ct) => panic!("unsupported type"),
            FheInt32(ct) => (Signed(std::mem::transmute(ct)), 32),
            FheInt40(_ct) => panic!("unsupported type"),
            FheInt48(_ct) => panic!("unsupported type"),
            FheInt56(_ct) => panic!("unsupported type"),
            FheInt64(ct) => (Signed(std::mem::transmute(ct)), 64),
            FheInt72(_ct) => panic!("unsupported type"),
            FheInt80(_ct) => panic!("unsupported type"),
            FheInt88(_ct) => panic!("unsupported type"),
            FheInt96(_ct) => panic!("unsupported type"),
            FheInt104(_ct) => panic!("unsupported type"),
            FheInt112(_ct) => panic!("unsupported type"),
            FheInt120(_ct) => panic!("unsupported type"),
            FheInt128(ct) => (Signed(std::mem::transmute(ct)), 128),
            FheInt136(_ct) => panic!("unsupported type"),
            FheInt144(_ct) => panic!("unsupported type"),
            FheInt152(_ct) => panic!("unsupported type"),
            FheInt160(ct) => (Signed(std::mem::transmute(ct)), 160),
            FheInt168(_ct) => panic!("unsupported type"),
            FheInt176(_ct) => panic!("unsupported type"),
            FheInt184(_ct) => panic!("unsupported type"),
            FheInt192(_ct) => panic!("unsupported type"),
            FheInt200(_ct) => panic!("unsupported type"),
            FheInt208(_ct) => panic!("unsupported type"),
            FheInt216(_ct) => panic!("unsupported type"),
            FheInt224(_ct) => panic!("unsupported type"),
            FheInt232(_ct) => panic!("unsupported type"),
            FheInt240(_ct) => panic!("unsupported type"),
            FheInt248(_ct) => panic!("unsupported type"),
            FheInt256(ct) => (Signed(std::mem::transmute(ct)), 256),
            FheInt512(_ct) => panic!("unsupported type"),
            FheInt1024(_ct) => panic!("unsupported type"),
            FheInt2048(_ct) => panic!("unsupported type"),
            FheBytes64(ct) => (Unsigned(std::mem::transmute(ct)), 64 * 8),
            FheBytes128(ct) => (Unsigned(std::mem::transmute(ct)), 128 * 8),
            FheBytes256(ct) => (Unsigned(std::mem::transmute(ct)), 256 * 8),
            FheAsciiString(()) => (Ascii(()), 0),
            Scalar(scalar) => (Clear(scalar), 0),
        }
    }
}

fn attach_signed_bitwidth_type(ct: FheIntAny, bitwidth: usize) -> SupportedFheCiphertexts {
    use SupportedFheCiphertexts::*;
    unsafe {
        match bitwidth {
            2 => FheInt2(std::mem::transmute(ct)),
            4 => FheInt4(std::mem::transmute(ct)),
            6 => FheInt6(std::mem::transmute(ct)),
            8 => FheInt8(std::mem::transmute(ct)),
            10 => FheInt10(std::mem::transmute(ct)),
            12 => FheInt12(std::mem::transmute(ct)),
            14 => FheInt14(std::mem::transmute(ct)),
            16 => FheInt16(std::mem::transmute(ct)),
            32 => FheInt32(std::mem::transmute(ct)),
            64 => FheInt64(std::mem::transmute(ct)),
            128 => FheInt128(std::mem::transmute(ct)),
            256 => FheInt256(std::mem::transmute(ct)),
            _ => panic!("unsupported type"),
        }
    }
}

fn attach_unsigned_bitwidth_type(ct: FheUintAny, bitwidth: usize) -> SupportedFheCiphertexts {
    use SupportedFheCiphertexts::*;
    unsafe {
        match bitwidth {
            2 => FheUint2(std::mem::transmute(ct)),
            4 => FheUint4(std::mem::transmute(ct)),
            6 => FheUint6(std::mem::transmute(ct)),
            8 => FheUint8(std::mem::transmute(ct)),
            10 => FheUint10(std::mem::transmute(ct)),
            12 => FheUint12(std::mem::transmute(ct)),
            14 => FheUint14(std::mem::transmute(ct)),
            16 => FheUint16(std::mem::transmute(ct)),
            32 => FheUint32(std::mem::transmute(ct)),
            64 => FheUint64(std::mem::transmute(ct)),
            128 => FheUint128(std::mem::transmute(ct)),
            256 => FheUint256(std::mem::transmute(ct)),
            _ => panic!("unsupported type"),
        }
    }
}

fn attach_bitwidth_type(ct: Ct, bitwidth: usize) -> SupportedFheCiphertexts {
    use SupportedFheCiphertexts::*;
    match ct {
        Ct::Signed(ct) => attach_signed_bitwidth_type(ct, bitwidth),
        Ct::Unsigned(ct) => attach_unsigned_bitwidth_type(ct, bitwidth),
        Ct::Ascii(()) => FheAsciiString(()),
        Ct::Clear(scalar) => Scalar(scalar),
        Ct::Bool(ct) => FheBool(ct),
    }
}

// strict definition domain must be the same for input/output
fn is_binary_operation(operation: SupportedFheOperations) -> bool {
    use SupportedFheOperations::*;
    match operation {
        FheAdd | FheSub | FheMul | FheDiv | FheRem | FheBitAnd | FheBitOr | FheBitXor
        => true,

        | FheMin | FheMax | FheShl | FheShr | FheRotl | FheRotr | FheEq | FheNe | FheGe | FheGt | FheLe | FheLt | FheNeg | FheNot | FheCast
        | FheTrivialEncrypt | FheRand | FheRandBounded| FheGetInputCiphertext | FheIfThenElse
        => false,
    }
}

fn is_min_max_operation(operation: SupportedFheOperations) -> bool {
    use SupportedFheOperations::*;
    match operation {
        FheMin | FheMax => true,
        _ => false,
    }
}

fn is_shift_operation(operation: SupportedFheOperations) -> bool {
    use SupportedFheOperations::*;
    match operation {
        FheRotl | FheRotr| FheShl | FheShr
        => true,

        FheAdd | FheSub | FheMul | FheDiv | FheRem | FheBitAnd | FheBitOr | FheBitXor | FheMin | FheMax
        | FheEq | FheNe | FheGe | FheGt | FheLe | FheLt | FheNeg | FheNot | FheCast
        | FheTrivialEncrypt | FheRand | FheRandBounded| FheGetInputCiphertext | FheIfThenElse
        => false,
    }
}

fn is_comparison_operation(operation: SupportedFheOperations) -> bool {
    use SupportedFheOperations::*;
    match operation {
        FheEq | FheNe | FheGe | FheGt | FheLe | FheLt
        => true,

        FheAdd | FheSub | FheMul | FheDiv | FheRem | FheBitAnd | FheBitOr | FheBitXor | FheShl | FheShr | FheMin | FheMax |
        FheRotl | FheRotr | FheNeg | FheNot | FheCast |
        FheTrivialEncrypt | FheRand | FheRandBounded| FheGetInputCiphertext | FheIfThenElse
        => false,
    }
}

fn is_unary_operation(operation: SupportedFheOperations) -> bool {
    use SupportedFheOperations::*;
    match operation {
        FheNeg | FheNot
        => true,

        FheAdd | FheSub | FheMul | FheDiv | FheRem | FheBitAnd | FheBitOr | FheBitXor | FheShl | FheShr | FheMin | FheMax |
        FheRotl | FheRotr | FheEq | FheNe | FheGe | FheGt | FheLe | FheLt |
        FheCast |
        FheTrivialEncrypt | FheRand | FheRandBounded| FheGetInputCiphertext | FheIfThenElse
        => false,
    }
}

fn perform_binary_operation<CT, RHS>(
    operation: SupportedFheOperations,
    lhs: CT,
    rhs: RHS,
) -> Result<CT, FhevmError>
where
    CT: std::ops::Add<RHS, Output = CT>
    + std::ops::Sub<RHS, Output = CT>
    + std::ops::Mul<RHS, Output = CT>
    + std::ops::Div<RHS, Output = CT>
    + std::ops::Rem<RHS, Output = CT>
    + std::ops::BitAnd<RHS, Output = CT>
    + std::ops::BitOr<RHS, Output = CT>
    + std::ops::BitXor<RHS, Output = CT>,
{
    use SupportedFheOperations as O;
    match operation {
        O::FheAdd => Ok(lhs + rhs),
        O::FheSub => Ok(lhs - rhs),
        O::FheMul => Ok(lhs * rhs),
        O::FheDiv => Ok(lhs / rhs),
        O::FheRem => Ok(lhs % rhs),
        O::FheBitAnd => Ok(lhs & rhs),
        O::FheBitOr => Ok(lhs | rhs),
        O::FheBitXor => Ok(lhs ^ rhs),
        O::FheMin | O::FheMax
        | O::FheShl | O::FheShr
        | O::FheRotl | O::FheRotr
        | O::FheEq | O::FheNe
        | O::FheGe | O::FheGt
        | O::FheLe | O::FheLt
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::UnsupportedFheTypes {
            fhe_operation: format!("Not the right ops in {:?}", operation),
            input_types: vec![],
        }),
    }
}

fn perform_binary_bool_operation<CT, RHS>(
    operation: SupportedFheOperations,
    lhs: CT,
    rhs: RHS,
) -> Result<CT, FhevmError>
where
    CT: std::ops::BitAnd<RHS, Output = CT>
    + std::ops::BitOr<RHS, Output = CT>
    + std::ops::BitXor<RHS, Output = CT>,
{
    use SupportedFheOperations as O;
    match operation {
        O::FheBitAnd => Ok(lhs & rhs),
        O::FheBitOr => Ok(lhs | rhs),
        O::FheBitXor => Ok(lhs ^ rhs),
        O::FheAdd | O::FheSub | O::FheMul | O::FheDiv | O::FheRem |
        O::FheMin | O::FheMax
        | O::FheShl | O::FheShr
        | O::FheRotl | O::FheRotr
        | O::FheEq | O::FheNe
        | O::FheGe | O::FheGt
        | O::FheLe | O::FheLt
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::UnsupportedFheTypes {
            fhe_operation: format!("Not the right ops in {:?}", operation),
            input_types: vec![],
        }),
    }
}

fn perform_min_max_operation_unsigned(
    operation: SupportedFheOperations,
    lhs: FheUintAny, // cannot use generic CT due to FheMin/FheMax trait limitations
    rhs: FheUintAny,
) -> Result<FheUintAny, FhevmError>
{
    use SupportedFheOperations as O;
    match operation {
        O::FheMin => Ok(lhs.min(&rhs)),
        O::FheMax => Ok(lhs.max(&rhs)),
        O::FheAdd | O::FheSub | O::FheMul | O::FheDiv | O::FheRem | O::FheBitAnd | O::FheBitOr | O::FheBitXor
        | O::FheShl | O::FheShr | O::FheRotl | O::FheRotr
        | O::FheEq | O::FheNe | O::FheGe | O::FheGt | O::FheLe | O::FheLt
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::BadInputs),
    }
}

fn perform_min_max_operation_signed(
    operation: SupportedFheOperations,
    lhs: FheIntAny, // cannot use generic CT due to FheMin/FheMax trait limitations
    rhs: FheIntAny,
) -> Result<FheIntAny, FhevmError>
{
    use SupportedFheOperations as O;
    match operation {
        O::FheMin => Ok(lhs.min(&rhs)),
        O::FheMax => Ok(lhs.max(&rhs)),
        O::FheAdd | O::FheSub | O::FheMul | O::FheDiv | O::FheRem | O::FheBitAnd | O::FheBitOr | O::FheBitXor
        | O::FheShl | O::FheShr | O::FheRotl | O::FheRotr
        | O::FheEq | O::FheNe | O::FheGe | O::FheGt | O::FheLe | O::FheLt
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::BadInputs),
    }
}

fn perform_min_max_clear_operation<CT, RHS>(
    operation: SupportedFheOperations,
    lhs: CT,
    rhs: RHS,
) -> Result<CT, FhevmError>
where
    CT: FheMin<RHS, Output = CT> + FheMax<RHS, Output = CT>,
{
    use SupportedFheOperations as O;
    match operation {
        O::FheMin => Ok(lhs.min(rhs)),
        O::FheMax => Ok(lhs.max(rhs)),
        O::FheAdd | O::FheSub | O::FheMul | O::FheDiv | O::FheRem | O::FheBitAnd | O::FheBitOr | O::FheBitXor
        | O::FheShl | O::FheShr | O::FheRotl | O::FheRotr
        | O::FheEq | O::FheNe | O::FheGe | O::FheGt | O::FheLe | O::FheLt
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::BadInputs),
    }
}

fn perform_comparison_operation<CT, RHS>(
    operation: SupportedFheOperations,
    lhs: CT,
    rhs: RHS,
) -> Result<FheBool, FhevmError>
where
    CT: FheEq<RHS> + FheOrd<RHS>,
{
    use SupportedFheOperations as O;
    match operation {
        | O::FheEq => Ok(lhs.eq(rhs)),
        | O::FheNe => Ok(lhs.ne(rhs)),
        | O::FheGe => Ok(lhs.ge(rhs)),
        | O::FheGt => Ok(lhs.gt(rhs)),
        | O::FheLe => Ok(lhs.le(rhs)),
        | O::FheLt => Ok(lhs.lt(rhs)),
        O::FheAdd | O::FheSub | O::FheMul | O::FheDiv | O::FheRem | O::FheBitAnd | O::FheBitOr | O::FheBitXor | O::FheShl | O::FheShr
        | O::FheMin| O::FheMax
        | O::FheRotl | O::FheRotr
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::BadInputs),
    }
}

fn perform_eq_operation<CT, RHS>(
    operation: SupportedFheOperations,
    lhs: CT,
    rhs: RHS,
) -> Result<FheBool, FhevmError>
where CT: FheEq<RHS>,
{
    use SupportedFheOperations as O;
    match operation {
        | O::FheEq => Ok(lhs.eq(rhs)),
        | O::FheNe => Ok(lhs.ne(rhs)),
        | O::FheGe | O::FheGt | O::FheLe | O::FheLt
        | O::FheAdd | O::FheSub | O::FheMul | O::FheDiv | O::FheRem | O::FheBitAnd | O::FheBitOr | O::FheBitXor | O::FheShl | O::FheShr
        | O::FheMin| O::FheMax
        | O::FheRotl | O::FheRotr
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::BadInputs),
    }
}

fn perform_shift_operation<CT, RHS>(
    operation: SupportedFheOperations,
    lhs: CT,
    rhs: RHS,
) -> Result<CT, FhevmError>
where
    CT: RotateLeft<RHS, Output = CT> + RotateRight<RHS, Output = CT> + std::ops::Shl<RHS, Output = CT> + std::ops::Shr<RHS, Output = CT>,
{
    use SupportedFheOperations as O;
    match operation {
        | O::FheShl => Ok(lhs.rotate_left(rhs)),
        | O::FheShr => Ok(lhs.rotate_right(rhs)),
        | O::FheRotl => Ok(lhs << rhs),
        | O::FheRotr => Ok(lhs >> rhs),
        | O::FheAdd | O::FheSub | O::FheMul | O::FheDiv | O::FheRem | O::FheBitAnd | O::FheBitOr | O::FheBitXor
        | O::FheEq | O::FheNe
        | O::FheGe | O::FheGt
        | O::FheLe | O::FheLt
        | O::FheMin| O::FheMax
        | O::FheNeg | O::FheNot
        | O::FheCast
        | O::FheTrivialEncrypt
        | O::FheRand
        | O::FheRandBounded
        | O::FheGetInputCiphertext
        | O::FheIfThenElse
        => Err(FhevmError::BadInputs),
    }
}

fn perform_unary_operation<CT>(
    operation: SupportedFheOperations,
    lhs: CT,
) -> Result<CT, FhevmError>
where
    CT: std::ops::Neg<Output = CT> + std::ops::Not<Output = CT>,
{
    use SupportedFheOperations::*;
    match operation {
        FheNeg => Ok(-lhs),
        FheNot => Ok(!lhs),
        FheAdd | FheSub | FheMul | FheDiv | FheRem | FheBitAnd | FheBitOr | FheBitXor | FheShl | FheShr | FheMin | FheMax
        | FheRotl | FheRotr
        | FheEq | FheNe
        | FheGe | FheGt
        | FheLe | FheLt
        | FheCast
        | FheTrivialEncrypt
        | FheRand
        | FheRandBounded
        | FheGetInputCiphertext
        | FheIfThenElse
        => Err(FhevmError::BadInputs),
    }
}

fn to_bool_clear(bytes: &[u8]) -> bool{
    bytes.iter().all(|&v| v == 0)
}

fn to_unsigned_clear(bytes: &[u8]) -> U256
{
    let mut clear = U256::ZERO.clone();
    clear.copy_from_be_byte_slice(bytes);
    clear
}

type S256  = StaticSignedBigInt<4>;

fn to_signed_clear(bytes: &[u8]) -> S256
{
    let mut clear = [0_u64; 4];
    const BYTE_PER_WORD: usize = 8;
    for (i, &b) in bytes.iter().rev().enumerate() {
        let word_index = i / BYTE_PER_WORD;
        let byte_index = i % BYTE_PER_WORD;
        clear[word_index] |= (b as u64) << (byte_index * 8);
    }
    let clear = S256::from(clear);
    clear
}

pub fn perform_arity_2_operation(
    fhe_operation: SupportedFheOperations,
    lhs: SupportedFheCiphertexts,
    rhs: SupportedFheCiphertexts,
) -> Result<SupportedFheCiphertexts, FhevmError> {
    use Ct::*;
    let err = || Err(FhevmError::UnsupportedFheTypes {
        fhe_operation: format!("{:?}", fhe_operation),
        input_types: vec![""],
    });
    let (lhs, lhs_bitwidth) = discard_bitwidth_type(lhs);
    let (rhs, _rhs_bitwidth) = discard_bitwidth_type(rhs);
    let result = if is_binary_operation(fhe_operation) {
        let result = match (lhs, rhs) {
            (Bool(lhs), Bool(rhs)) => Bool(perform_binary_bool_operation(fhe_operation, lhs, rhs)?),
            (Unsigned(lhs), Unsigned(rhs)) => Unsigned(perform_binary_operation(fhe_operation, lhs, rhs)?),
            (Signed(lhs), Signed(rhs)) => Signed(perform_binary_operation(fhe_operation, lhs, rhs)?),
            (Bool(lhs), Clear(rhs)) => Bool(perform_binary_bool_operation(fhe_operation, lhs, to_bool_clear(&rhs))?),
            (Unsigned(lhs), Clear(rhs)) =>
                Unsigned(perform_binary_operation(fhe_operation, lhs, to_unsigned_clear(&rhs))?),
            (Signed(lhs), Clear(rhs)) =>
                Signed(perform_binary_operation(fhe_operation, lhs, to_signed_clear(&rhs))?),
            _ => return err(),
        };
        attach_bitwidth_type(result, lhs_bitwidth)
    } else if is_comparison_operation(fhe_operation) {
        SupportedFheCiphertexts::FheBool(match (lhs, rhs) {
            (Bool(lhs), Bool(rhs)) => perform_eq_operation(fhe_operation, lhs, rhs)?,
            (Unsigned(lhs), Unsigned(rhs)) => perform_comparison_operation(fhe_operation, lhs, rhs)?,
            (Signed(lhs), Signed(rhs)) => perform_comparison_operation(fhe_operation, lhs, rhs)?,
            (Signed(lhs), Clear(rhs)) => perform_comparison_operation(fhe_operation, lhs, to_signed_clear(&rhs))?,
            (Unsigned(lhs), Clear(rhs)) => perform_comparison_operation(fhe_operation, lhs, to_unsigned_clear(&rhs))?,
            _ => return err(),
        })
    } else if is_shift_operation(fhe_operation) {
        let result = match (lhs, rhs) {
            (Unsigned(lhs), Unsigned(rhs)) => Unsigned(perform_shift_operation(fhe_operation, lhs, rhs)?),
            (Unsigned(lhs), Clear(rhs)) => Unsigned(perform_shift_operation(fhe_operation, lhs, to_unsigned_clear(&rhs))?),
            _ => return err(),
        };
        attach_bitwidth_type(result, lhs_bitwidth)
    } else if is_min_max_operation(fhe_operation) {
        let result = match (lhs, rhs) {
            (Unsigned(lhs), Unsigned(rhs)) => Unsigned(perform_min_max_operation_unsigned(fhe_operation, lhs, rhs)?),
            (Signed(lhs), Signed(rhs)) => Signed(perform_min_max_operation_signed(fhe_operation, lhs, rhs)?),
            (Unsigned(lhs), Clear(rhs)) => Unsigned(perform_min_max_clear_operation(fhe_operation, lhs, to_unsigned_clear(&rhs))?),
            (Signed(lhs), Clear(rhs)) => Signed(perform_min_max_clear_operation(fhe_operation, lhs, to_signed_clear(&rhs))?),
            _ => return err(),
        };
        attach_bitwidth_type(result, lhs_bitwidth)
    } else {
        return err()
    };
    Ok(result)
}


pub fn perform_fhe_operation_untyped(
    fhe_operation: SupportedFheOperations,
    mut input_operands: Vec<SupportedFheCiphertexts>,
) -> Result<SupportedFheCiphertexts, FhevmError> {
    if input_operands.len() == 2 {
        let rhs = input_operands.pop().unwrap();
        let lhs = input_operands.pop().unwrap();
        perform_arity_2_operation(fhe_operation, lhs, rhs)
    } else if input_operands.len() == 1 && is_unary_operation(fhe_operation) {
        let lhs = input_operands.pop().unwrap();
        let (lhs, lhs_bitwidth) = discard_bitwidth_type(lhs);
        match lhs {
            Ct::Unsigned(lhs) => Ok(attach_bitwidth_type(Ct::Unsigned(perform_unary_operation(fhe_operation, lhs)?), lhs_bitwidth)),
            Ct::Signed(lhs) => Ok(attach_bitwidth_type(Ct::Signed(perform_unary_operation(fhe_operation, lhs)?), lhs_bitwidth)),
            _ => Err(FhevmError::UnsupportedFheTypes {
                fhe_operation: format!("{:?}", fhe_operation),
                input_types: vec!["Not a number"],
            }),
        }
    } else {
        Err(FhevmError::UnsupportedFheTypes {
            fhe_operation: format!("{:?}", fhe_operation),
            input_types: input_operands.iter().map(|i| i.type_name()).collect(),
        })
    }
}


pub fn perform_fhe_operation(
    fhe_operation_int: i16,
    input_operands: Vec<SupportedFheCiphertexts>,
    // for deterministc randomness functions
) -> Result<SupportedFheCiphertexts, FhevmError> {
    let fhe_operation: SupportedFheOperations = fhe_operation_int.try_into()?;
    eprintln!("fhe_operation: {:?} {}", fhe_operation, input_operands[0].type_name());
    match fhe_operation {
        SupportedFheOperations::FheAdd | SupportedFheOperations::FheSub | SupportedFheOperations::FheMul | SupportedFheOperations::FheDiv | SupportedFheOperations::FheRem
        | SupportedFheOperations::FheBitAnd | SupportedFheOperations::FheBitOr | SupportedFheOperations::FheBitXor
        | SupportedFheOperations::FheShl | SupportedFheOperations::FheShr
        | SupportedFheOperations::FheRotl | SupportedFheOperations::FheRotr
        | SupportedFheOperations::FheEq | SupportedFheOperations::FheNe
        | SupportedFheOperations::FheGe | SupportedFheOperations::FheGt
        | SupportedFheOperations::FheLe | SupportedFheOperations::FheLt
        | SupportedFheOperations::FheNot | SupportedFheOperations::FheNeg
        | SupportedFheOperations::FheMin | SupportedFheOperations::FheMax
        => {
            perform_fhe_operation_untyped(fhe_operation, input_operands)
        }

        SupportedFheOperations::FheIfThenElse => {
            assert_eq!(input_operands.len(), 3);

            let SupportedFheCiphertexts::FheBool(flag) = &input_operands[0] else {
                return Err(FhevmError::UnsupportedFheTypes {
                    fhe_operation: format!("{:?}", fhe_operation),
                    input_types: input_operands.iter().map(|i| i.type_name()).collect(),
                });
            };

            match (&input_operands[1], &input_operands[2]) {
                (SupportedFheCiphertexts::FheBool(a), SupportedFheCiphertexts::FheBool(b)) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheBool(res))
                }
                (SupportedFheCiphertexts::FheUint4(a), SupportedFheCiphertexts::FheUint4(b)) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint4(res))
                }
                (SupportedFheCiphertexts::FheUint8(a), SupportedFheCiphertexts::FheUint8(b)) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint8(res))
                }
                (SupportedFheCiphertexts::FheUint16(a), SupportedFheCiphertexts::FheUint16(b)) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint16(res))
                }
                (SupportedFheCiphertexts::FheUint32(a), SupportedFheCiphertexts::FheUint32(b)) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint32(res))
                }
                (SupportedFheCiphertexts::FheUint64(a), SupportedFheCiphertexts::FheUint64(b)) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint64(res))
                }
                (
                    SupportedFheCiphertexts::FheUint128(a),
                    SupportedFheCiphertexts::FheUint128(b),
                ) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint128(res))
                }
                (
                    SupportedFheCiphertexts::FheUint160(a),
                    SupportedFheCiphertexts::FheUint160(b),
                ) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint160(res))
                }
                (
                    SupportedFheCiphertexts::FheUint256(a),
                    SupportedFheCiphertexts::FheUint256(b),
                ) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheUint256(res))
                }
                (
                    SupportedFheCiphertexts::FheBytes64(a),
                    SupportedFheCiphertexts::FheBytes64(b),
                ) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheBytes64(res))
                }
                (
                    SupportedFheCiphertexts::FheBytes128(a),
                    SupportedFheCiphertexts::FheBytes128(b),
                ) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheBytes128(res))
                }
                (
                    SupportedFheCiphertexts::FheBytes256(a),
                    SupportedFheCiphertexts::FheBytes256(b),
                ) => {
                    let res = flag.select(a, b);
                    Ok(SupportedFheCiphertexts::FheBytes256(res))
                }
                _ => Err(FhevmError::UnsupportedFheTypes {
                    fhe_operation: format!("{:?}", fhe_operation),
                    input_types: input_operands.iter().map(|i| i.type_name()).collect(),
                }),
            }
        }
        SupportedFheOperations::FheCast => match (&input_operands[0], &input_operands[1]) {
            (SupportedFheCiphertexts::FheBool(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheBool(inp.clone()))
                } else {
                    match l {
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint4(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint4(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint8(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint8(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint16(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint16(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint32(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint32(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint64(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint64(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint128(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint128(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint160(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint160(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheUint256(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheUint256(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheBytes64(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheBytes64(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheBytes128(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheBytes128(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        11 => {
                            let out: tfhe::FheUint2048 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes256(out))
                        }
                        other => Err(FhevmError::UnknownCastType {
                            fhe_operation: format!("{:?}", fhe_operation),
                            type_to_cast_to: other,
                        }),
                    }
                }
            }
            (SupportedFheCiphertexts::FheBytes256(inp), SupportedFheCiphertexts::Scalar(op)) => {
                let l = to_be_u16_bit(op) as i16;
                let type_id = input_operands[0].type_num();
                if l == type_id {
                    Ok(SupportedFheCiphertexts::FheBytes256(inp.clone()))
                } else {
                    match l {
                        0 => {
                            let out: tfhe::FheBool = inp.gt(0);
                            Ok(SupportedFheCiphertexts::FheBool(out))
                        }
                        1 => {
                            let out: tfhe::FheUint4 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint4(out))
                        }
                        2 => {
                            let out: tfhe::FheUint8 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint8(out))
                        }
                        3 => {
                            let out: tfhe::FheUint16 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint16(out))
                        }
                        4 => {
                            let out: tfhe::FheUint32 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint32(out))
                        }
                        5 => {
                            let out: tfhe::FheUint64 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint64(out))
                        }
                        6 => {
                            let out: tfhe::FheUint128 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint128(out))
                        }
                        7 => {
                            let out: tfhe::FheUint160 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint160(out))
                        }
                        8 => {
                            let out: tfhe::FheUint256 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheUint256(out))
                        }
                        9 => {
                            let out: tfhe::FheUint512 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes64(out))
                        }
                        10 => {
                            let out: tfhe::FheUint1024 = inp.clone().cast_into();
                            Ok(SupportedFheCiphertexts::FheBytes128(out))
                        }
                        other => panic!("unexpected type: {other}"),
                    }
                }
            }
            _ => Err(FhevmError::UnsupportedFheTypes {
                fhe_operation: format!("{:?}", fhe_operation),
                input_types: input_operands.iter().map(|i| i.type_name()).collect(),
            }),
        },
        SupportedFheOperations::FheTrivialEncrypt => match (&input_operands[0], &input_operands[1])
        {
            (SupportedFheCiphertexts::Scalar(inp), SupportedFheCiphertexts::Scalar(op)) => {
                Ok(trivial_encrypt_be_bytes(to_be_u16_bit(op) as i16, inp))
            }
            _ => Err(FhevmError::UnsupportedFheTypes {
                fhe_operation: format!("{:?}", fhe_operation),
                input_types: input_operands.iter().map(|i| i.type_name()).collect(),
            }),
        },
        SupportedFheOperations::FheRand => {
            let SupportedFheCiphertexts::Scalar(rand_counter) = &input_operands[0] else {
                return Err(FhevmError::UnsupportedFheTypes {
                    fhe_operation: format!("{:?}", fhe_operation),
                    input_types: input_operands.iter().map(|i| i.type_name()).collect(),
                });
            };
            let SupportedFheCiphertexts::Scalar(to_type) = &input_operands[1] else {
                return Err(FhevmError::UnsupportedFheTypes {
                    fhe_operation: format!("{:?}", fhe_operation),
                    input_types: input_operands.iter().map(|i| i.type_name()).collect(),
                });
            };
            let rand_seed = to_be_u128_bit(rand_counter);
            let to_type = to_be_u16_bit(to_type) as i16;
            Ok(generate_random_number(to_type as i16, rand_seed, None))
        }
        SupportedFheOperations::FheRandBounded => {
            let SupportedFheCiphertexts::Scalar(rand_counter) = &input_operands[0] else {
                return Err(FhevmError::UnsupportedFheTypes {
                    fhe_operation: format!("{:?}", fhe_operation),
                    input_types: input_operands.iter().map(|i| i.type_name()).collect(),
                });
            };
            let SupportedFheCiphertexts::Scalar(upper_bound) = &input_operands[1] else {
                return Err(FhevmError::UnsupportedFheTypes {
                    fhe_operation: format!("{:?}", fhe_operation),
                    input_types: input_operands.iter().map(|i| i.type_name()).collect(),
                });
            };
            let SupportedFheCiphertexts::Scalar(to_type) = &input_operands[2] else {
                return Err(FhevmError::UnsupportedFheTypes {
                    fhe_operation: format!("{:?}", fhe_operation),
                    input_types: input_operands.iter().map(|i| i.type_name()).collect(),
                });
            };
            let rand_seed = to_be_u128_bit(rand_counter);
            let to_type = to_be_u16_bit(to_type) as i16;
            Ok(generate_random_number(
                to_type as i16,
                rand_seed,
                Some(upper_bound),
            ))
        }
        SupportedFheOperations::FheGetInputCiphertext => todo!("Implement FheGetInputCiphertext"),
    }
}

pub fn to_be_u4_bit(inp: &[u8]) -> u8 {
    inp.last().unwrap_or(&0) & 0x0f
}

pub fn to_be_u8_bit(inp: &[u8]) -> u8 {
    *inp.last().unwrap_or(&0)
}

// copies input bytes to constant size array as big endian
// while padding result with zeros from left if resulting array
// is larger than input and truncating input array from the left
// if input array is larger than resulting array
fn to_constant_size_array<const SIZE: usize>(inp: &[u8]) -> [u8; SIZE] {
    let mut res = [0u8; SIZE];

    match inp.len().cmp(&SIZE) {
        std::cmp::Ordering::Less => {
            // truncate input slice from the left
            let slice = &mut res[SIZE - inp.len()..];
            slice.copy_from_slice(inp);
        }
        std::cmp::Ordering::Equal => {
            res.copy_from_slice(inp);
        }
        std::cmp::Ordering::Greater => {
            // input slice larger than result, truncate input slice from the left
            res.copy_from_slice(&inp[inp.len() - SIZE..]);
        }
    }

    res
}

macro_rules! to_be_function {
    ( $x:ty ) => {
        paste::paste! {
            fn [<to_be_ $x _bit>](inp: &[u8]) -> $x {
                $x::from_be_bytes(to_constant_size_array::<{ std::mem::size_of::<$x>() }>(inp))
            }
        }
    };
}

to_be_function!(u16);
to_be_function!(u128);

fn be_number_random_bits(inp: &[u8]) -> u32 {
    let mut res = 0;
    for i in inp.iter().rev() {
        let i = *i;
        match i.cmp(&0) {
            std::cmp::Ordering::Less => {}
            std::cmp::Ordering::Equal => {
                // all bits zero, add 8
                res += 8;
            }
            std::cmp::Ordering::Greater => {
                res += 7 - i.leading_zeros();
                break;
            }
        }
    }

    res
}

#[test]
fn random_bits_from_arr() {
    assert_eq!(be_number_random_bits(&(1u32).to_be_bytes()), 0);
    assert_eq!(be_number_random_bits(&(2u32).to_be_bytes()), 1);
    assert_eq!(be_number_random_bits(&(4u32).to_be_bytes()), 2);
    assert_eq!(be_number_random_bits(&(8u32).to_be_bytes()), 3);
    assert_eq!(be_number_random_bits(&(16u32).to_be_bytes()), 4);
    assert_eq!(be_number_random_bits(&(32u32).to_be_bytes()), 5);
    assert_eq!(be_number_random_bits(&(64u32).to_be_bytes()), 6);
    assert_eq!(be_number_random_bits(&(128u32).to_be_bytes()), 7);
    assert_eq!(be_number_random_bits(&(256u32).to_be_bytes()), 8);
    assert_eq!(be_number_random_bits(&(512u32).to_be_bytes()), 9);
    assert_eq!(be_number_random_bits(&(1024u32).to_be_bytes()), 10);
    assert_eq!(be_number_random_bits(&(2048u32).to_be_bytes()), 11);
    assert_eq!(be_number_random_bits(&(4096u32).to_be_bytes()), 12);
    assert_eq!(be_number_random_bits(&(8192u32).to_be_bytes()), 13);
    assert_eq!(be_number_random_bits(&(16384u32).to_be_bytes()), 14);
    assert_eq!(be_number_random_bits(&(32768u32).to_be_bytes()), 15);
    assert_eq!(be_number_random_bits(&(65536u32).to_be_bytes()), 16);
}

pub fn generate_random_number(
    the_type: i16,
    seed: u128,
    upper_bound: Option<&[u8]>,
) -> SupportedFheCiphertexts {
    match the_type {
        0 => {
            SupportedFheCiphertexts::FheBool(FheBool::generate_oblivious_pseudo_random(Seed(seed)))
        }
        1 => {
            let bit_count = 4;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint4(FheUint4::generate_oblivious_pseudo_random_bounded(
                Seed(seed),
                random_bits,
            ))
        }
        2 => {
            let bit_count = 8;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint8(FheUint8::generate_oblivious_pseudo_random_bounded(
                Seed(seed),
                random_bits,
            ))
        }
        3 => {
            let bit_count = 16;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint16(FheUint16::generate_oblivious_pseudo_random_bounded(
                Seed(seed),
                random_bits,
            ))
        }
        4 => {
            let bit_count = 32;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint32(FheUint32::generate_oblivious_pseudo_random_bounded(
                Seed(seed),
                random_bits,
            ))
        }
        5 => {
            let bit_count = 64;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint64(FheUint64::generate_oblivious_pseudo_random_bounded(
                Seed(seed),
                random_bits,
            ))
        }
        6 => {
            let bit_count = 128;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint128(
                FheUint128::generate_oblivious_pseudo_random_bounded(Seed(seed), random_bits),
            )
        }
        7 => {
            let bit_count = 160;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint160(
                FheUint160::generate_oblivious_pseudo_random_bounded(Seed(seed), random_bits),
            )
        }
        8 => {
            let bit_count = 256;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheUint256(
                FheUint256::generate_oblivious_pseudo_random_bounded(Seed(seed), random_bits),
            )
        }
        9 => {
            let bit_count = 512;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheBytes64(
                FheUint512::generate_oblivious_pseudo_random_bounded(Seed(seed), random_bits),
            )
        }
        10 => {
            let bit_count = 1024;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheBytes128(
                FheUint1024::generate_oblivious_pseudo_random_bounded(Seed(seed), random_bits),
            )
        }
        11 => {
            let bit_count = 2048;
            let random_bits = upper_bound
                .map(be_number_random_bits)
                .unwrap_or(bit_count)
                .min(bit_count) as u64;
            SupportedFheCiphertexts::FheBytes256(
                FheUint2048::generate_oblivious_pseudo_random_bounded(Seed(seed), random_bits),
            )
        }
        other => {
            panic!("unknown type to trim to: {other}")
        }
    }
}
