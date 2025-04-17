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

describe('FHEVM operations 11', function () {
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

  it('test operator "lt" overload (uint64, euint64) => ebool test 1 (18443106290966803285, 18441381079006798689)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18441381079006798689n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.lt_uint64_euint64(
      18443106290966803285n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (uint64, euint64) => ebool test 2 (18439440611144791541, 18439440611144791545)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18439440611144791545n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.lt_uint64_euint64(
      18439440611144791541n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (uint64, euint64) => ebool test 3 (18439440611144791545, 18439440611144791545)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18439440611144791545n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.lt_uint64_euint64(
      18439440611144791545n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (uint64, euint64) => ebool test 4 (18439440611144791545, 18439440611144791541)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18439440611144791541n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.lt_uint64_euint64(
      18439440611144791545n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "min" overload (euint64, uint64) => euint64 test 1 (18438912838024826441, 18438097314971695671)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18438912838024826441n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_euint64_uint64(
      encryptedAmount.handles[0],
      18438097314971695671n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438097314971695671n);
  });

  it('test operator "min" overload (euint64, uint64) => euint64 test 2 (18438912838024826437, 18438912838024826441)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18438912838024826437n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_euint64_uint64(
      encryptedAmount.handles[0],
      18438912838024826441n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438912838024826437n);
  });

  it('test operator "min" overload (euint64, uint64) => euint64 test 3 (18438912838024826441, 18438912838024826441)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18438912838024826441n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_euint64_uint64(
      encryptedAmount.handles[0],
      18438912838024826441n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438912838024826441n);
  });

  it('test operator "min" overload (euint64, uint64) => euint64 test 4 (18438912838024826441, 18438912838024826437)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18438912838024826441n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_euint64_uint64(
      encryptedAmount.handles[0],
      18438912838024826437n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438912838024826437n);
  });

  it('test operator "min" overload (uint64, euint64) => euint64 test 1 (18445727231216316481, 18438097314971695671)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18438097314971695671n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_uint64_euint64(
      18445727231216316481n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438097314971695671n);
  });

  it('test operator "min" overload (uint64, euint64) => euint64 test 2 (18438912838024826437, 18438912838024826441)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18438912838024826441n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_uint64_euint64(
      18438912838024826437n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438912838024826437n);
  });

  it('test operator "min" overload (uint64, euint64) => euint64 test 3 (18438912838024826441, 18438912838024826441)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18438912838024826441n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_uint64_euint64(
      18438912838024826441n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438912838024826441n);
  });

  it('test operator "min" overload (uint64, euint64) => euint64 test 4 (18438912838024826441, 18438912838024826437)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18438912838024826437n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.min_uint64_euint64(
      18438912838024826441n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18438912838024826437n);
  });

  it('test operator "max" overload (euint64, uint64) => euint64 test 1 (18440110215756278723, 18437846865527338409)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18440110215756278723n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_euint64_uint64(
      encryptedAmount.handles[0],
      18437846865527338409n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18440110215756278723n);
  });

  it('test operator "max" overload (euint64, uint64) => euint64 test 2 (18440110215756278719, 18440110215756278723)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18440110215756278719n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_euint64_uint64(
      encryptedAmount.handles[0],
      18440110215756278723n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18440110215756278723n);
  });

  it('test operator "max" overload (euint64, uint64) => euint64 test 3 (18440110215756278723, 18440110215756278723)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18440110215756278723n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_euint64_uint64(
      encryptedAmount.handles[0],
      18440110215756278723n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18440110215756278723n);
  });

  it('test operator "max" overload (euint64, uint64) => euint64 test 4 (18440110215756278723, 18440110215756278719)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add64(18440110215756278723n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_euint64_uint64(
      encryptedAmount.handles[0],
      18440110215756278719n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18440110215756278723n);
  });

  it('test operator "max" overload (uint64, euint64) => euint64 test 1 (18441689350422326159, 18437846865527338409)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18437846865527338409n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_uint64_euint64(
      18441689350422326159n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18441689350422326159n);
  });

  it('test operator "max" overload (uint64, euint64) => euint64 test 2 (18440110215756278719, 18440110215756278723)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18440110215756278723n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_uint64_euint64(
      18440110215756278719n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18440110215756278723n);
  });

  it('test operator "max" overload (uint64, euint64) => euint64 test 3 (18440110215756278723, 18440110215756278723)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18440110215756278723n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_uint64_euint64(
      18440110215756278723n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18440110215756278723n);
  });

  it('test operator "max" overload (uint64, euint64) => euint64 test 4 (18440110215756278723, 18440110215756278719)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add64(18440110215756278719n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.max_uint64_euint64(
      18440110215756278723n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt64(await this.contract6.resEuint64());
    expect(res).to.equal(18440110215756278723n);
  });

  it('test operator "add" overload (euint128, uint128) => euint128 test 1 (170141183460469231731685082232296124858, 170141183460469231731682900609128171818)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(170141183460469231731685082232296124858n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_euint128_uint128(
      encryptedAmount.handles[0],
      170141183460469231731682900609128171818n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463367982841424296676n);
  });

  it('test operator "add" overload (euint128, uint128) => euint128 test 2 (170141183460469231731682997167638994827, 170141183460469231731682997167638994829)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(170141183460469231731682997167638994827n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_euint128_uint128(
      encryptedAmount.handles[0],
      170141183460469231731682997167638994829n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463365994335277989656n);
  });

  it('test operator "add" overload (euint128, uint128) => euint128 test 3 (170141183460469231731682997167638994829, 170141183460469231731682997167638994829)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(170141183460469231731682997167638994829n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_euint128_uint128(
      encryptedAmount.handles[0],
      170141183460469231731682997167638994829n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463365994335277989658n);
  });

  it('test operator "add" overload (euint128, uint128) => euint128 test 4 (170141183460469231731682997167638994829, 170141183460469231731682997167638994827)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(170141183460469231731682997167638994829n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_euint128_uint128(
      encryptedAmount.handles[0],
      170141183460469231731682997167638994827n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463365994335277989656n);
  });

  it('test operator "add" overload (uint128, euint128) => euint128 test 1 (170141183460469231731685759839236460568, 170141183460469231731682900609128171818)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(170141183460469231731682900609128171818n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_uint128_euint128(
      170141183460469231731685759839236460568n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463368660448364632386n);
  });

  it('test operator "add" overload (uint128, euint128) => euint128 test 2 (170141183460469231731682997167638994827, 170141183460469231731682997167638994829)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(170141183460469231731682997167638994829n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_uint128_euint128(
      170141183460469231731682997167638994827n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463365994335277989656n);
  });

  it('test operator "add" overload (uint128, euint128) => euint128 test 3 (170141183460469231731682997167638994829, 170141183460469231731682997167638994829)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(170141183460469231731682997167638994829n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_uint128_euint128(
      170141183460469231731682997167638994829n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463365994335277989658n);
  });

  it('test operator "add" overload (uint128, euint128) => euint128 test 4 (170141183460469231731682997167638994829, 170141183460469231731682997167638994827)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(170141183460469231731682997167638994827n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.add_uint128_euint128(
      170141183460469231731682997167638994829n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463365994335277989656n);
  });

  it('test operator "sub" overload (euint128, uint128) => euint128 test 1 (340282366920938463463370061979824896623, 340282366920938463463370061979824896623)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463370061979824896623n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.sub_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370061979824896623n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "sub" overload (euint128, uint128) => euint128 test 2 (340282366920938463463370061979824896623, 340282366920938463463370061979824896619)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463370061979824896623n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.sub_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370061979824896619n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(4n);
  });

  it('test operator "sub" overload (uint128, euint128) => euint128 test 1 (340282366920938463463370061979824896623, 340282366920938463463370061979824896623)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463370061979824896623n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.sub_uint128_euint128(
      340282366920938463463370061979824896623n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "sub" overload (uint128, euint128) => euint128 test 2 (340282366920938463463370061979824896623, 340282366920938463463370061979824896619)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463370061979824896619n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.sub_uint128_euint128(
      340282366920938463463370061979824896623n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(4n);
  });

  it('test operator "mul" overload (euint128, uint128) => euint128 test 1 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(9223372036854775809n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_euint128_uint128(
      encryptedAmount.handles[0],
      9223372036854775809n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "mul" overload (euint128, uint128) => euint128 test 2 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(9223372036854775809n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_euint128_uint128(
      encryptedAmount.handles[0],
      9223372036854775809n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "mul" overload (euint128, uint128) => euint128 test 3 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(9223372036854775809n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_euint128_uint128(
      encryptedAmount.handles[0],
      9223372036854775809n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "mul" overload (euint128, uint128) => euint128 test 4 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(9223372036854775809n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_euint128_uint128(
      encryptedAmount.handles[0],
      9223372036854775809n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "mul" overload (uint128, euint128) => euint128 test 1 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(9223372036854775809n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_uint128_euint128(
      9223372036854775809n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "mul" overload (uint128, euint128) => euint128 test 2 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(9223372036854775809n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_uint128_euint128(
      9223372036854775809n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "mul" overload (uint128, euint128) => euint128 test 3 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(9223372036854775809n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_uint128_euint128(
      9223372036854775809n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "mul" overload (uint128, euint128) => euint128 test 4 (9223372036854775809, 9223372036854775809)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(9223372036854775809n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.mul_uint128_euint128(
      9223372036854775809n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(85070591730234615884290395931651604481n);
  });

  it('test operator "div" overload (euint128, uint128) => euint128 test 1 (340282366920938463463367705680651306915, 340282366920938463463366742739862533559)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463367705680651306915n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.div_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463366742739862533559n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(1n);
  });

  it('test operator "div" overload (euint128, uint128) => euint128 test 2 (340282366920938463463367705680651306911, 340282366920938463463367705680651306915)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463367705680651306911n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.div_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367705680651306915n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "div" overload (euint128, uint128) => euint128 test 3 (340282366920938463463367705680651306915, 340282366920938463463367705680651306915)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463367705680651306915n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.div_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367705680651306915n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(1n);
  });

  it('test operator "div" overload (euint128, uint128) => euint128 test 4 (340282366920938463463367705680651306915, 340282366920938463463367705680651306911)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463367705680651306915n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.div_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367705680651306911n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(1n);
  });

  it('test operator "rem" overload (euint128, uint128) => euint128 test 1 (340282366920938463463369931741646116705, 340282366920938463463367664872728450409)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463369931741646116705n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.rem_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367664872728450409n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(2266868917666296n);
  });

  it('test operator "rem" overload (euint128, uint128) => euint128 test 2 (340282366920938463463368269375231827467, 340282366920938463463368269375231827471)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463368269375231827467n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.rem_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368269375231827471n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463368269375231827467n);
  });

  it('test operator "rem" overload (euint128, uint128) => euint128 test 3 (340282366920938463463368269375231827471, 340282366920938463463368269375231827471)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463368269375231827471n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.rem_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368269375231827471n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "rem" overload (euint128, uint128) => euint128 test 4 (340282366920938463463368269375231827471, 340282366920938463463368269375231827467)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463368269375231827471n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.rem_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368269375231827467n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(4n);
  });

  it('test operator "and" overload (euint128, uint128) => euint128 test 1 (340282366920938463463372475178597850657, 340282366920938463463371704570507069167)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463372475178597850657n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463371704570507069167n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463370152863775884833n);
  });

  it('test operator "and" overload (euint128, uint128) => euint128 test 2 (340282366920938463463371539945205191643, 340282366920938463463371539945205191647)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463371539945205191643n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463371539945205191647n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371539945205191643n);
  });

  it('test operator "and" overload (euint128, uint128) => euint128 test 3 (340282366920938463463371539945205191647, 340282366920938463463371539945205191647)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463371539945205191647n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463371539945205191647n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371539945205191647n);
  });

  it('test operator "and" overload (euint128, uint128) => euint128 test 4 (340282366920938463463371539945205191647, 340282366920938463463371539945205191643)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463371539945205191647n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463371539945205191643n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371539945205191643n);
  });

  it('test operator "and" overload (uint128, euint128) => euint128 test 1 (340282366920938463463373763954875188841, 340282366920938463463371704570507069167)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463371704570507069167n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_uint128_euint128(
      340282366920938463463373763954875188841n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371512154888996457n);
  });

  it('test operator "and" overload (uint128, euint128) => euint128 test 2 (340282366920938463463371539945205191643, 340282366920938463463371539945205191647)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463371539945205191647n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_uint128_euint128(
      340282366920938463463371539945205191643n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371539945205191643n);
  });

  it('test operator "and" overload (uint128, euint128) => euint128 test 3 (340282366920938463463371539945205191647, 340282366920938463463371539945205191647)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463371539945205191647n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_uint128_euint128(
      340282366920938463463371539945205191647n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371539945205191647n);
  });

  it('test operator "and" overload (uint128, euint128) => euint128 test 4 (340282366920938463463371539945205191647, 340282366920938463463371539945205191643)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463371539945205191643n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.and_uint128_euint128(
      340282366920938463463371539945205191647n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371539945205191643n);
  });

  it('test operator "or" overload (euint128, uint128) => euint128 test 1 (340282366920938463463366140320129707777, 340282366920938463463371173930441421113)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463366140320129707777n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463371173930441421113n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371211315221102393n);
  });

  it('test operator "or" overload (euint128, uint128) => euint128 test 2 (340282366920938463463366140320129707773, 340282366920938463463366140320129707777)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463366140320129707773n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463366140320129707777n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463366140320129708029n);
  });

  it('test operator "or" overload (euint128, uint128) => euint128 test 3 (340282366920938463463366140320129707777, 340282366920938463463366140320129707777)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463366140320129707777n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463366140320129707777n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463366140320129707777n);
  });

  it('test operator "or" overload (euint128, uint128) => euint128 test 4 (340282366920938463463366140320129707777, 340282366920938463463366140320129707773)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463366140320129707777n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463366140320129707773n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463366140320129708029n);
  });

  it('test operator "or" overload (uint128, euint128) => euint128 test 1 (340282366920938463463370705494958449133, 340282366920938463463371173930441421113)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463371173930441421113n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_uint128_euint128(
      340282366920938463463370705494958449133n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463371211313878708733n);
  });

  it('test operator "or" overload (uint128, euint128) => euint128 test 2 (340282366920938463463366140320129707773, 340282366920938463463366140320129707777)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463366140320129707777n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_uint128_euint128(
      340282366920938463463366140320129707773n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463366140320129708029n);
  });

  it('test operator "or" overload (uint128, euint128) => euint128 test 3 (340282366920938463463366140320129707777, 340282366920938463463366140320129707777)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463366140320129707777n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_uint128_euint128(
      340282366920938463463366140320129707777n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463366140320129707777n);
  });

  it('test operator "or" overload (uint128, euint128) => euint128 test 4 (340282366920938463463366140320129707777, 340282366920938463463366140320129707773)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463366140320129707773n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.or_uint128_euint128(
      340282366920938463463366140320129707777n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(340282366920938463463366140320129708029n);
  });

  it('test operator "xor" overload (euint128, uint128) => euint128 test 1 (340282366920938463463369094191729414751, 340282366920938463463365995339975417665)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463369094191729414751n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463365995339975417665n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(3675555065482526n);
  });

  it('test operator "xor" overload (euint128, uint128) => euint128 test 2 (340282366920938463463366439765674393103, 340282366920938463463366439765674393107)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463366439765674393103n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463366439765674393107n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(28n);
  });

  it('test operator "xor" overload (euint128, uint128) => euint128 test 3 (340282366920938463463366439765674393107, 340282366920938463463366439765674393107)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463366439765674393107n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463366439765674393107n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (euint128, uint128) => euint128 test 4 (340282366920938463463366439765674393107, 340282366920938463463366439765674393103)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463366439765674393107n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463366439765674393103n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(28n);
  });

  it('test operator "xor" overload (uint128, euint128) => euint128 test 1 (340282366920938463463368264800525580691, 340282366920938463463365995339975417665)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463365995339975417665n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_uint128_euint128(
      340282366920938463463368264800525580691n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(2269598329972434n);
  });

  it('test operator "xor" overload (uint128, euint128) => euint128 test 2 (340282366920938463463366439765674393103, 340282366920938463463366439765674393107)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463366439765674393107n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_uint128_euint128(
      340282366920938463463366439765674393103n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(28n);
  });

  it('test operator "xor" overload (uint128, euint128) => euint128 test 3 (340282366920938463463366439765674393107, 340282366920938463463366439765674393107)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463366439765674393107n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_uint128_euint128(
      340282366920938463463366439765674393107n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (uint128, euint128) => euint128 test 4 (340282366920938463463366439765674393107, 340282366920938463463366439765674393103)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);

    input.add128(340282366920938463463366439765674393103n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.xor_uint128_euint128(
      340282366920938463463366439765674393107n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract6.resEuint128());
    expect(res).to.equal(28n);
  });

  it('test operator "eq" overload (euint128, uint128) => ebool test 1 (340282366920938463463372603939514854481, 340282366920938463463372192822705903905)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463372603939514854481n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.eq_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463372192822705903905n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint128, uint128) => ebool test 2 (340282366920938463463369473668192016213, 340282366920938463463369473668192016217)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463369473668192016213n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.eq_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463369473668192016217n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint128, uint128) => ebool test 3 (340282366920938463463369473668192016217, 340282366920938463463369473668192016217)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463369473668192016217n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.eq_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463369473668192016217n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (euint128, uint128) => ebool test 4 (340282366920938463463369473668192016217, 340282366920938463463369473668192016213)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract6Address, this.signers.alice.address);
    input.add128(340282366920938463463369473668192016217n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract6.eq_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463369473668192016213n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract6.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (uint128, euint128) => ebool test 1 (340282366920938463463366683086964379341, 340282366920938463463372192822705903905)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463372192822705903905n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint128_euint128(
      340282366920938463463366683086964379341n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (uint128, euint128) => ebool test 2 (340282366920938463463369473668192016213, 340282366920938463463369473668192016217)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463369473668192016217n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint128_euint128(
      340282366920938463463369473668192016213n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (uint128, euint128) => ebool test 3 (340282366920938463463369473668192016217, 340282366920938463463369473668192016217)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463369473668192016217n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint128_euint128(
      340282366920938463463369473668192016217n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (uint128, euint128) => ebool test 4 (340282366920938463463369473668192016217, 340282366920938463463369473668192016213)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463369473668192016213n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint128_euint128(
      340282366920938463463369473668192016217n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint128, uint128) => ebool test 1 (340282366920938463463368401506423440183, 340282366920938463463368203315164729951)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368401506423440183n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368203315164729951n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint128, uint128) => ebool test 2 (340282366920938463463368401506423440179, 340282366920938463463368401506423440183)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368401506423440179n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368401506423440183n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint128, uint128) => ebool test 3 (340282366920938463463368401506423440183, 340282366920938463463368401506423440183)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368401506423440183n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368401506423440183n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint128, uint128) => ebool test 4 (340282366920938463463368401506423440183, 340282366920938463463368401506423440179)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368401506423440183n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368401506423440179n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (uint128, euint128) => ebool test 1 (340282366920938463463365814147568481725, 340282366920938463463368203315164729951)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368203315164729951n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint128_euint128(
      340282366920938463463365814147568481725n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (uint128, euint128) => ebool test 2 (340282366920938463463368401506423440179, 340282366920938463463368401506423440183)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368401506423440183n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint128_euint128(
      340282366920938463463368401506423440179n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (uint128, euint128) => ebool test 3 (340282366920938463463368401506423440183, 340282366920938463463368401506423440183)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368401506423440183n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint128_euint128(
      340282366920938463463368401506423440183n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (uint128, euint128) => ebool test 4 (340282366920938463463368401506423440183, 340282366920938463463368401506423440179)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368401506423440179n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint128_euint128(
      340282366920938463463368401506423440183n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint128, uint128) => ebool test 1 (340282366920938463463370015569566676935, 340282366920938463463373322200287244449)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463370015569566676935n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463373322200287244449n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (euint128, uint128) => ebool test 2 (340282366920938463463368361192185026753, 340282366920938463463368361192185026757)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368361192185026753n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368361192185026757n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (euint128, uint128) => ebool test 3 (340282366920938463463368361192185026757, 340282366920938463463368361192185026757)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368361192185026757n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368361192185026757n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (euint128, uint128) => ebool test 4 (340282366920938463463368361192185026757, 340282366920938463463368361192185026753)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368361192185026757n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368361192185026753n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (uint128, euint128) => ebool test 1 (340282366920938463463370276553252026969, 340282366920938463463373322200287244449)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463373322200287244449n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_uint128_euint128(
      340282366920938463463370276553252026969n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (uint128, euint128) => ebool test 2 (340282366920938463463368361192185026753, 340282366920938463463368361192185026757)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368361192185026757n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_uint128_euint128(
      340282366920938463463368361192185026753n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ge" overload (uint128, euint128) => ebool test 3 (340282366920938463463368361192185026757, 340282366920938463463368361192185026757)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368361192185026757n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_uint128_euint128(
      340282366920938463463368361192185026757n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ge" overload (uint128, euint128) => ebool test 4 (340282366920938463463368361192185026757, 340282366920938463463368361192185026753)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368361192185026753n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ge_uint128_euint128(
      340282366920938463463368361192185026757n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (euint128, uint128) => ebool test 1 (340282366920938463463372212894396605045, 340282366920938463463371906869421406161)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463372212894396605045n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463371906869421406161n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (euint128, uint128) => ebool test 2 (340282366920938463463368791023594069087, 340282366920938463463368791023594069091)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368791023594069087n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368791023594069091n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint128, uint128) => ebool test 3 (340282366920938463463368791023594069091, 340282366920938463463368791023594069091)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368791023594069091n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368791023594069091n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (euint128, uint128) => ebool test 4 (340282366920938463463368791023594069091, 340282366920938463463368791023594069087)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368791023594069091n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368791023594069087n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "gt" overload (uint128, euint128) => ebool test 1 (340282366920938463463371216727382422089, 340282366920938463463371906869421406161)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463371906869421406161n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_uint128_euint128(
      340282366920938463463371216727382422089n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (uint128, euint128) => ebool test 2 (340282366920938463463368791023594069087, 340282366920938463463368791023594069091)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368791023594069091n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_uint128_euint128(
      340282366920938463463368791023594069087n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (uint128, euint128) => ebool test 3 (340282366920938463463368791023594069091, 340282366920938463463368791023594069091)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368791023594069091n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_uint128_euint128(
      340282366920938463463368791023594069091n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "gt" overload (uint128, euint128) => ebool test 4 (340282366920938463463368791023594069091, 340282366920938463463368791023594069087)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368791023594069087n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.gt_uint128_euint128(
      340282366920938463463368791023594069091n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint128, uint128) => ebool test 1 (340282366920938463463373167958602914643, 340282366920938463463368417910404355713)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463373167958602914643n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368417910404355713n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "le" overload (euint128, uint128) => ebool test 2 (340282366920938463463370108131481720869, 340282366920938463463370108131481720873)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463370108131481720869n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370108131481720873n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint128, uint128) => ebool test 3 (340282366920938463463370108131481720873, 340282366920938463463370108131481720873)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463370108131481720873n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370108131481720873n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (euint128, uint128) => ebool test 4 (340282366920938463463370108131481720873, 340282366920938463463370108131481720869)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463370108131481720873n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370108131481720869n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "le" overload (uint128, euint128) => ebool test 1 (340282366920938463463367293961323037811, 340282366920938463463368417910404355713)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368417910404355713n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_uint128_euint128(
      340282366920938463463367293961323037811n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (uint128, euint128) => ebool test 2 (340282366920938463463370108131481720869, 340282366920938463463370108131481720873)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463370108131481720873n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_uint128_euint128(
      340282366920938463463370108131481720869n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (uint128, euint128) => ebool test 3 (340282366920938463463370108131481720873, 340282366920938463463370108131481720873)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463370108131481720873n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_uint128_euint128(
      340282366920938463463370108131481720873n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "le" overload (uint128, euint128) => ebool test 4 (340282366920938463463370108131481720873, 340282366920938463463370108131481720869)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463370108131481720869n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.le_uint128_euint128(
      340282366920938463463370108131481720873n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint128, uint128) => ebool test 1 (340282366920938463463373457769088340497, 340282366920938463463371161257489427705)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463373457769088340497n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463371161257489427705n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint128, uint128) => ebool test 2 (340282366920938463463368705684008786245, 340282366920938463463368705684008786249)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368705684008786245n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368705684008786249n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (euint128, uint128) => ebool test 3 (340282366920938463463368705684008786249, 340282366920938463463368705684008786249)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368705684008786249n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368705684008786249n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (euint128, uint128) => ebool test 4 (340282366920938463463368705684008786249, 340282366920938463463368705684008786245)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463368705684008786249n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463368705684008786245n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (uint128, euint128) => ebool test 1 (340282366920938463463367128785525656001, 340282366920938463463371161257489427705)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463371161257489427705n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_uint128_euint128(
      340282366920938463463367128785525656001n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (uint128, euint128) => ebool test 2 (340282366920938463463368705684008786245, 340282366920938463463368705684008786249)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368705684008786249n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_uint128_euint128(
      340282366920938463463368705684008786245n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "lt" overload (uint128, euint128) => ebool test 3 (340282366920938463463368705684008786249, 340282366920938463463368705684008786249)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368705684008786249n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_uint128_euint128(
      340282366920938463463368705684008786249n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "lt" overload (uint128, euint128) => ebool test 4 (340282366920938463463368705684008786249, 340282366920938463463368705684008786245)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463368705684008786245n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.lt_uint128_euint128(
      340282366920938463463368705684008786249n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "min" overload (euint128, uint128) => euint128 test 1 (340282366920938463463371857631431566355, 340282366920938463463367622247060362157)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463371857631431566355n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367622247060362157n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367622247060362157n);
  });

  it('test operator "min" overload (euint128, uint128) => euint128 test 2 (340282366920938463463367977609417357755, 340282366920938463463367977609417357759)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463367977609417357755n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367977609417357759n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367977609417357755n);
  });

  it('test operator "min" overload (euint128, uint128) => euint128 test 3 (340282366920938463463367977609417357759, 340282366920938463463367977609417357759)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463367977609417357759n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367977609417357759n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367977609417357759n);
  });

  it('test operator "min" overload (euint128, uint128) => euint128 test 4 (340282366920938463463367977609417357759, 340282366920938463463367977609417357755)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463367977609417357759n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463367977609417357755n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367977609417357755n);
  });

  it('test operator "min" overload (uint128, euint128) => euint128 test 1 (340282366920938463463367702519420186489, 340282366920938463463367622247060362157)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463367622247060362157n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_uint128_euint128(
      340282366920938463463367702519420186489n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367622247060362157n);
  });

  it('test operator "min" overload (uint128, euint128) => euint128 test 2 (340282366920938463463367977609417357755, 340282366920938463463367977609417357759)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463367977609417357759n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_uint128_euint128(
      340282366920938463463367977609417357755n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367977609417357755n);
  });

  it('test operator "min" overload (uint128, euint128) => euint128 test 3 (340282366920938463463367977609417357759, 340282366920938463463367977609417357759)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463367977609417357759n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_uint128_euint128(
      340282366920938463463367977609417357759n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367977609417357759n);
  });

  it('test operator "min" overload (uint128, euint128) => euint128 test 4 (340282366920938463463367977609417357759, 340282366920938463463367977609417357755)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463367977609417357755n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.min_uint128_euint128(
      340282366920938463463367977609417357759n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463367977609417357755n);
  });

  it('test operator "max" overload (euint128, uint128) => euint128 test 1 (340282366920938463463374577653970290775, 340282366920938463463373128265153001227)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463374577653970290775n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463373128265153001227n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463374577653970290775n);
  });

  it('test operator "max" overload (euint128, uint128) => euint128 test 2 (340282366920938463463370932054079265289, 340282366920938463463370932054079265293)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463370932054079265289n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370932054079265293n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463370932054079265293n);
  });

  it('test operator "max" overload (euint128, uint128) => euint128 test 3 (340282366920938463463370932054079265293, 340282366920938463463370932054079265293)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463370932054079265293n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370932054079265293n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463370932054079265293n);
  });

  it('test operator "max" overload (euint128, uint128) => euint128 test 4 (340282366920938463463370932054079265293, 340282366920938463463370932054079265289)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add128(340282366920938463463370932054079265293n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_euint128_uint128(
      encryptedAmount.handles[0],
      340282366920938463463370932054079265289n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463370932054079265293n);
  });

  it('test operator "max" overload (uint128, euint128) => euint128 test 1 (340282366920938463463369519772612328931, 340282366920938463463373128265153001227)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463373128265153001227n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_uint128_euint128(
      340282366920938463463369519772612328931n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463373128265153001227n);
  });

  it('test operator "max" overload (uint128, euint128) => euint128 test 2 (340282366920938463463370932054079265289, 340282366920938463463370932054079265293)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463370932054079265293n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_uint128_euint128(
      340282366920938463463370932054079265289n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463370932054079265293n);
  });

  it('test operator "max" overload (uint128, euint128) => euint128 test 3 (340282366920938463463370932054079265293, 340282366920938463463370932054079265293)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463370932054079265293n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_uint128_euint128(
      340282366920938463463370932054079265293n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463370932054079265293n);
  });

  it('test operator "max" overload (uint128, euint128) => euint128 test 4 (340282366920938463463370932054079265293, 340282366920938463463370932054079265289)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add128(340282366920938463463370932054079265289n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.max_uint128_euint128(
      340282366920938463463370932054079265293n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt128(await this.contract7.resEuint128());
    expect(res).to.equal(340282366920938463463370932054079265293n);
  });

  it('test operator "and" overload (euint256, uint256) => euint256 test 1 (115792089237316195423570985008687907853269984665640564039457579856283267511697, 115792089237316195423570985008687907853269984665640564039457581546070356231267)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457579856283267511697n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457581546070356231267n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457579856247565583361n);
  });

  it('test operator "and" overload (euint256, uint256) => euint256 test 2 (115792089237316195423570985008687907853269984665640564039457575562704967882267, 115792089237316195423570985008687907853269984665640564039457575562704967882271)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457575562704967882267n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457575562704967882271n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575562704967882267n);
  });

  it('test operator "and" overload (euint256, uint256) => euint256 test 3 (115792089237316195423570985008687907853269984665640564039457575562704967882271, 115792089237316195423570985008687907853269984665640564039457575562704967882271)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457575562704967882271n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457575562704967882271n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575562704967882271n);
  });

  it('test operator "and" overload (euint256, uint256) => euint256 test 4 (115792089237316195423570985008687907853269984665640564039457575562704967882271, 115792089237316195423570985008687907853269984665640564039457575562704967882267)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457575562704967882271n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457575562704967882267n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575562704967882267n);
  });

  it('test operator "and" overload (uint256, euint256) => euint256 test 1 (115792089237316195423570985008687907853269984665640564039457579164121774590269, 115792089237316195423570985008687907853269984665640564039457581546070356231267)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457581546070356231267n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457579164121774590269n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457576760553117483041n);
  });

  it('test operator "and" overload (uint256, euint256) => euint256 test 2 (115792089237316195423570985008687907853269984665640564039457575562704967882267, 115792089237316195423570985008687907853269984665640564039457575562704967882271)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457575562704967882271n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457575562704967882267n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575562704967882267n);
  });

  it('test operator "and" overload (uint256, euint256) => euint256 test 3 (115792089237316195423570985008687907853269984665640564039457575562704967882271, 115792089237316195423570985008687907853269984665640564039457575562704967882271)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457575562704967882271n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457575562704967882271n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575562704967882271n);
  });

  it('test operator "and" overload (uint256, euint256) => euint256 test 4 (115792089237316195423570985008687907853269984665640564039457575562704967882271, 115792089237316195423570985008687907853269984665640564039457575562704967882267)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457575562704967882267n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.and_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457575562704967882271n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575562704967882267n);
  });

  it('test operator "or" overload (euint256, uint256) => euint256 test 1 (115792089237316195423570985008687907853269984665640564039457581251147023741681, 115792089237316195423570985008687907853269984665640564039457575285955187757451)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457581251147023741681n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457575285955187757451n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457581536198099727355n);
  });

  it('test operator "or" overload (euint256, uint256) => euint256 test 2 (115792089237316195423570985008687907853269984665640564039457575748047825774611, 115792089237316195423570985008687907853269984665640564039457575748047825774615)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457575748047825774611n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457575748047825774615n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
  });

  it('test operator "or" overload (euint256, uint256) => euint256 test 3 (115792089237316195423570985008687907853269984665640564039457575748047825774615, 115792089237316195423570985008687907853269984665640564039457575748047825774615)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457575748047825774615n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457575748047825774615n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
  });

  it('test operator "or" overload (euint256, uint256) => euint256 test 4 (115792089237316195423570985008687907853269984665640564039457575748047825774615, 115792089237316195423570985008687907853269984665640564039457575748047825774611)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457575748047825774615n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457575748047825774611n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
  });

  it('test operator "or" overload (uint256, euint256) => euint256 test 1 (115792089237316195423570985008687907853269984665640564039457575321798197752461, 115792089237316195423570985008687907853269984665640564039457575285955187757451)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457575285955187757451n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457575321798197752461n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575325546263475087n);
  });

  it('test operator "or" overload (uint256, euint256) => euint256 test 2 (115792089237316195423570985008687907853269984665640564039457575748047825774611, 115792089237316195423570985008687907853269984665640564039457575748047825774615)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457575748047825774611n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
  });

  it('test operator "or" overload (uint256, euint256) => euint256 test 3 (115792089237316195423570985008687907853269984665640564039457575748047825774615, 115792089237316195423570985008687907853269984665640564039457575748047825774615)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457575748047825774615n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
  });

  it('test operator "or" overload (uint256, euint256) => euint256 test 4 (115792089237316195423570985008687907853269984665640564039457575748047825774615, 115792089237316195423570985008687907853269984665640564039457575748047825774611)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457575748047825774611n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.or_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457575748047825774615n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(115792089237316195423570985008687907853269984665640564039457575748047825774615n);
  });

  it('test operator "xor" overload (euint256, uint256) => euint256 test 1 (115792089237316195423570985008687907853269984665640564039457577807652952032127, 115792089237316195423570985008687907853269984665640564039457577495140340093663)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457577807652952032127n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457577495140340093663n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(321398945419680n);
  });

  it('test operator "xor" overload (euint256, uint256) => euint256 test 2 (115792089237316195423570985008687907853269984665640564039457577807652952032123, 115792089237316195423570985008687907853269984665640564039457577807652952032127)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457577807652952032123n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457577807652952032127n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(4n);
  });

  it('test operator "xor" overload (euint256, uint256) => euint256 test 3 (115792089237316195423570985008687907853269984665640564039457577807652952032127, 115792089237316195423570985008687907853269984665640564039457577807652952032127)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457577807652952032127n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457577807652952032127n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (euint256, uint256) => euint256 test 4 (115792089237316195423570985008687907853269984665640564039457577807652952032127, 115792089237316195423570985008687907853269984665640564039457577807652952032123)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457577807652952032127n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457577807652952032123n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(4n);
  });

  it('test operator "xor" overload (uint256, euint256) => euint256 test 1 (115792089237316195423570985008687907853269984665640564039457582730114431069113, 115792089237316195423570985008687907853269984665640564039457577495140340093663)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457577495140340093663n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457582730114431069113n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(5534338713811302n);
  });

  it('test operator "xor" overload (uint256, euint256) => euint256 test 2 (115792089237316195423570985008687907853269984665640564039457577807652952032123, 115792089237316195423570985008687907853269984665640564039457577807652952032127)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457577807652952032127n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457577807652952032123n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(4n);
  });

  it('test operator "xor" overload (uint256, euint256) => euint256 test 3 (115792089237316195423570985008687907853269984665640564039457577807652952032127, 115792089237316195423570985008687907853269984665640564039457577807652952032127)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457577807652952032127n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457577807652952032127n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(0n);
  });

  it('test operator "xor" overload (uint256, euint256) => euint256 test 4 (115792089237316195423570985008687907853269984665640564039457577807652952032127, 115792089237316195423570985008687907853269984665640564039457577807652952032123)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457577807652952032123n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.xor_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457577807652952032127n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt256(await this.contract7.resEuint256());
    expect(res).to.equal(4n);
  });

  it('test operator "eq" overload (euint256, uint256) => ebool test 1 (115792089237316195423570985008687907853269984665640564039457580704380952249099, 115792089237316195423570985008687907853269984665640564039457577213107634213659)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457580704380952249099n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457577213107634213659n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint256, uint256) => ebool test 2 (115792089237316195423570985008687907853269984665640564039457580704380952249095, 115792089237316195423570985008687907853269984665640564039457580704380952249099)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457580704380952249095n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457580704380952249099n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (euint256, uint256) => ebool test 3 (115792089237316195423570985008687907853269984665640564039457580704380952249099, 115792089237316195423570985008687907853269984665640564039457580704380952249099)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457580704380952249099n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457580704380952249099n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (euint256, uint256) => ebool test 4 (115792089237316195423570985008687907853269984665640564039457580704380952249099, 115792089237316195423570985008687907853269984665640564039457580704380952249095)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457580704380952249099n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457580704380952249095n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (uint256, euint256) => ebool test 1 (115792089237316195423570985008687907853269984665640564039457580028825026985165, 115792089237316195423570985008687907853269984665640564039457577213107634213659)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457577213107634213659n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457580028825026985165n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (uint256, euint256) => ebool test 2 (115792089237316195423570985008687907853269984665640564039457580704380952249095, 115792089237316195423570985008687907853269984665640564039457580704380952249099)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457580704380952249099n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457580704380952249095n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "eq" overload (uint256, euint256) => ebool test 3 (115792089237316195423570985008687907853269984665640564039457580704380952249099, 115792089237316195423570985008687907853269984665640564039457580704380952249099)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457580704380952249099n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457580704380952249099n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "eq" overload (uint256, euint256) => ebool test 4 (115792089237316195423570985008687907853269984665640564039457580704380952249099, 115792089237316195423570985008687907853269984665640564039457580704380952249095)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457580704380952249095n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.eq_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457580704380952249099n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint256, uint256) => ebool test 1 (115792089237316195423570985008687907853269984665640564039457580463351507952143, 115792089237316195423570985008687907853269984665640564039457578554314931968863)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457580463351507952143n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457578554314931968863n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint256, uint256) => ebool test 2 (115792089237316195423570985008687907853269984665640564039457576021900781585081, 115792089237316195423570985008687907853269984665640564039457576021900781585085)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457576021900781585081n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457576021900781585085n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (euint256, uint256) => ebool test 3 (115792089237316195423570985008687907853269984665640564039457576021900781585085, 115792089237316195423570985008687907853269984665640564039457576021900781585085)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457576021900781585085n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457576021900781585085n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (euint256, uint256) => ebool test 4 (115792089237316195423570985008687907853269984665640564039457576021900781585085, 115792089237316195423570985008687907853269984665640564039457576021900781585081)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add256(115792089237316195423570985008687907853269984665640564039457576021900781585085n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_euint256_uint256(
      encryptedAmount.handles[0],
      115792089237316195423570985008687907853269984665640564039457576021900781585081n,
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (uint256, euint256) => ebool test 1 (115792089237316195423570985008687907853269984665640564039457583604748364078007, 115792089237316195423570985008687907853269984665640564039457578554314931968863)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457578554314931968863n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457583604748364078007n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (uint256, euint256) => ebool test 2 (115792089237316195423570985008687907853269984665640564039457576021900781585081, 115792089237316195423570985008687907853269984665640564039457576021900781585085)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457576021900781585085n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457576021900781585081n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "ne" overload (uint256, euint256) => ebool test 3 (115792089237316195423570985008687907853269984665640564039457576021900781585085, 115792089237316195423570985008687907853269984665640564039457576021900781585085)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457576021900781585085n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457576021900781585085n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(false);
  });

  it('test operator "ne" overload (uint256, euint256) => ebool test 4 (115792089237316195423570985008687907853269984665640564039457576021900781585085, 115792089237316195423570985008687907853269984665640564039457576021900781585081)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);

    input.add256(115792089237316195423570985008687907853269984665640564039457576021900781585081n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.ne_uint256_euint256(
      115792089237316195423570985008687907853269984665640564039457576021900781585085n,
      encryptedAmount.handles[0],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decryptBool(await this.contract7.resEbool());
    expect(res).to.equal(true);
  });

  it('test operator "shl" overload (euint8, euint8) => euint8 test 1 (184, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(184n);
    input.add8(10n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(224n);
  });

  it('test operator "shl" overload (euint8, euint8) => euint8 test 2 (6, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(6n);
    input.add8(10n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(24n);
  });

  it('test operator "shl" overload (euint8, euint8) => euint8 test 3 (10, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(10n);
    input.add8(10n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(40n);
  });

  it('test operator "shl" overload (euint8, euint8) => euint8 test 4 (10, 6)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(10n);
    input.add8(6n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(128n);
  });

  it('test operator "shl" overload (euint8, uint8) => euint8 test 1 (184, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(184n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_uint8(encryptedAmount.handles[0], 10n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(224n);
  });

  it('test operator "shl" overload (euint8, uint8) => euint8 test 2 (6, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(6n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_uint8(encryptedAmount.handles[0], 10n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(24n);
  });

  it('test operator "shl" overload (euint8, uint8) => euint8 test 3 (10, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(10n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_uint8(encryptedAmount.handles[0], 10n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(40n);
  });

  it('test operator "shl" overload (euint8, uint8) => euint8 test 4 (10, 6)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(10n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shl_euint8_uint8(encryptedAmount.handles[0], 6n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(128n);
  });

  it('test operator "shr" overload (euint8, euint8) => euint8 test 1 (69, 5)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(69n);
    input.add8(5n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(2n);
  });

  it('test operator "shr" overload (euint8, euint8) => euint8 test 2 (1, 5)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(1n);
    input.add8(5n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(0n);
  });

  it('test operator "shr" overload (euint8, euint8) => euint8 test 3 (5, 5)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(5n);
    input.add8(5n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(0n);
  });

  it('test operator "shr" overload (euint8, euint8) => euint8 test 4 (5, 1)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(5n);
    input.add8(1n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(2n);
  });

  it('test operator "shr" overload (euint8, uint8) => euint8 test 1 (69, 5)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(69n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_uint8(encryptedAmount.handles[0], 5n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(2n);
  });

  it('test operator "shr" overload (euint8, uint8) => euint8 test 2 (1, 5)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(1n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_uint8(encryptedAmount.handles[0], 5n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(0n);
  });

  it('test operator "shr" overload (euint8, uint8) => euint8 test 3 (5, 5)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(5n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_uint8(encryptedAmount.handles[0], 5n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(0n);
  });

  it('test operator "shr" overload (euint8, uint8) => euint8 test 4 (5, 1)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(5n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.shr_euint8_uint8(encryptedAmount.handles[0], 1n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(2n);
  });

  it('test operator "rotl" overload (euint8, euint8) => euint8 test 1 (218, 7)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(218n);
    input.add8(7n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(109n);
  });

  it('test operator "rotl" overload (euint8, euint8) => euint8 test 2 (3, 7)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(3n);
    input.add8(7n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(129n);
  });

  it('test operator "rotl" overload (euint8, euint8) => euint8 test 3 (7, 7)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(7n);
    input.add8(7n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(131n);
  });

  it('test operator "rotl" overload (euint8, euint8) => euint8 test 4 (7, 3)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(7n);
    input.add8(3n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(56n);
  });

  it('test operator "rotl" overload (euint8, uint8) => euint8 test 1 (218, 7)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(218n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_uint8(encryptedAmount.handles[0], 7n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(109n);
  });

  it('test operator "rotl" overload (euint8, uint8) => euint8 test 2 (3, 7)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(3n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_uint8(encryptedAmount.handles[0], 7n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(129n);
  });

  it('test operator "rotl" overload (euint8, uint8) => euint8 test 3 (7, 7)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(7n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_uint8(encryptedAmount.handles[0], 7n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(131n);
  });

  it('test operator "rotl" overload (euint8, uint8) => euint8 test 4 (7, 3)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(7n);

    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotl_euint8_uint8(encryptedAmount.handles[0], 3n, encryptedAmount.inputProof);
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(56n);
  });

  it('test operator "rotr" overload (euint8, euint8) => euint8 test 1 (160, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(160n);
    input.add8(10n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(40n);
  });

  it('test operator "rotr" overload (euint8, euint8) => euint8 test 2 (6, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(6n);
    input.add8(10n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(129n);
  });

  it('test operator "rotr" overload (euint8, euint8) => euint8 test 3 (10, 10)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(10n);
    input.add8(10n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(130n);
  });

  it('test operator "rotr" overload (euint8, euint8) => euint8 test 4 (10, 6)', async function () {
    const input = this.instances.alice.createEncryptedInput(this.contract7Address, this.signers.alice.address);
    input.add8(10n);
    input.add8(6n);
    const encryptedAmount = await input.encrypt();
    const tx = await this.contract7.rotr_euint8_euint8(
      encryptedAmount.handles[0],
      encryptedAmount.handles[1],
      encryptedAmount.inputProof,
    );
    await tx.wait();
    const res = await decrypt8(await this.contract7.resEuint8());
    expect(res).to.equal(40n);
  });
});
