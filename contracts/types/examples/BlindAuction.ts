/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface BlindAuctionInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "acceptOwnership"
      | "auctionEnd"
      | "beneficiary"
      | "bid"
      | "bidCounter"
      | "claim"
      | "decryptWinningTicket"
      | "endTime"
      | "getBid"
      | "getDecryptedWinningTicket"
      | "manuallyStopped"
      | "owner"
      | "pendingOwner"
      | "renounceOwnership"
      | "setDecryptedWinningTicket"
      | "stop"
      | "stoppable"
      | "ticketUser"
      | "tokenContract"
      | "tokenTransferred"
      | "transferOwnership"
      | "withdraw"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "OwnershipTransferStarted" | "OwnershipTransferred"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "acceptOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "auctionEnd",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "beneficiary",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "bid",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "bidCounter",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "claim", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "decryptWinningTicket",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "endTime", values?: undefined): string;
  encodeFunctionData(functionFragment: "getBid", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "getDecryptedWinningTicket",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "manuallyStopped",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setDecryptedWinningTicket",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "stop", values?: undefined): string;
  encodeFunctionData(functionFragment: "stoppable", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ticketUser",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokenTransferred",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "withdraw", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "acceptOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "auctionEnd", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "beneficiary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "bid", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "bidCounter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "decryptWinningTicket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "endTime", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getBid", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDecryptedWinningTicket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "manuallyStopped",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDecryptedWinningTicket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stop", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stoppable", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ticketUser", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenTransferred",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
}

export namespace OwnershipTransferStartedEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface BlindAuction extends BaseContract {
  connect(runner?: ContractRunner | null): BlindAuction;
  waitForDeployment(): Promise<this>;

  interface: BlindAuctionInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  acceptOwnership: TypedContractMethod<[], [void], "nonpayable">;

  auctionEnd: TypedContractMethod<[], [void], "nonpayable">;

  beneficiary: TypedContractMethod<[], [string], "view">;

  bid: TypedContractMethod<
    [encryptedValue: BytesLike, inputProof: BytesLike],
    [void],
    "nonpayable"
  >;

  bidCounter: TypedContractMethod<[], [bigint], "view">;

  claim: TypedContractMethod<[], [void], "nonpayable">;

  decryptWinningTicket: TypedContractMethod<[], [void], "nonpayable">;

  endTime: TypedContractMethod<[], [bigint], "view">;

  getBid: TypedContractMethod<[account: AddressLike], [bigint], "view">;

  getDecryptedWinningTicket: TypedContractMethod<[], [bigint], "view">;

  manuallyStopped: TypedContractMethod<[], [boolean], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  pendingOwner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setDecryptedWinningTicket: TypedContractMethod<
    [arg0: BigNumberish, resultDecryption: BigNumberish],
    [void],
    "nonpayable"
  >;

  stop: TypedContractMethod<[], [void], "nonpayable">;

  stoppable: TypedContractMethod<[], [boolean], "view">;

  ticketUser: TypedContractMethod<[account: AddressLike], [bigint], "view">;

  tokenContract: TypedContractMethod<[], [string], "view">;

  tokenTransferred: TypedContractMethod<[], [boolean], "view">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  withdraw: TypedContractMethod<[], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "acceptOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "auctionEnd"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "beneficiary"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "bid"
  ): TypedContractMethod<
    [encryptedValue: BytesLike, inputProof: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "bidCounter"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "claim"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "decryptWinningTicket"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "endTime"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getBid"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getDecryptedWinningTicket"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "manuallyStopped"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pendingOwner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setDecryptedWinningTicket"
  ): TypedContractMethod<
    [arg0: BigNumberish, resultDecryption: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "stop"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "stoppable"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "ticketUser"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "tokenContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "tokenTransferred"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "withdraw"
  ): TypedContractMethod<[], [void], "nonpayable">;

  getEvent(
    key: "OwnershipTransferStarted"
  ): TypedContractEvent<
    OwnershipTransferStartedEvent.InputTuple,
    OwnershipTransferStartedEvent.OutputTuple,
    OwnershipTransferStartedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "OwnershipTransferStarted(address,address)": TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;
    OwnershipTransferStarted: TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}