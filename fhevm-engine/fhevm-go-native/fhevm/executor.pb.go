// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.34.2
// 	protoc        v5.27.3
// source: executor.proto

package fhevm

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type SyncComputeError int32

const (
	SyncComputeError_BAD_INPUT_LIST         SyncComputeError = 0
	SyncComputeError_BAD_INPUT_CIPHERTEXT   SyncComputeError = 1
	SyncComputeError_INVALID_OPERATION      SyncComputeError = 2
	SyncComputeError_UNSUPPORTED_OPERATION  SyncComputeError = 3
	SyncComputeError_BAD_INPUTS             SyncComputeError = 4
	SyncComputeError_UNKNOWN_HANDLE         SyncComputeError = 5
	SyncComputeError_COMPUTATION_FAILED     SyncComputeError = 6
	SyncComputeError_BAD_RESULT_HANDLES     SyncComputeError = 7
	SyncComputeError_UNSATISFIED_DEPENDENCE SyncComputeError = 8
)

// Enum value maps for SyncComputeError.
var (
	SyncComputeError_name = map[int32]string{
		0: "BAD_INPUT_LIST",
		1: "BAD_INPUT_CIPHERTEXT",
		2: "INVALID_OPERATION",
		3: "UNSUPPORTED_OPERATION",
		4: "BAD_INPUTS",
		5: "UNKNOWN_HANDLE",
		6: "COMPUTATION_FAILED",
		7: "BAD_RESULT_HANDLES",
		8: "UNSATISFIED_DEPENDENCE",
	}
	SyncComputeError_value = map[string]int32{
		"BAD_INPUT_LIST":         0,
		"BAD_INPUT_CIPHERTEXT":   1,
		"INVALID_OPERATION":      2,
		"UNSUPPORTED_OPERATION":  3,
		"BAD_INPUTS":             4,
		"UNKNOWN_HANDLE":         5,
		"COMPUTATION_FAILED":     6,
		"BAD_RESULT_HANDLES":     7,
		"UNSATISFIED_DEPENDENCE": 8,
	}
)

func (x SyncComputeError) Enum() *SyncComputeError {
	p := new(SyncComputeError)
	*p = x
	return p
}

func (x SyncComputeError) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (SyncComputeError) Descriptor() protoreflect.EnumDescriptor {
	return file_executor_proto_enumTypes[0].Descriptor()
}

func (SyncComputeError) Type() protoreflect.EnumType {
	return &file_executor_proto_enumTypes[0]
}

func (x SyncComputeError) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use SyncComputeError.Descriptor instead.
func (SyncComputeError) EnumDescriptor() ([]byte, []int) {
	return file_executor_proto_rawDescGZIP(), []int{0}
}

type SyncComputeRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Ordered list of computations.
	Computations []*SyncComputation `protobuf:"bytes,1,rep,name=computations,proto3" json:"computations,omitempty"`
	// Multiple serialized `tfhe::ProvenCompactCiphertextList`s. A list can contain multiple ciphertexts.
	// Note: used for inputs by fhEVM-native.
	CompactCiphertextLists [][]byte `protobuf:"bytes,2,rep,name=compact_ciphertext_lists,json=compactCiphertextLists,proto3" json:"compact_ciphertext_lists,omitempty"`
	// Multiple compressed ciphertexts.
	// Note: used for ciphertexts stored in the state of fhEVM-native.
	CompressedCiphertexts []*CompressedCiphertext `protobuf:"bytes,3,rep,name=compressed_ciphertexts,json=compressedCiphertexts,proto3" json:"compressed_ciphertexts,omitempty"`
}

func (x *SyncComputeRequest) Reset() {
	*x = SyncComputeRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_executor_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SyncComputeRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SyncComputeRequest) ProtoMessage() {}

func (x *SyncComputeRequest) ProtoReflect() protoreflect.Message {
	mi := &file_executor_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SyncComputeRequest.ProtoReflect.Descriptor instead.
func (*SyncComputeRequest) Descriptor() ([]byte, []int) {
	return file_executor_proto_rawDescGZIP(), []int{0}
}

func (x *SyncComputeRequest) GetComputations() []*SyncComputation {
	if x != nil {
		return x.Computations
	}
	return nil
}

func (x *SyncComputeRequest) GetCompactCiphertextLists() [][]byte {
	if x != nil {
		return x.CompactCiphertextLists
	}
	return nil
}

func (x *SyncComputeRequest) GetCompressedCiphertexts() []*CompressedCiphertext {
	if x != nil {
		return x.CompressedCiphertexts
	}
	return nil
}

type SyncComputeResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Types that are assignable to Resp:
	//
	//	*SyncComputeResponse_Error
	//	*SyncComputeResponse_ResultCiphertexts
	Resp isSyncComputeResponse_Resp `protobuf_oneof:"resp"`
}

func (x *SyncComputeResponse) Reset() {
	*x = SyncComputeResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_executor_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SyncComputeResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SyncComputeResponse) ProtoMessage() {}

func (x *SyncComputeResponse) ProtoReflect() protoreflect.Message {
	mi := &file_executor_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SyncComputeResponse.ProtoReflect.Descriptor instead.
func (*SyncComputeResponse) Descriptor() ([]byte, []int) {
	return file_executor_proto_rawDescGZIP(), []int{1}
}

func (m *SyncComputeResponse) GetResp() isSyncComputeResponse_Resp {
	if m != nil {
		return m.Resp
	}
	return nil
}

func (x *SyncComputeResponse) GetError() SyncComputeError {
	if x, ok := x.GetResp().(*SyncComputeResponse_Error); ok {
		return x.Error
	}
	return SyncComputeError_BAD_INPUT_LIST
}

func (x *SyncComputeResponse) GetResultCiphertexts() *ResultCiphertexts {
	if x, ok := x.GetResp().(*SyncComputeResponse_ResultCiphertexts); ok {
		return x.ResultCiphertexts
	}
	return nil
}

type isSyncComputeResponse_Resp interface {
	isSyncComputeResponse_Resp()
}

type SyncComputeResponse_Error struct {
	Error SyncComputeError `protobuf:"varint,1,opt,name=error,proto3,enum=fhevm.executor.SyncComputeError,oneof"`
}

type SyncComputeResponse_ResultCiphertexts struct {
	// Note: handles in `result_ciphertexts` will be the same ones as `SyncComputeRequest.result_handles`.
	ResultCiphertexts *ResultCiphertexts `protobuf:"bytes,2,opt,name=result_ciphertexts,json=resultCiphertexts,proto3,oneof"`
}

func (*SyncComputeResponse_Error) isSyncComputeResponse_Resp() {}

func (*SyncComputeResponse_ResultCiphertexts) isSyncComputeResponse_Resp() {}

type ResultCiphertexts struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Ciphertexts []*CompressedCiphertext `protobuf:"bytes,1,rep,name=ciphertexts,proto3" json:"ciphertexts,omitempty"`
}

func (x *ResultCiphertexts) Reset() {
	*x = ResultCiphertexts{}
	if protoimpl.UnsafeEnabled {
		mi := &file_executor_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ResultCiphertexts) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ResultCiphertexts) ProtoMessage() {}

func (x *ResultCiphertexts) ProtoReflect() protoreflect.Message {
	mi := &file_executor_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ResultCiphertexts.ProtoReflect.Descriptor instead.
func (*ResultCiphertexts) Descriptor() ([]byte, []int) {
	return file_executor_proto_rawDescGZIP(), []int{2}
}

func (x *ResultCiphertexts) GetCiphertexts() []*CompressedCiphertext {
	if x != nil {
		return x.Ciphertexts
	}
	return nil
}

type SyncComputation struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Operation FheOperation `protobuf:"varint,1,opt,name=operation,proto3,enum=fhevm.common.FheOperation" json:"operation,omitempty"`
	// A list of ordered computations.
	Inputs []*SyncInput `protobuf:"bytes,2,rep,name=inputs,proto3" json:"inputs,omitempty"`
	// The result handles after execution the operation on the inputs.
	ResultHandles [][]byte `protobuf:"bytes,3,rep,name=result_handles,json=resultHandles,proto3" json:"result_handles,omitempty"`
}

func (x *SyncComputation) Reset() {
	*x = SyncComputation{}
	if protoimpl.UnsafeEnabled {
		mi := &file_executor_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SyncComputation) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SyncComputation) ProtoMessage() {}

func (x *SyncComputation) ProtoReflect() protoreflect.Message {
	mi := &file_executor_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SyncComputation.ProtoReflect.Descriptor instead.
func (*SyncComputation) Descriptor() ([]byte, []int) {
	return file_executor_proto_rawDescGZIP(), []int{3}
}

func (x *SyncComputation) GetOperation() FheOperation {
	if x != nil {
		return x.Operation
	}
	return FheOperation_FHE_ADD
}

func (x *SyncComputation) GetInputs() []*SyncInput {
	if x != nil {
		return x.Inputs
	}
	return nil
}

func (x *SyncComputation) GetResultHandles() [][]byte {
	if x != nil {
		return x.ResultHandles
	}
	return nil
}

type CompressedCiphertext struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Handle []byte `protobuf:"bytes,1,opt,name=handle,proto3" json:"handle,omitempty"`
	// Serialized as a `tfhe::CompressedCiphertextList`. A list contains one ciphertext.
	Serialization []byte `protobuf:"bytes,2,opt,name=serialization,proto3" json:"serialization,omitempty"`
}

func (x *CompressedCiphertext) Reset() {
	*x = CompressedCiphertext{}
	if protoimpl.UnsafeEnabled {
		mi := &file_executor_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CompressedCiphertext) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CompressedCiphertext) ProtoMessage() {}

func (x *CompressedCiphertext) ProtoReflect() protoreflect.Message {
	mi := &file_executor_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CompressedCiphertext.ProtoReflect.Descriptor instead.
func (*CompressedCiphertext) Descriptor() ([]byte, []int) {
	return file_executor_proto_rawDescGZIP(), []int{4}
}

func (x *CompressedCiphertext) GetHandle() []byte {
	if x != nil {
		return x.Handle
	}
	return nil
}

func (x *CompressedCiphertext) GetSerialization() []byte {
	if x != nil {
		return x.Serialization
	}
	return nil
}

type SyncInput struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Types that are assignable to Input:
	//
	//	*SyncInput_Handle
	//	*SyncInput_Scalar
	Input isSyncInput_Input `protobuf_oneof:"input"`
}

func (x *SyncInput) Reset() {
	*x = SyncInput{}
	if protoimpl.UnsafeEnabled {
		mi := &file_executor_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *SyncInput) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*SyncInput) ProtoMessage() {}

func (x *SyncInput) ProtoReflect() protoreflect.Message {
	mi := &file_executor_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use SyncInput.ProtoReflect.Descriptor instead.
func (*SyncInput) Descriptor() ([]byte, []int) {
	return file_executor_proto_rawDescGZIP(), []int{5}
}

func (m *SyncInput) GetInput() isSyncInput_Input {
	if m != nil {
		return m.Input
	}
	return nil
}

func (x *SyncInput) GetHandle() []byte {
	if x, ok := x.GetInput().(*SyncInput_Handle); ok {
		return x.Handle
	}
	return nil
}

func (x *SyncInput) GetScalar() []byte {
	if x, ok := x.GetInput().(*SyncInput_Scalar); ok {
		return x.Scalar
	}
	return nil
}

type isSyncInput_Input interface {
	isSyncInput_Input()
}

type SyncInput_Handle struct {
	// A handle that points to either an input ciphertext in `SyncComputeRequest.compact_ciphertext_lists`
	// or `SyncComputeRequest.compressed_ciphertext_lists`.
	Handle []byte `protobuf:"bytes,1,opt,name=handle,proto3,oneof"`
}

type SyncInput_Scalar struct {
	// A scalar value. Dependent on the operation, but typically big-endian integers.
	Scalar []byte `protobuf:"bytes,2,opt,name=scalar,proto3,oneof"`
}

func (*SyncInput_Handle) isSyncInput_Input() {}

func (*SyncInput_Scalar) isSyncInput_Input() {}

var File_executor_proto protoreflect.FileDescriptor

var file_executor_proto_rawDesc = []byte{
	0x0a, 0x0e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x12, 0x0e, 0x66, 0x68, 0x65, 0x76, 0x6d, 0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72,
	0x1a, 0x0c, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0xf0,
	0x01, 0x0a, 0x12, 0x53, 0x79, 0x6e, 0x63, 0x43, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x65, 0x52, 0x65,
	0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x43, 0x0a, 0x0c, 0x63, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x61,
	0x74, 0x69, 0x6f, 0x6e, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x1f, 0x2e, 0x66, 0x68,
	0x65, 0x76, 0x6d, 0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x53, 0x79, 0x6e,
	0x63, 0x43, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x52, 0x0c, 0x63, 0x6f,
	0x6d, 0x70, 0x75, 0x74, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x12, 0x38, 0x0a, 0x18, 0x63, 0x6f,
	0x6d, 0x70, 0x61, 0x63, 0x74, 0x5f, 0x63, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74,
	0x5f, 0x6c, 0x69, 0x73, 0x74, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x0c, 0x52, 0x16, 0x63, 0x6f,
	0x6d, 0x70, 0x61, 0x63, 0x74, 0x43, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x4c,
	0x69, 0x73, 0x74, 0x73, 0x12, 0x5b, 0x0a, 0x16, 0x63, 0x6f, 0x6d, 0x70, 0x72, 0x65, 0x73, 0x73,
	0x65, 0x64, 0x5f, 0x63, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x73, 0x18, 0x03,
	0x20, 0x03, 0x28, 0x0b, 0x32, 0x24, 0x2e, 0x66, 0x68, 0x65, 0x76, 0x6d, 0x2e, 0x65, 0x78, 0x65,
	0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x43, 0x6f, 0x6d, 0x70, 0x72, 0x65, 0x73, 0x73, 0x65, 0x64,
	0x43, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x52, 0x15, 0x63, 0x6f, 0x6d, 0x70,
	0x72, 0x65, 0x73, 0x73, 0x65, 0x64, 0x43, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74,
	0x73, 0x22, 0xab, 0x01, 0x0a, 0x13, 0x53, 0x79, 0x6e, 0x63, 0x43, 0x6f, 0x6d, 0x70, 0x75, 0x74,
	0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x38, 0x0a, 0x05, 0x65, 0x72, 0x72,
	0x6f, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0e, 0x32, 0x20, 0x2e, 0x66, 0x68, 0x65, 0x76, 0x6d,
	0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x53, 0x79, 0x6e, 0x63, 0x43, 0x6f,
	0x6d, 0x70, 0x75, 0x74, 0x65, 0x45, 0x72, 0x72, 0x6f, 0x72, 0x48, 0x00, 0x52, 0x05, 0x65, 0x72,
	0x72, 0x6f, 0x72, 0x12, 0x52, 0x0a, 0x12, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x5f, 0x63, 0x69,
	0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x73, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0b, 0x32,
	0x21, 0x2e, 0x66, 0x68, 0x65, 0x76, 0x6d, 0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72,
	0x2e, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x43, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78,
	0x74, 0x73, 0x48, 0x00, 0x52, 0x11, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x43, 0x69, 0x70, 0x68,
	0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x73, 0x42, 0x06, 0x0a, 0x04, 0x72, 0x65, 0x73, 0x70, 0x22,
	0x5b, 0x0a, 0x11, 0x52, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x43, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74,
	0x65, 0x78, 0x74, 0x73, 0x12, 0x46, 0x0a, 0x0b, 0x63, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65,
	0x78, 0x74, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x24, 0x2e, 0x66, 0x68, 0x65, 0x76,
	0x6d, 0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x43, 0x6f, 0x6d, 0x70, 0x72,
	0x65, 0x73, 0x73, 0x65, 0x64, 0x43, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x52,
	0x0b, 0x63, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x73, 0x22, 0xa5, 0x01, 0x0a,
	0x0f, 0x53, 0x79, 0x6e, 0x63, 0x43, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x61, 0x74, 0x69, 0x6f, 0x6e,
	0x12, 0x38, 0x0a, 0x09, 0x6f, 0x70, 0x65, 0x72, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x01, 0x20,
	0x01, 0x28, 0x0e, 0x32, 0x1a, 0x2e, 0x66, 0x68, 0x65, 0x76, 0x6d, 0x2e, 0x63, 0x6f, 0x6d, 0x6d,
	0x6f, 0x6e, 0x2e, 0x46, 0x68, 0x65, 0x4f, 0x70, 0x65, 0x72, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x52,
	0x09, 0x6f, 0x70, 0x65, 0x72, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x12, 0x31, 0x0a, 0x06, 0x69, 0x6e,
	0x70, 0x75, 0x74, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x19, 0x2e, 0x66, 0x68, 0x65,
	0x76, 0x6d, 0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x53, 0x79, 0x6e, 0x63,
	0x49, 0x6e, 0x70, 0x75, 0x74, 0x52, 0x06, 0x69, 0x6e, 0x70, 0x75, 0x74, 0x73, 0x12, 0x25, 0x0a,
	0x0e, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x5f, 0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x73, 0x18,
	0x03, 0x20, 0x03, 0x28, 0x0c, 0x52, 0x0d, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x48, 0x61, 0x6e,
	0x64, 0x6c, 0x65, 0x73, 0x22, 0x54, 0x0a, 0x14, 0x43, 0x6f, 0x6d, 0x70, 0x72, 0x65, 0x73, 0x73,
	0x65, 0x64, 0x43, 0x69, 0x70, 0x68, 0x65, 0x72, 0x74, 0x65, 0x78, 0x74, 0x12, 0x16, 0x0a, 0x06,
	0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0c, 0x52, 0x06, 0x68, 0x61,
	0x6e, 0x64, 0x6c, 0x65, 0x12, 0x24, 0x0a, 0x0d, 0x73, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x69, 0x7a,
	0x61, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0c, 0x52, 0x0d, 0x73, 0x65, 0x72,
	0x69, 0x61, 0x6c, 0x69, 0x7a, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x22, 0x48, 0x0a, 0x09, 0x53, 0x79,
	0x6e, 0x63, 0x49, 0x6e, 0x70, 0x75, 0x74, 0x12, 0x18, 0x0a, 0x06, 0x68, 0x61, 0x6e, 0x64, 0x6c,
	0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0c, 0x48, 0x00, 0x52, 0x06, 0x68, 0x61, 0x6e, 0x64, 0x6c,
	0x65, 0x12, 0x18, 0x0a, 0x06, 0x73, 0x63, 0x61, 0x6c, 0x61, 0x72, 0x18, 0x02, 0x20, 0x01, 0x28,
	0x0c, 0x48, 0x00, 0x52, 0x06, 0x73, 0x63, 0x61, 0x6c, 0x61, 0x72, 0x42, 0x07, 0x0a, 0x05, 0x69,
	0x6e, 0x70, 0x75, 0x74, 0x2a, 0xe2, 0x01, 0x0a, 0x10, 0x53, 0x79, 0x6e, 0x63, 0x43, 0x6f, 0x6d,
	0x70, 0x75, 0x74, 0x65, 0x45, 0x72, 0x72, 0x6f, 0x72, 0x12, 0x12, 0x0a, 0x0e, 0x42, 0x41, 0x44,
	0x5f, 0x49, 0x4e, 0x50, 0x55, 0x54, 0x5f, 0x4c, 0x49, 0x53, 0x54, 0x10, 0x00, 0x12, 0x18, 0x0a,
	0x14, 0x42, 0x41, 0x44, 0x5f, 0x49, 0x4e, 0x50, 0x55, 0x54, 0x5f, 0x43, 0x49, 0x50, 0x48, 0x45,
	0x52, 0x54, 0x45, 0x58, 0x54, 0x10, 0x01, 0x12, 0x15, 0x0a, 0x11, 0x49, 0x4e, 0x56, 0x41, 0x4c,
	0x49, 0x44, 0x5f, 0x4f, 0x50, 0x45, 0x52, 0x41, 0x54, 0x49, 0x4f, 0x4e, 0x10, 0x02, 0x12, 0x19,
	0x0a, 0x15, 0x55, 0x4e, 0x53, 0x55, 0x50, 0x50, 0x4f, 0x52, 0x54, 0x45, 0x44, 0x5f, 0x4f, 0x50,
	0x45, 0x52, 0x41, 0x54, 0x49, 0x4f, 0x4e, 0x10, 0x03, 0x12, 0x0e, 0x0a, 0x0a, 0x42, 0x41, 0x44,
	0x5f, 0x49, 0x4e, 0x50, 0x55, 0x54, 0x53, 0x10, 0x04, 0x12, 0x12, 0x0a, 0x0e, 0x55, 0x4e, 0x4b,
	0x4e, 0x4f, 0x57, 0x4e, 0x5f, 0x48, 0x41, 0x4e, 0x44, 0x4c, 0x45, 0x10, 0x05, 0x12, 0x16, 0x0a,
	0x12, 0x43, 0x4f, 0x4d, 0x50, 0x55, 0x54, 0x41, 0x54, 0x49, 0x4f, 0x4e, 0x5f, 0x46, 0x41, 0x49,
	0x4c, 0x45, 0x44, 0x10, 0x06, 0x12, 0x16, 0x0a, 0x12, 0x42, 0x41, 0x44, 0x5f, 0x52, 0x45, 0x53,
	0x55, 0x4c, 0x54, 0x5f, 0x48, 0x41, 0x4e, 0x44, 0x4c, 0x45, 0x53, 0x10, 0x07, 0x12, 0x1a, 0x0a,
	0x16, 0x55, 0x4e, 0x53, 0x41, 0x54, 0x49, 0x53, 0x46, 0x49, 0x45, 0x44, 0x5f, 0x44, 0x45, 0x50,
	0x45, 0x4e, 0x44, 0x45, 0x4e, 0x43, 0x45, 0x10, 0x08, 0x32, 0x67, 0x0a, 0x0d, 0x46, 0x68, 0x65,
	0x76, 0x6d, 0x45, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x12, 0x56, 0x0a, 0x0b, 0x53, 0x79,
	0x6e, 0x63, 0x43, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x65, 0x12, 0x22, 0x2e, 0x66, 0x68, 0x65, 0x76,
	0x6d, 0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x53, 0x79, 0x6e, 0x63, 0x43,
	0x6f, 0x6d, 0x70, 0x75, 0x74, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x23, 0x2e,
	0x66, 0x68, 0x65, 0x76, 0x6d, 0x2e, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x2e, 0x53,
	0x79, 0x6e, 0x63, 0x43, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e,
	0x73, 0x65, 0x42, 0x31, 0x0a, 0x15, 0x69, 0x6f, 0x2e, 0x67, 0x72, 0x70, 0x63, 0x2e, 0x66, 0x68,
	0x65, 0x76, 0x6d, 0x65, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x42, 0x0d, 0x46, 0x68, 0x65,
	0x76, 0x6d, 0x45, 0x78, 0x65, 0x63, 0x75, 0x74, 0x6f, 0x72, 0x50, 0x01, 0x5a, 0x07, 0x2e, 0x2f,
	0x66, 0x68, 0x65, 0x76, 0x6d, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_executor_proto_rawDescOnce sync.Once
	file_executor_proto_rawDescData = file_executor_proto_rawDesc
)

func file_executor_proto_rawDescGZIP() []byte {
	file_executor_proto_rawDescOnce.Do(func() {
		file_executor_proto_rawDescData = protoimpl.X.CompressGZIP(file_executor_proto_rawDescData)
	})
	return file_executor_proto_rawDescData
}

var file_executor_proto_enumTypes = make([]protoimpl.EnumInfo, 1)
var file_executor_proto_msgTypes = make([]protoimpl.MessageInfo, 6)
var file_executor_proto_goTypes = []any{
	(SyncComputeError)(0),        // 0: fhevm.executor.SyncComputeError
	(*SyncComputeRequest)(nil),   // 1: fhevm.executor.SyncComputeRequest
	(*SyncComputeResponse)(nil),  // 2: fhevm.executor.SyncComputeResponse
	(*ResultCiphertexts)(nil),    // 3: fhevm.executor.ResultCiphertexts
	(*SyncComputation)(nil),      // 4: fhevm.executor.SyncComputation
	(*CompressedCiphertext)(nil), // 5: fhevm.executor.CompressedCiphertext
	(*SyncInput)(nil),            // 6: fhevm.executor.SyncInput
	(FheOperation)(0),            // 7: fhevm.common.FheOperation
}
var file_executor_proto_depIdxs = []int32{
	4, // 0: fhevm.executor.SyncComputeRequest.computations:type_name -> fhevm.executor.SyncComputation
	5, // 1: fhevm.executor.SyncComputeRequest.compressed_ciphertexts:type_name -> fhevm.executor.CompressedCiphertext
	0, // 2: fhevm.executor.SyncComputeResponse.error:type_name -> fhevm.executor.SyncComputeError
	3, // 3: fhevm.executor.SyncComputeResponse.result_ciphertexts:type_name -> fhevm.executor.ResultCiphertexts
	5, // 4: fhevm.executor.ResultCiphertexts.ciphertexts:type_name -> fhevm.executor.CompressedCiphertext
	7, // 5: fhevm.executor.SyncComputation.operation:type_name -> fhevm.common.FheOperation
	6, // 6: fhevm.executor.SyncComputation.inputs:type_name -> fhevm.executor.SyncInput
	1, // 7: fhevm.executor.FhevmExecutor.SyncCompute:input_type -> fhevm.executor.SyncComputeRequest
	2, // 8: fhevm.executor.FhevmExecutor.SyncCompute:output_type -> fhevm.executor.SyncComputeResponse
	8, // [8:9] is the sub-list for method output_type
	7, // [7:8] is the sub-list for method input_type
	7, // [7:7] is the sub-list for extension type_name
	7, // [7:7] is the sub-list for extension extendee
	0, // [0:7] is the sub-list for field type_name
}

func init() { file_executor_proto_init() }
func file_executor_proto_init() {
	if File_executor_proto != nil {
		return
	}
	file_common_proto_init()
	if !protoimpl.UnsafeEnabled {
		file_executor_proto_msgTypes[0].Exporter = func(v any, i int) any {
			switch v := v.(*SyncComputeRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_executor_proto_msgTypes[1].Exporter = func(v any, i int) any {
			switch v := v.(*SyncComputeResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_executor_proto_msgTypes[2].Exporter = func(v any, i int) any {
			switch v := v.(*ResultCiphertexts); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_executor_proto_msgTypes[3].Exporter = func(v any, i int) any {
			switch v := v.(*SyncComputation); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_executor_proto_msgTypes[4].Exporter = func(v any, i int) any {
			switch v := v.(*CompressedCiphertext); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_executor_proto_msgTypes[5].Exporter = func(v any, i int) any {
			switch v := v.(*SyncInput); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	file_executor_proto_msgTypes[1].OneofWrappers = []any{
		(*SyncComputeResponse_Error)(nil),
		(*SyncComputeResponse_ResultCiphertexts)(nil),
	}
	file_executor_proto_msgTypes[5].OneofWrappers = []any{
		(*SyncInput_Handle)(nil),
		(*SyncInput_Scalar)(nil),
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_executor_proto_rawDesc,
			NumEnums:      1,
			NumMessages:   6,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_executor_proto_goTypes,
		DependencyIndexes: file_executor_proto_depIdxs,
		EnumInfos:         file_executor_proto_enumTypes,
		MessageInfos:      file_executor_proto_msgTypes,
	}.Build()
	File_executor_proto = out.File
	file_executor_proto_rawDesc = nil
	file_executor_proto_goTypes = nil
	file_executor_proto_depIdxs = nil
}