// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.5.1
// - protoc             v5.27.3
// source: executor.proto

package fhevm

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.64.0 or later.
const _ = grpc.SupportPackageIsVersion9

const (
	FhevmExecutor_SyncCompute_FullMethodName = "/fhevm.executor.FhevmExecutor/SyncCompute"
)

// FhevmExecutorClient is the client API for FhevmExecutor service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type FhevmExecutorClient interface {
	// Returns when computation of all operations has been completed.
	SyncCompute(ctx context.Context, in *SyncComputeRequest, opts ...grpc.CallOption) (*SyncComputeResponse, error)
}

type fhevmExecutorClient struct {
	cc grpc.ClientConnInterface
}

func NewFhevmExecutorClient(cc grpc.ClientConnInterface) FhevmExecutorClient {
	return &fhevmExecutorClient{cc}
}

func (c *fhevmExecutorClient) SyncCompute(ctx context.Context, in *SyncComputeRequest, opts ...grpc.CallOption) (*SyncComputeResponse, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(SyncComputeResponse)
	err := c.cc.Invoke(ctx, FhevmExecutor_SyncCompute_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// FhevmExecutorServer is the server API for FhevmExecutor service.
// All implementations must embed UnimplementedFhevmExecutorServer
// for forward compatibility.
type FhevmExecutorServer interface {
	// Returns when computation of all operations has been completed.
	SyncCompute(context.Context, *SyncComputeRequest) (*SyncComputeResponse, error)
	mustEmbedUnimplementedFhevmExecutorServer()
}

// UnimplementedFhevmExecutorServer must be embedded to have
// forward compatible implementations.
//
// NOTE: this should be embedded by value instead of pointer to avoid a nil
// pointer dereference when methods are called.
type UnimplementedFhevmExecutorServer struct{}

func (UnimplementedFhevmExecutorServer) SyncCompute(context.Context, *SyncComputeRequest) (*SyncComputeResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method SyncCompute not implemented")
}
func (UnimplementedFhevmExecutorServer) mustEmbedUnimplementedFhevmExecutorServer() {}
func (UnimplementedFhevmExecutorServer) testEmbeddedByValue()                       {}

// UnsafeFhevmExecutorServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to FhevmExecutorServer will
// result in compilation errors.
type UnsafeFhevmExecutorServer interface {
	mustEmbedUnimplementedFhevmExecutorServer()
}

func RegisterFhevmExecutorServer(s grpc.ServiceRegistrar, srv FhevmExecutorServer) {
	// If the following call pancis, it indicates UnimplementedFhevmExecutorServer was
	// embedded by pointer and is nil.  This will cause panics if an
	// unimplemented method is ever invoked, so we test this at initialization
	// time to prevent it from happening at runtime later due to I/O.
	if t, ok := srv.(interface{ testEmbeddedByValue() }); ok {
		t.testEmbeddedByValue()
	}
	s.RegisterService(&FhevmExecutor_ServiceDesc, srv)
}

func _FhevmExecutor_SyncCompute_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(SyncComputeRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(FhevmExecutorServer).SyncCompute(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: FhevmExecutor_SyncCompute_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(FhevmExecutorServer).SyncCompute(ctx, req.(*SyncComputeRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// FhevmExecutor_ServiceDesc is the grpc.ServiceDesc for FhevmExecutor service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var FhevmExecutor_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "fhevm.executor.FhevmExecutor",
	HandlerType: (*FhevmExecutorServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "SyncCompute",
			Handler:    _FhevmExecutor_SyncCompute_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "executor.proto",
}
