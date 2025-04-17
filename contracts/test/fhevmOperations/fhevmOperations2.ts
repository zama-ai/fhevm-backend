import { expect } from 'chai';
import { ethers } from 'hardhat';

import type { FHEVMTestSuite1 } from '../../types/contracts/tests/FHEVMTestSuite1';
import type { FHEVMTestSuite2 } from '../../types/contracts/tests/FHEVMTestSuite2';
import type { FHEVMTestSuite3 } from '../../types/contracts/tests/FHEVMTestSuite3';
import type { FHEVMTestSuite4 } from '../../types/contracts/tests/FHEVMTestSuite4';
import type { FHEVMTestSuite5 } from '../../types/contracts/tests/FHEVMTestSuite5';
import type { FHEVMTestSuite6 } from '../../types/contracts/tests/FHEVMTestSuite6';
import type { FHEVMTestSuite7 } from '../../types/contracts/tests/FHEVMTestSuite7';
import {
  createInstances,
  decrypt8,
  decrypt16,
  decrypt32,
  decrypt64,
  decrypt128,
  decrypt256,
  decryptBool,
} from '../instance';
import { getSigners, initSigners } from '../signers';

async function deployFHEVMTestFixture1(): Promise<FHEVMTestSuite1> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('FHEVMTestSuite1');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

async function deployFHEVMTestFixture2(): Promise<FHEVMTestSuite2> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('FHEVMTestSuite2');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

async function deployFHEVMTestFixture3(): Promise<FHEVMTestSuite3> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('FHEVMTestSuite3');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

async function deployFHEVMTestFixture4(): Promise<FHEVMTestSuite4> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('FHEVMTestSuite4');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

async function deployFHEVMTestFixture5(): Promise<FHEVMTestSuite5> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('FHEVMTestSuite5');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

async function deployFHEVMTestFixture6(): Promise<FHEVMTestSuite6> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('FHEVMTestSuite6');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

async function deployFHEVMTestFixture7(): Promise<FHEVMTestSuite7> {
  const signers = await getSigners();
  const admin = signers.alice;

  const contractFactory = await ethers.getContractFactory('FHEVMTestSuite7');
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}

describe('FHEVM operations 2', function () {
  before(async function () {
    await initSigners(1);
    this.signers = await getSigners();

    const contract1 = await deployFHEVMTestFixture1();
    this.contract1Address = await contract1.getAddress();
    this.contract1 = contract1;

    const contract2 = await deployFHEVMTestFixture2();
    this.contract2Address = await contract2.getAddress();
    this.contract2 = contract2;

    const contract3 = await deployFHEVMTestFixture3();
    this.contract3Address = await contract3.getAddress();
    this.contract3 = contract3;

    const contract4 = await deployFHEVMTestFixture4();
    this.contract4Address = await contract4.getAddress();
    this.contract4 = contract4;

    const contract5 = await deployFHEVMTestFixture5();
    this.contract5Address = await contract5.getAddress();
    this.contract5 = contract5;

    const contract6 = await deployFHEVMTestFixture6();
    this.contract6Address = await contract6.getAddress();
    this.contract6 = contract6;

    const contract7 = await deployFHEVMTestFixture7();
    this.contract7Address = await contract7.getAddress();
    this.contract7 = contract7;

    const instances = await createInstances(this.signers);
    this.instances = instances;
  });

  it('test operator "le" overload (euint8, euint64) => ebool test 1 (212, 18442879341377461391)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(212n);
    input.add64(18442879341377461391n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint8, euint64) => ebool test 2 (208, 212)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(208n);
    input.add64(212n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint8, euint64) => ebool test 3 (212, 212)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(212n);
    input.add64(212n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint8, euint64) => ebool test 4 (212, 208)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(212n);
    input.add64(208n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint8, euint64) => ebool test 1 (100, 18438789505917052605)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(100n);
    input.add64(18438789505917052605n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint8, euint64) => ebool test 2 (96, 100)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(96n);
    input.add64(100n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint8, euint64) => ebool test 3 (100, 100)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(100n);
    input.add64(100n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint8, euint64) => ebool test 4 (100, 96)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(100n);
    input.add64(96n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "min" overload (euint8, euint64) => euint64 test 1 (208, 18441926920210305107)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(208n);
    input.add64(18441926920210305107n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(208n);
  });

  it('test operator "min" overload (euint8, euint64) => euint64 test 2 (204, 208)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(204n);
    input.add64(208n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(204n);
  });

  it('test operator "min" overload (euint8, euint64) => euint64 test 3 (208, 208)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(208n);
    input.add64(208n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(208n);
  });

  it('test operator "min" overload (euint8, euint64) => euint64 test 4 (208, 204)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(208n);
    input.add64(204n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(204n);
  });

  it('test operator "max" overload (euint8, euint64) => euint64 test 1 (135, 18443955613305641197)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(135n);
    input.add64(18443955613305641197n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(18443955613305641197n);
  });

  it('test operator "max" overload (euint8, euint64) => euint64 test 2 (131, 135)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(131n);
    input.add64(135n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(135n);
  });

  it('test operator "max" overload (euint8, euint64) => euint64 test 3 (135, 135)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(135n);
    input.add64(135n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(135n);
  });

  it('test operator "max" overload (euint8, euint64) => euint64 test 4 (135, 131)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(135n);
    input.add64(131n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint64(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract1.resEuint64());
    expect(res).to.equal(135n);
  });

  it('test operator "add" overload (euint8, euint128) => euint128 test 1 (2, 129)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(2n);
    input.add128(129n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(131n);
  });

  it('test operator "add" overload (euint8, euint128) => euint128 test 2 (31, 35)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(31n);
    input.add128(35n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(66n);
  });

  it('test operator "add" overload (euint8, euint128) => euint128 test 3 (35, 35)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(35n);
    input.add128(35n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(70n);
  });

  it('test operator "add" overload (euint8, euint128) => euint128 test 4 (35, 31)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(35n);
    input.add128(31n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(66n);
  });

  it('test operator "sub" overload (euint8, euint128) => euint128 test 1 (191, 191)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(191n);
    input.add128(191n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.sub_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "sub" overload (euint8, euint128) => euint128 test 2 (191, 187)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(191n);
    input.add128(187n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.sub_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(4n);
  });

  it('test operator "mul" overload (euint8, euint128) => euint128 test 1 (2, 65)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(2n);
    input.add128(65n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(130n);
  });

  it('test operator "mul" overload (euint8, euint128) => euint128 test 2 (11, 11)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(11n);
    input.add128(11n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(121n);
  });

  it('test operator "mul" overload (euint8, euint128) => euint128 test 3 (11, 11)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(11n);
    input.add128(11n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(121n);
  });

  it('test operator "mul" overload (euint8, euint128) => euint128 test 4 (11, 11)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(11n);
    input.add128(11n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(121n);
  });

  it('test operator "and" overload (euint8, euint128) => euint128 test 1 (143, 340282366920938463463369607491754958181)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(143n);
    input.add128(340282366920938463463369607491754958181n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(5n);
  });

  it('test operator "and" overload (euint8, euint128) => euint128 test 2 (139, 143)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(139n);
    input.add128(143n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(139n);
  });

  it('test operator "and" overload (euint8, euint128) => euint128 test 3 (143, 143)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(143n);
    input.add128(143n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(143n);
  });

  it('test operator "and" overload (euint8, euint128) => euint128 test 4 (143, 139)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(143n);
    input.add128(139n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(139n);
  });

  it('test operator "or" overload (euint8, euint128) => euint128 test 1 (75, 340282366920938463463372813311607686315)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(75n);
    input.add128(340282366920938463463372813311607686315n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(340282366920938463463372813311607686379n);
  });

  it('test operator "or" overload (euint8, euint128) => euint128 test 2 (71, 75)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(71n);
    input.add128(75n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(79n);
  });

  it('test operator "or" overload (euint8, euint128) => euint128 test 3 (75, 75)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(75n);
    input.add128(75n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(75n);
  });

  it('test operator "or" overload (euint8, euint128) => euint128 test 4 (75, 71)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(75n);
    input.add128(71n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(79n);
  });

  it('test operator "xor" overload (euint8, euint128) => euint128 test 1 (151, 340282366920938463463373864118525179641)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(151n);
    input.add128(340282366920938463463373864118525179641n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(340282366920938463463373864118525179502n);
  });

  it('test operator "xor" overload (euint8, euint128) => euint128 test 2 (147, 151)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(147n);
    input.add128(151n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(4n);
  });

  it('test operator "xor" overload (euint8, euint128) => euint128 test 3 (151, 151)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(151n);
    input.add128(151n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (euint8, euint128) => euint128 test 4 (151, 147)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(151n);
    input.add128(147n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(4n);
  });

  it('test operator "eq" overload (euint8, euint128) => ebool test 1 (77, 340282366920938463463372959683041961089)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(77n);
    input.add128(340282366920938463463372959683041961089n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint8, euint128) => ebool test 2 (73, 77)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(73n);
    input.add128(77n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint8, euint128) => ebool test 3 (77, 77)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(77n);
    input.add128(77n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (euint8, euint128) => ebool test 4 (77, 73)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(77n);
    input.add128(73n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint8, euint128) => ebool test 1 (203, 340282366920938463463372977336970108399)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(203n);
    input.add128(340282366920938463463372977336970108399n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint8, euint128) => ebool test 2 (199, 203)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(199n);
    input.add128(203n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint8, euint128) => ebool test 3 (203, 203)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(203n);
    input.add128(203n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint8, euint128) => ebool test 4 (203, 199)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(203n);
    input.add128(199n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint8, euint128) => ebool test 1 (186, 340282366920938463463373104158690307633)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(186n);
    input.add128(340282366920938463463373104158690307633n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (euint8, euint128) => ebool test 2 (182, 186)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(182n);
    input.add128(186n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (euint8, euint128) => ebool test 3 (186, 186)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(186n);
    input.add128(186n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint8, euint128) => ebool test 4 (186, 182)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(186n);
    input.add128(182n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (euint8, euint128) => ebool test 1 (250, 340282366920938463463369578485397398211)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(250n);
    input.add128(340282366920938463463369578485397398211n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint8, euint128) => ebool test 2 (246, 250)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(246n);
    input.add128(250n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint8, euint128) => ebool test 3 (250, 250)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(250n);
    input.add128(250n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint8, euint128) => ebool test 4 (250, 246)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(250n);
    input.add128(246n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint8, euint128) => ebool test 1 (181, 340282366920938463463365955110817531855)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(181n);
    input.add128(340282366920938463463365955110817531855n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint8, euint128) => ebool test 2 (177, 181)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(177n);
    input.add128(181n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint8, euint128) => ebool test 3 (181, 181)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(181n);
    input.add128(181n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint8, euint128) => ebool test 4 (181, 177)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(181n);
    input.add128(177n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint8, euint128) => ebool test 1 (140, 340282366920938463463369580839210800649)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(140n);
    input.add128(340282366920938463463369580839210800649n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint8, euint128) => ebool test 2 (136, 140)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(136n);
    input.add128(140n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint8, euint128) => ebool test 3 (140, 140)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(140n);
    input.add128(140n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint8, euint128) => ebool test 4 (140, 136)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(140n);
    input.add128(136n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "min" overload (euint8, euint128) => euint128 test 1 (42, 340282366920938463463370190349812085239)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(42n);
    input.add128(340282366920938463463370190349812085239n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(42n);
  });

  it('test operator "min" overload (euint8, euint128) => euint128 test 2 (38, 42)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(38n);
    input.add128(42n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(38n);
  });

  it('test operator "min" overload (euint8, euint128) => euint128 test 3 (42, 42)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(42n);
    input.add128(42n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(42n);
  });

  it('test operator "min" overload (euint8, euint128) => euint128 test 4 (42, 38)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(42n);
    input.add128(38n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(38n);
  });

  it('test operator "max" overload (euint8, euint128) => euint128 test 1 (175, 340282366920938463463366320020763250765)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(175n);
    input.add128(340282366920938463463366320020763250765n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(340282366920938463463366320020763250765n);
  });

  it('test operator "max" overload (euint8, euint128) => euint128 test 2 (171, 175)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(171n);
    input.add128(175n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(175n);
  });

  it('test operator "max" overload (euint8, euint128) => euint128 test 3 (175, 175)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(175n);
    input.add128(175n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(175n);
  });

  it('test operator "max" overload (euint8, euint128) => euint128 test 4 (175, 171)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(175n);
    input.add128(171n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint8_euint128(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract1.resEuint128());
    expect(res).to.equal(175n);
  });

  it('test operator "and" overload (euint8, euint256) => euint256 test 1 (217, 115792089237316195423570985008687907853269984665640564039457577005271281687215)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(217n);
    input.add256(115792089237316195423570985008687907853269984665640564039457577005271281687215n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(137n);
  });

  it('test operator "and" overload (euint8, euint256) => euint256 test 2 (213, 217)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(213n);
    input.add256(217n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(209n);
  });

  it('test operator "and" overload (euint8, euint256) => euint256 test 3 (217, 217)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(217n);
    input.add256(217n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(217n);
  });

  it('test operator "and" overload (euint8, euint256) => euint256 test 4 (217, 213)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(217n);
    input.add256(213n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(209n);
  });

  it('test operator "or" overload (euint8, euint256) => euint256 test 1 (185, 115792089237316195423570985008687907853269984665640564039457582653434718214651)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(185n);
    input.add256(115792089237316195423570985008687907853269984665640564039457582653434718214651n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457582653434718214651n);
  });

  it('test operator "or" overload (euint8, euint256) => euint256 test 2 (181, 185)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(181n);
    input.add256(185n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(189n);
  });

  it('test operator "or" overload (euint8, euint256) => euint256 test 3 (185, 185)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(185n);
    input.add256(185n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(185n);
  });

  it('test operator "or" overload (euint8, euint256) => euint256 test 4 (185, 181)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(185n);
    input.add256(181n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(189n);
  });

  it('test operator "xor" overload (euint8, euint256) => euint256 test 1 (161, 115792089237316195423570985008687907853269984665640564039457581319773597126065)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(161n);
    input.add256(115792089237316195423570985008687907853269984665640564039457581319773597126065n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457581319773597125904n);
  });

  it('test operator "xor" overload (euint8, euint256) => euint256 test 2 (157, 161)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(157n);
    input.add256(161n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(60n);
  });

  it('test operator "xor" overload (euint8, euint256) => euint256 test 3 (161, 161)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(161n);
    input.add256(161n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (euint8, euint256) => euint256 test 4 (161, 157)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(161n);
    input.add256(157n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract1.resEuint256());
    expect(res).to.equal(60n);
  });

  it('test operator "eq" overload (euint8, euint256) => ebool test 1 (48, 115792089237316195423570985008687907853269984665640564039457580366495329051267)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(48n);
    input.add256(115792089237316195423570985008687907853269984665640564039457580366495329051267n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint8, euint256) => ebool test 2 (44, 48)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(44n);
    input.add256(48n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint8, euint256) => ebool test 3 (48, 48)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(48n);
    input.add256(48n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (euint8, euint256) => ebool test 4 (48, 44)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(48n);
    input.add256(44n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint8, euint256) => ebool test 1 (98, 115792089237316195423570985008687907853269984665640564039457578966613395714343)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(98n);
    input.add256(115792089237316195423570985008687907853269984665640564039457578966613395714343n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint8, euint256) => ebool test 2 (94, 98)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(94n);
    input.add256(98n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint8, euint256) => ebool test 3 (98, 98)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(98n);
    input.add256(98n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint8, euint256) => ebool test 4 (98, 94)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add8(98n);
    input.add256(94n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint8_euint256(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "add" overload (euint16, euint8) => euint16 test 1 (135, 3)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(135n);
    input.add8(3n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(138n);
  });

  it('test operator "add" overload (euint16, euint8) => euint16 test 2 (122, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(122n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(246n);
  });

  it('test operator "add" overload (euint16, euint8) => euint16 test 3 (124, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(124n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(248n);
  });

  it('test operator "add" overload (euint16, euint8) => euint16 test 4 (124, 122)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(124n);
    input.add8(122n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(246n);
  });

  it('test operator "sub" overload (euint16, euint8) => euint16 test 1 (115, 115)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(115n);
    input.add8(115n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.sub_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(0n);
  });

  it('test operator "sub" overload (euint16, euint8) => euint16 test 2 (115, 111)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(115n);
    input.add8(111n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.sub_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(4n);
  });

  it('test operator "mul" overload (euint16, euint8) => euint16 test 1 (120, 2)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(120n);
    input.add8(2n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(240n);
  });

  it('test operator "mul" overload (euint16, euint8) => euint16 test 2 (14, 15)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(14n);
    input.add8(15n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(210n);
  });

  it('test operator "mul" overload (euint16, euint8) => euint16 test 3 (15, 15)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(15n);
    input.add8(15n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(225n);
  });

  it('test operator "mul" overload (euint16, euint8) => euint16 test 4 (15, 14)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(15n);
    input.add8(14n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.mul_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(210n);
  });

  it('test operator "and" overload (euint16, euint8) => euint16 test 1 (2104, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(2104n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(56n);
  });

  it('test operator "and" overload (euint16, euint8) => euint16 test 2 (120, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(120n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(120n);
  });

  it('test operator "and" overload (euint16, euint8) => euint16 test 3 (124, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(124n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(124n);
  });

  it('test operator "and" overload (euint16, euint8) => euint16 test 4 (124, 120)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(124n);
    input.add8(120n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.and_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(120n);
  });

  it('test operator "or" overload (euint16, euint8) => euint16 test 1 (56016, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(56016n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(56060n);
  });

  it('test operator "or" overload (euint16, euint8) => euint16 test 2 (120, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(120n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(124n);
  });

  it('test operator "or" overload (euint16, euint8) => euint16 test 3 (124, 124)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(124n);
    input.add8(124n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(124n);
  });

  it('test operator "or" overload (euint16, euint8) => euint16 test 4 (124, 120)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(124n);
    input.add8(120n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.or_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(124n);
  });

  it('test operator "xor" overload (euint16, euint8) => euint16 test 1 (28043, 17)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(28043n);
    input.add8(17n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(28058n);
  });

  it('test operator "xor" overload (euint16, euint8) => euint16 test 2 (13, 17)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(13n);
    input.add8(17n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(28n);
  });

  it('test operator "xor" overload (euint16, euint8) => euint16 test 3 (17, 17)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(17n);
    input.add8(17n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (euint16, euint8) => euint16 test 4 (17, 13)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(17n);
    input.add8(13n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.xor_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(28n);
  });

  it('test operator "eq" overload (euint16, euint8) => ebool test 1 (9234, 57)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(9234n);
    input.add8(57n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint16, euint8) => ebool test 2 (53, 57)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(53n);
    input.add8(57n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint16, euint8) => ebool test 3 (57, 57)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(57n);
    input.add8(57n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (euint16, euint8) => ebool test 4 (57, 53)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(57n);
    input.add8(53n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.eq_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint16, euint8) => ebool test 1 (59067, 199)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(59067n);
    input.add8(199n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint16, euint8) => ebool test 2 (195, 199)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(195n);
    input.add8(199n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint16, euint8) => ebool test 3 (199, 199)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(199n);
    input.add8(199n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint16, euint8) => ebool test 4 (199, 195)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(199n);
    input.add8(195n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ne_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint16, euint8) => ebool test 1 (45776, 240)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(45776n);
    input.add8(240n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint16, euint8) => ebool test 2 (236, 240)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(236n);
    input.add8(240n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (euint16, euint8) => ebool test 3 (240, 240)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(240n);
    input.add8(240n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint16, euint8) => ebool test 4 (240, 236)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(240n);
    input.add8(236n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.ge_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (euint16, euint8) => ebool test 1 (48381, 63)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(48381n);
    input.add8(63n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (euint16, euint8) => ebool test 2 (59, 63)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(59n);
    input.add8(63n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint16, euint8) => ebool test 3 (63, 63)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(63n);
    input.add8(63n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint16, euint8) => ebool test 4 (63, 59)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(63n);
    input.add8(59n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.gt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint16, euint8) => ebool test 1 (65530, 84)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(65530n);
    input.add8(84n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "le" overload (euint16, euint8) => ebool test 2 (80, 84)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(80n);
    input.add8(84n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint16, euint8) => ebool test 3 (84, 84)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(84n);
    input.add8(84n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint16, euint8) => ebool test 4 (84, 80)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(84n);
    input.add8(80n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.le_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint16, euint8) => ebool test 1 (39090, 119)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(39090n);
    input.add8(119n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint16, euint8) => ebool test 2 (115, 119)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(115n);
    input.add8(119n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint16, euint8) => ebool test 3 (119, 119)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(119n);
    input.add8(119n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint16, euint8) => ebool test 4 (119, 115)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(119n);
    input.add8(115n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.lt_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract1.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "min" overload (euint16, euint8) => euint16 test 1 (9057, 76)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(9057n);
    input.add8(76n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(76n);
  });

  it('test operator "min" overload (euint16, euint8) => euint16 test 2 (72, 76)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(72n);
    input.add8(76n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(72n);
  });

  it('test operator "min" overload (euint16, euint8) => euint16 test 3 (76, 76)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(76n);
    input.add8(76n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(76n);
  });

  it('test operator "min" overload (euint16, euint8) => euint16 test 4 (76, 72)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(76n);
    input.add8(72n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.min_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(72n);
  });

  it('test operator "max" overload (euint16, euint8) => euint16 test 1 (197, 9)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(197n);
    input.add8(9n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(197n);
  });

  it('test operator "max" overload (euint16, euint8) => euint16 test 2 (5, 9)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(5n);
    input.add8(9n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(9n);
  });

  it('test operator "max" overload (euint16, euint8) => euint16 test 3 (9, 9)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(9n);
    input.add8(9n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(9n);
  });

  it('test operator "max" overload (euint16, euint8) => euint16 test 4 (9, 5)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(9n);
    input.add8(5n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.max_euint16_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(9n);
  });

  it('test operator "add" overload (euint16, euint16) => euint16 test 1 (11747, 49457)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(11747n);
    input.add16(49457n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(61204n);
  });

  it('test operator "add" overload (euint16, euint16) => euint16 test 2 (11743, 11747)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(11743n);
    input.add16(11747n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(23490n);
  });

  it('test operator "add" overload (euint16, euint16) => euint16 test 3 (11747, 11747)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(11747n);
    input.add16(11747n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(23494n);
  });

  it('test operator "add" overload (euint16, euint16) => euint16 test 4 (11747, 11743)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract1Address, this.signers.alice.address);
    input.add16(11747n);
    input.add16(11743n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract1.add_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract1.resEuint16());
    expect(res).to.equal(23490n);
  });

  it('test operator "sub" overload (euint16, euint16) => euint16 test 1 (9010, 9010)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(9010n);
    input.add16(9010n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.sub_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(0n);
  });

  it('test operator "sub" overload (euint16, euint16) => euint16 test 2 (9010, 9006)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(9010n);
    input.add16(9006n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.sub_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(4n);
  });

  it('test operator "mul" overload (euint16, euint16) => euint16 test 1 (165, 253)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(165n);
    input.add16(253n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.mul_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(41745n);
  });

  it('test operator "mul" overload (euint16, euint16) => euint16 test 2 (165, 165)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(165n);
    input.add16(165n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.mul_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(27225n);
  });

  it('test operator "mul" overload (euint16, euint16) => euint16 test 3 (165, 165)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(165n);
    input.add16(165n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.mul_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(27225n);
  });

  it('test operator "mul" overload (euint16, euint16) => euint16 test 4 (165, 165)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(165n);
    input.add16(165n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.mul_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(27225n);
  });

  it('test operator "and" overload (euint16, euint16) => euint16 test 1 (18910, 47452)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(18910n);
    input.add16(47452n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.and_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(2396n);
  });

  it('test operator "and" overload (euint16, euint16) => euint16 test 2 (18906, 18910)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(18906n);
    input.add16(18910n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.and_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(18906n);
  });

  it('test operator "and" overload (euint16, euint16) => euint16 test 3 (18910, 18910)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(18910n);
    input.add16(18910n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.and_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(18910n);
  });

  it('test operator "and" overload (euint16, euint16) => euint16 test 4 (18910, 18906)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(18910n);
    input.add16(18906n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.and_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(18906n);
  });

  it('test operator "or" overload (euint16, euint16) => euint16 test 1 (59599, 33205)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(59599n);
    input.add16(33205n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.or_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(59903n);
  });

  it('test operator "or" overload (euint16, euint16) => euint16 test 2 (33201, 33205)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(33201n);
    input.add16(33205n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.or_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(33205n);
  });

  it('test operator "or" overload (euint16, euint16) => euint16 test 3 (33205, 33205)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(33205n);
    input.add16(33205n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.or_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(33205n);
  });

  it('test operator "or" overload (euint16, euint16) => euint16 test 4 (33205, 33201)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(33205n);
    input.add16(33201n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.or_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(33205n);
  });

  it('test operator "xor" overload (euint16, euint16) => euint16 test 1 (12639, 27216)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(12639n);
    input.add16(27216n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.xor_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(23311n);
  });

  it('test operator "xor" overload (euint16, euint16) => euint16 test 2 (12635, 12639)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(12635n);
    input.add16(12639n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.xor_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(4n);
  });

  it('test operator "xor" overload (euint16, euint16) => euint16 test 3 (12639, 12639)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(12639n);
    input.add16(12639n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.xor_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (euint16, euint16) => euint16 test 4 (12639, 12635)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(12639n);
    input.add16(12635n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.xor_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(4n);
  });

  it('test operator "eq" overload (euint16, euint16) => ebool test 1 (16005, 25570)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(16005n);
    input.add16(25570n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.eq_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint16, euint16) => ebool test 2 (16001, 16005)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(16001n);
    input.add16(16005n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.eq_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint16, euint16) => ebool test 3 (16005, 16005)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(16005n);
    input.add16(16005n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.eq_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (euint16, euint16) => ebool test 4 (16005, 16001)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(16005n);
    input.add16(16001n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.eq_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint16, euint16) => ebool test 1 (24524, 19691)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24524n);
    input.add16(19691n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ne_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint16, euint16) => ebool test 2 (19687, 19691)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(19687n);
    input.add16(19691n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ne_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint16, euint16) => ebool test 3 (19691, 19691)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(19691n);
    input.add16(19691n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ne_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint16, euint16) => ebool test 4 (19691, 19687)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(19691n);
    input.add16(19687n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ne_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint16, euint16) => ebool test 1 (44900, 24595)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(44900n);
    input.add16(24595n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ge_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint16, euint16) => ebool test 2 (24591, 24595)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24591n);
    input.add16(24595n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ge_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (euint16, euint16) => ebool test 3 (24595, 24595)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24595n);
    input.add16(24595n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ge_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint16, euint16) => ebool test 4 (24595, 24591)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24595n);
    input.add16(24591n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.ge_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (euint16, euint16) => ebool test 1 (24613, 8343)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24613n);
    input.add16(8343n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.gt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (euint16, euint16) => ebool test 2 (8339, 8343)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(8339n);
    input.add16(8343n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.gt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint16, euint16) => ebool test 3 (8343, 8343)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(8343n);
    input.add16(8343n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.gt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint16, euint16) => ebool test 4 (8343, 8339)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(8343n);
    input.add16(8339n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.gt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint16, euint16) => ebool test 1 (29868, 25493)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(29868n);
    input.add16(25493n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.le_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "le" overload (euint16, euint16) => ebool test 2 (25489, 25493)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(25489n);
    input.add16(25493n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.le_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint16, euint16) => ebool test 3 (25493, 25493)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(25493n);
    input.add16(25493n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.le_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint16, euint16) => ebool test 4 (25493, 25489)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(25493n);
    input.add16(25489n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.le_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint16, euint16) => ebool test 1 (7932, 54387)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(7932n);
    input.add16(54387n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.lt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint16, euint16) => ebool test 2 (7928, 7932)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(7928n);
    input.add16(7932n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.lt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint16, euint16) => ebool test 3 (7932, 7932)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(7932n);
    input.add16(7932n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.lt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint16, euint16) => ebool test 4 (7932, 7928)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(7932n);
    input.add16(7928n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.lt_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract2.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "min" overload (euint16, euint16) => euint16 test 1 (59596, 15227)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(59596n);
    input.add16(15227n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.min_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(15227n);
  });

  it('test operator "min" overload (euint16, euint16) => euint16 test 2 (15223, 15227)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(15223n);
    input.add16(15227n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.min_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(15223n);
  });

  it('test operator "min" overload (euint16, euint16) => euint16 test 3 (15227, 15227)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(15227n);
    input.add16(15227n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.min_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(15227n);
  });

  it('test operator "min" overload (euint16, euint16) => euint16 test 4 (15227, 15223)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(15227n);
    input.add16(15223n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.min_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(15223n);
  });

  it('test operator "max" overload (euint16, euint16) => euint16 test 1 (44630, 34050)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(44630n);
    input.add16(34050n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.max_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(44630n);
  });

  it('test operator "max" overload (euint16, euint16) => euint16 test 2 (34046, 34050)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(34046n);
    input.add16(34050n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.max_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(34050n);
  });

  it('test operator "max" overload (euint16, euint16) => euint16 test 3 (34050, 34050)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(34050n);
    input.add16(34050n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.max_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(34050n);
  });

  it('test operator "max" overload (euint16, euint16) => euint16 test 4 (34050, 34046)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(34050n);
    input.add16(34046n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.max_euint16_euint16(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt16(await this.contract2.resEuint16());
    expect(res).to.equal(34050n);
  });

  it('test operator "add" overload (euint16, euint32) => euint32 test 1 (7, 50643)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(7n);
    input.add32(50643n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.add_euint16_euint32(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt32(await this.contract2.resEuint32());
    expect(res).to.equal(50650n);
  });

  it('test operator "add" overload (euint16, euint32) => euint32 test 2 (24197, 24201)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24197n);
    input.add32(24201n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.add_euint16_euint32(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt32(await this.contract2.resEuint32());
    expect(res).to.equal(48398n);
  });

  it('test operator "add" overload (euint16, euint32) => euint32 test 3 (24201, 24201)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24201n);
    input.add32(24201n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.add_euint16_euint32(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt32(await this.contract2.resEuint32());
    expect(res).to.equal(48402n);
  });

  it('test operator "add" overload (euint16, euint32) => euint32 test 4 (24201, 24197)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract2Address, this.signers.alice.address);
    input.add16(24201n);
    input.add32(24197n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract2.add_euint16_euint32(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt32(await this.contract2.resEuint32());
    expect(res).to.equal(48398n);
  });
});
