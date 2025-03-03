use std::{fs::File, io::Write};

use test_harness::db_utils::ACL_CONTRACT_ADDR;

use crate::auxiliary::ZkData;

mod utils;

#[tokio::test]
async fn test_verify_proof() {
    let (pool, _instance) = utils::setup().await.expect("valid setup");

    // Generate Valid ZkPok
    let aux = utils::aux_fixture(ACL_CONTRACT_ADDR.to_owned());
    let zk_pok = utils::generate_zk_pok(&pool, &aux.1).await;
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

    // Check if it's valid
    assert!(utils::is_valid(&pool, request_id_valid).await.unwrap());

    // Check if it's invalid
    assert!(!utils::is_valid(&pool, request_id_invalid).await.unwrap());
}

#[tokio::test]
async fn test_verify_proof_2() {
    let (pool, _instance) = utils::setup().await.expect("valid setup");

    // Generate Valid ZkPok
    let zk_data = ZkData {
        contract_address: "0xAb30999D17FAAB8c95B2eCD500cFeFc8f658f15d"
            .to_string(),
        user_address: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810".to_owned(),
        acl_contract_address: "0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c"
            .to_string(),
        chain_id: 12345,
    };

    let aux: [u8; 92] = zk_data.assemble().expect("Failed to assemble ZkData");

    let zk_pok = utils::generate_zk_pok(&pool, &aux).await;
    // Insert ZkPok into database
    let request_id_valid = utils::insert_proof(&pool, 101, &zk_pok, &zk_data)
        .await
        .unwrap();

    assert!(utils::is_valid(&pool, request_id_valid).await.unwrap());
}

#[tokio::test]
async fn test_gen_zkpok() {
    let (pool, _instance) = utils::setup().await.expect("valid setup");

    let zk_data = ZkData {
        contract_address: "0xAb30999D17FAAB8c95B2eCD500cFeFc8f658f15d"
            .to_string(),
        user_address: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810".to_owned(),
        acl_contract_address: "0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c"
            .to_string(),
        chain_id: 12345,
    };

    let aux: [u8; 92] = zk_data.assemble().expect("Failed to assemble ZkData");
    let zk_pok = utils::generate_zk_pok(&pool, &aux).await;

    let zk_pok_hex = hex::encode(zk_pok);

    let mut file = File::create("valid_zkpok.txt").unwrap();
    file.write_all(zk_pok_hex.as_bytes()).unwrap();
}
