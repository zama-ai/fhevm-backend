import { expect } from 'chai';
import dotenv from 'dotenv';
import fs from 'fs';
import { ethers } from 'hardhat';

import { awaitAllDecryptionResults, initDecryptionOracle } from '../asyncDecrypt';
import { createInstances } from '../instance';
import { getSigners, initSigners } from '../signers';
import { bigIntToBytes256 } from '../utils';

describe('KMSVerifier', function () {
  before(async function () {
    await initSigners(2);
    this.signers = await getSigners();
    this.instances = await createInstances(this.signers);
    this.kmsFactory = await ethers.getContractFactory('KMSVerifier');
    await initDecryptionOracle();
  });

  it('original owner adds one signer, then adds two more signers, then removes one signer', async function () {
    if (process.env.HARDHAT_PARALLEL !== '1') {
      // to avoid messing up other tests if used on the real node, in parallel testing

      const origKMSAdd = dotenv.parse(fs.readFileSync('addresses/.env.kmsverifier')).KMS_VERIFIER_CONTRACT_ADDRESS;
      const deployer = new ethers.Wallet(process.env.PRIVATE_KEY_FHEVM_DEPLOYER!).connect(ethers.provider);
      const kmsVerifier = await this.kmsFactory.attach(origKMSAdd);
      expect(await kmsVerifier.getVersion()).to.equal('KMSVerifier v0.1.0');

      const privKeySigner = process.env['PRIVATE_KEY_KMS_SIGNER_1']!;
      const kmsSigner = new ethers.Wallet(privKeySigner).connect(ethers.provider);
      let tx = await kmsVerifier.connect(deployer).addSigner(kmsSigner.address);
      await tx.wait();

      expect((await kmsVerifier.getSigners()).length).to.equal(2); // one signer has been added

      const contractFactory = await ethers.getContractFactory('TestAsyncDecrypt');
      const contract = await contractFactory.connect(this.signers.alice).deploy();
      tx = await contract.requestBool();
      await tx.wait();
      await awaitAllDecryptionResults();
      expect(await contract.yBool()).to.equal(true); // in this case, one signature still suffices to pass the decrypt (threshold is still 1)

      const kmsSignerDup = new ethers.Wallet(privKeySigner).connect(ethers.provider);
      await expect(kmsVerifier.connect(deployer).addSigner(kmsSignerDup.address)).to.revertedWithCustomError(
        kmsVerifier,
        'KMSAlreadySigner',
      ); // cannot add duplicated signer
      expect((await kmsVerifier.getSigners()).length).to.equal(2);

      const privKeySigner2 = process.env['PRIVATE_KEY_KMS_SIGNER_2']!;
      const kmsSigner2 = new ethers.Wallet(privKeySigner2).connect(ethers.provider);
      tx = await kmsVerifier.connect(deployer).addSigner(kmsSigner2.address);
      await tx.wait();

      const privKeySigner3 = process.env['PRIVATE_KEY_KMS_SIGNER_3']!;
      const kmsSigner3 = new ethers.Wallet(privKeySigner3).connect(ethers.provider);
      tx = await kmsVerifier.connect(deployer).addSigner(kmsSigner3.address);
      await tx.wait();
      expect((await kmsVerifier.getSigners()).length).to.equal(4); // 3rd and 4th signer has been added successfully

      tx = await kmsVerifier.connect(deployer).setThreshold(2n);
      await tx.wait();
      expect(await kmsVerifier.getThreshold()).to.equal(2);

      process.env.NUM_KMS_SIGNERS = '4';
      tx = await contract.requestUint8();
      await tx.wait();
      await awaitAllDecryptionResults();
      expect(await contract.yUint8()).to.equal(42); // even with more than 2 signatures decryption should still succeed

      const contract2 = await contractFactory.connect(this.signers.alice).deploy();
      const inputAlice = this.instances.alice.createEncryptedInput(
        await contract2.getAddress(),
        this.signers.alice.address,
      );
      inputAlice.addBytes256(bigIntToBytes256(18446744073709550032n));

      const encryptedAmount = await inputAlice.encrypt();
      tx = await contract2.requestMixedBytes256(encryptedAmount.handles[0], encryptedAmount.inputProof);
      await tx.wait();
      await awaitAllDecryptionResults();

      expect(await contract2.yBytes256()).to.equal(ethers.toBeHex(18446744073709550032n, 256));
      expect(await contract2.yBool()).to.equal(true);
      expect(await contract2.yAddress()).to.equal('0x8ba1f109551bD432803012645Ac136ddd64DBA72'); // testing trustless mixed with ebytes256, in case of several signatures

      process.env.NUM_KMS_SIGNERS = '2';
      process.env.PRIVATE_KEY_KMS_SIGNER_1 = process.env.PRIVATE_KEY_KMS_SIGNER_0;
      tx = await contract.requestUint16();
      await tx.wait();
      await expect(awaitAllDecryptionResults()).to.revertedWithCustomError(contract, 'InvalidKMSSignatures'); // cannot use duplicated signatures if threshold is 2
      expect(await contract.yUint16()).to.equal(0);

      process.env.NUM_KMS_SIGNERS = '1';
      tx = await kmsVerifier.connect(deployer).removeSigner(kmsSigner2.address);
      tx.wait();
      tx = await kmsVerifier.connect(deployer).setThreshold(1n);
      await tx.wait();
      expect(await kmsVerifier.getThreshold()).to.equal(1);
      
      tx = await contract.requestUint16();
      await tx.wait();
      await awaitAllDecryptionResults();
      expect(await contract.yUint16()).to.equal(16); // after removing one of the 4 signers, one signature is enough for decryption
    }
  });

  it('cannot add/remove signers if not the owner', async function () {
    const origKMSAdd = dotenv.parse(fs.readFileSync('addresses/.env.kmsverifier')).KMS_VERIFIER_CONTRACT_ADDRESS;
    const kmsVerifier = await this.kmsFactory.attach(origKMSAdd);
    const randomAccount = this.signers.carol;

    await expect(kmsVerifier.connect(randomAccount).addSigner(randomAccount)).to.be.revertedWithCustomError(
      kmsVerifier,
      'OwnableUnauthorizedAccount',
    );

    await expect(kmsVerifier.connect(randomAccount).removeSigner(randomAccount)).to.be.revertedWithCustomError(
      kmsVerifier,
      'OwnableUnauthorizedAccount',
    );
  });
});
