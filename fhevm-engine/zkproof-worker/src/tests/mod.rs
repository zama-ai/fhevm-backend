use test_harness::db_utils::ACL_CONTRACT_ADDR;

use crate::MAX_NUMBER_OF_INPUTS;

mod utils;

#[tokio::test]
async fn test_verify_proof() {
    let (pool, _instance) = utils::setup().await.expect("valid setup");

    // Generate Valid ZkPok
    let aux: (crate::auxiliary::ZkData, [u8; 92]) =
        utils::aux_fixture(ACL_CONTRACT_ADDR.to_owned());
    let zk_pok = utils::generate_sample_zkpok(&pool, &aux.1).await;
    // Insert ZkPok into database
    let request_id_valid = utils::insert_proof(&pool, 101, &zk_pok, &aux.0)
        .await
        .unwrap();

    // Generate ZkPok with invalid aux data
    let mut aux = aux.0.clone();
    aux.user_address = "0x".to_owned() + &"1".repeat(40);
    let request_id_invalid = utils::insert_proof(&pool, 102, &zk_pok, &aux)
        .await
        .unwrap();

    assert!(utils::is_valid(&pool, request_id_valid).await.unwrap());
    assert!(!utils::is_valid(&pool, request_id_invalid).await.unwrap());

    // Generate Valid ZkPok with MAX_NUMBER_OF_INPUTS inputs
    let aux: (crate::auxiliary::ZkData, [u8; 92]) =
        utils::aux_fixture(ACL_CONTRACT_ADDR.to_owned());
    let bytes: Vec<u8> = utils::generate_n_inputs_zkpok(
        &pool,
        &aux.1,
        MAX_NUMBER_OF_INPUTS as usize,
    )
    .await;
    let id = utils::insert_proof(&pool, 200, &bytes, &aux.0)
        .await
        .unwrap();

    assert!(utils::is_valid(&pool, id).await.unwrap());

    // Generate Valid ZkPok with more than MAX_NUMBER_OF_INPUTS inputs
    let aux: (crate::auxiliary::ZkData, [u8; 92]) =
        utils::aux_fixture(ACL_CONTRACT_ADDR.to_owned());
    let bytes: Vec<u8> = utils::generate_n_inputs_zkpok(
        &pool,
        &aux.1,
        (MAX_NUMBER_OF_INPUTS + 1) as usize,
    )
    .await;
    let id = utils::insert_proof(&pool, id + 1, &bytes, &aux.0)
        .await
        .unwrap();

    assert!(!utils::is_valid(&pool, id).await.unwrap());
}
