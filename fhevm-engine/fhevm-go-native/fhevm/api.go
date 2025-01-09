package fhevm

import (
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"math/big"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"

	_ "github.com/mattn/go-sqlite3"
	grpc "google.golang.org/grpc"
)

type FheUintType uint8

const (
	FheBool      FheUintType = 0
	FheUint4     FheUintType = 1
	FheUint8     FheUintType = 2
	FheUint16    FheUintType = 3
	FheUint32    FheUintType = 4
	FheUint64    FheUintType = 5
	FheUint128   FheUintType = 6
	FheUint160   FheUintType = 7
	FheUint256   FheUintType = 8
	FheEbytes64  FheUintType = 9
	FheEbytes128 FheUintType = 10
	FheEbytes256 FheUintType = 11
	FheUserBytes FheUintType = 255
)

type FheOp uint8

const (
	FheAdd    FheOp = 0
	FheSub    FheOp = 1
	FheMul    FheOp = 2
	FheDiv    FheOp = 3
	FheRem    FheOp = 4
	FheBitAnd FheOp = 5
	FheBitOr  FheOp = 6
	FheBitXor FheOp = 7
	FheShl    FheOp = 8
	FheShr    FheOp = 9
	FheRotl   FheOp = 10
	FheRotr   FheOp = 11
	FheEq     FheOp = 12
	FheNe     FheOp = 13
	FheGe     FheOp = 14
	FheGt     FheOp = 15
	FheLe     FheOp = 16
	FheLt     FheOp = 17
	FheMin    FheOp = 18
	FheMax    FheOp = 19
	FheNeg    FheOp = 20
	FheNot    FheOp = 21
	// unused
	// VerifyCiphertext FheOp = 22
	FheCast FheOp = 23
	// unused
	TrivialEncrypt FheOp = 24
	FheIfThenElse  FheOp = 25
	FheRand        FheOp = 26
	FheRandBounded FheOp = 27
)

func (t FheUintType) String() string {
	switch t {
	case FheBool:
		return "fheBool"
	case FheUint4:
		return "fheUint4"
	case FheUint8:
		return "fheUint8"
	case FheUint16:
		return "fheUint16"
	case FheUint32:
		return "fheUint32"
	case FheUint64:
		return "fheUint64"
	case FheUint128:
		return "fheUint128"
	case FheUint160:
		return "fheUint160"
	case FheUint256:
		return "fheUint256"
	case FheEbytes64:
		return "fheEbytes64"
	case FheEbytes128:
		return "fheEbytes128"
	case FheEbytes256:
		return "fheEbytes256"
	default:
		return "unknownFheUintType"
	}
}

func IsValidFheType(t byte) bool {
	if uint8(t) < uint8(FheBool) || uint8(t) > uint8(FheEbytes256) {
		return false
	}
	return true
}

// Number of most recent blocks to keep in cache
const GcBlocksNumberLimit = 100
const GcTimeLimit = 10.0

// Api to the storage of the host chain, must be passed
// from the EVM to us
type ChainStorageApi interface {
	GetState(common.Address, common.Hash) common.Hash
	SetState(common.Address, common.Hash, common.Hash)
}

type ExecutorApp interface {
	// Initialize the executor with the host logger
	// HostLogger is an implementation of FHELogger from the host chain,
	// used to delegate logging. If set to nil, logging will be disabled.
	InitLogger(hostLogger FHELogger, ctx string)
	// Create a session for a single transaction to capture all fhe
	// operations inside the state. We also schedule asynchronous
	// compute in background to have operations inside
	// the cache prepared to be inserted when commit block comes.
	// We pass current block number to know at which
	// block ciphertext should be materialized inside blockchain state.
	CreateSession(blockNumber int64) ExecutorSession
	// Preload ciphertexts into cache and perform initial computations,
	// should be called once after blockchain node initialization
	PreloadCiphertexts(blockNumber int64, hostStorage ChainStorageApi) error
}

type SegmentId int

type ExtraData struct {
	FheRandSeed [32]byte
}

// Implement String method for ExtraData
func (ed ExtraData) String() string {
	return fmt.Sprintf("ExtraData {FheRandSeed: %s}", common.BytesToHash(ed.FheRandSeed[:]).TerminalString())
}

type ExecutorSession interface {
	// Add a handle to the current session, ensuring its ciphertext will be persisted to the state
	// For EVM, this should be invoked for any value stored using SSTORE.
	AddStorageHandle(blockNumber uint64, contract common.Address, handle []byte) error

	// Add computation to current session
	// If the operation is not a supported FHE operation, it is discarded.
	AddComputation(input []byte, ed ExtraData, output []byte) error

	// Execute added FHE computations and commit result ciphertexts to state
	Commit(blockNumber int64, hostStorage ChainStorageApi) error

	ContractAddress() common.Address
	AclContractAddress() common.Address
	NextSegment() SegmentId
	InvalidateSinceSegment(id SegmentId) SegmentId
	// After commit fhe computations will be put inside the queue
	// to the blockchain state, also flushes pending computations
	// from storage to the state

	GetStore() ComputationStore
}

type ComputationStore interface {
	InsertComputation(computation ComputationToInsert) error
	InsertComputationBatch(ciphertexts []ComputationToInsert) error
}

type CacheBlockData struct {
	// store ciphertexts by handles
	materializedCiphertexts map[string][]byte
}

// Implement the fmt.Stringer interface
func (c CacheBlockData) String() string {
	if len(c.materializedCiphertexts) == 0 {
		return "MaterializedCiphertexts: none"
	}
	var sb strings.Builder
	sb.WriteString("MaterializedCiphertexts: ")
	for key, value := range c.materializedCiphertexts {
		sb.WriteString(fmt.Sprintf(" %s: %s, ", key, common.BytesToHash(value).TerminalString()))
	}

	return sb.String()
}

type BlockCiphertextQueue struct {
	queue []*ComputationToInsert
	// filter duplicates
	enqueuedCiphertext map[string]bool
}

type CiphertextCache struct {
	lock                 sync.RWMutex
	blocksCiphertexts    map[int64]*CacheBlockData
	ciphertextsToCompute map[int64]*BlockCiphertextQueue
	workAvailableChan    chan bool
	latestBlockFlushed   uint64
	lastCacheGc          time.Time
}

// Implement the application instantiated by Host chain to interact with the Executor
type AppImpl struct {
	address                common.Address
	aclContractAddress     common.Address
	executorUrl            string
	contractStorageAddress common.Address
	cache                  *CiphertextCache
	logger                 ProxyLogger

	// The offset from the current block number for committing the FHE computations.
	// If set to 0, the computations are committed in the current block.
	commitBlockOffset uint8
}

// Implement Session logic for the AppImpl
// A session handles all FHE operations for a single host transaction
type SessionImpl struct {
	sessionStore *SessionComputationStore
	app          *AppImpl
}

type ComputationOperand struct {
	IsScalar bool
	Handle   []byte
	// to be filled from evm storage or cache
	// when we process queue operations
	CompressedCiphertext []byte
	FheUintType          FheUintType
}

// Implement the fmt.Stringer interface
func (c ComputationOperand) String() string {
	return fmt.Sprintf(
		"ComputationOperand {IsScalar: %t, Handle: %s, CompressedCiphertext len: %d, FheUintType: %s}",
		c.IsScalar,
		common.BytesToHash(c.Handle).TerminalString(),
		len(c.CompressedCiphertext),
		c.FheUintType,
	)
}

type ComputationToInsert struct {
	segmentId     SegmentId
	Operation     FheOp
	OutputHandle  []byte
	Operands      []ComputationOperand
	CommitBlockId int64
}

// Return Handle as TerminalString
func (c ComputationToInsert) Handle() string {
	return common.BytesToHash(c.OutputHandle).TerminalString()
}

// Implement the fmt.Stringer interface
func (c ComputationToInsert) String() string {
	return fmt.Sprintf(
		"ComputationToInsert { SegmentId: %d, Operation: %s, OutputHandle: %s, Operands: %v, CommitBlockId: %d}",
		c.segmentId,
		c.Operation,
		c.Handle(),
		c.Operands,
		c.CommitBlockId,
	)
}

type SessionComputationStore struct {
	insertedHandles        map[string]int
	storageHandles         *OrderedHashSet[common.Hash]
	invalidatedSegments    map[SegmentId]bool
	inserts                []ComputationToInsert
	segmentCount           int
	blockNumber            int64
	cache                  *CiphertextCache
	contractStorageAddress common.Address
	logger                 ProxyLogger
	commitBlockOffset      uint8
}

type EvmStorageComputationStore struct {
	currentBlockNumber     int64
	contractStorageAddress common.Address
	cache                  *CiphertextCache
	logger                 ProxyLogger
	commitBlockOffset      uint8
}

func (app *AppImpl) InitLogger(hostLogger FHELogger, ctx string) {
	app.logger = log(hostLogger, ctx)
}

func (app *AppImpl) CreateSession(blockNumber int64) ExecutorSession {
	return &SessionImpl{
		app: app,
		sessionStore: &SessionComputationStore{
			inserts:                make([]ComputationToInsert, 0),
			insertedHandles:        make(map[string]int),
			invalidatedSegments:    make(map[SegmentId]bool),
			segmentCount:           0,
			blockNumber:            blockNumber,
			cache:                  app.cache,
			contractStorageAddress: app.contractStorageAddress,
			logger:                 app.logger,
			commitBlockOffset:      app.commitBlockOffset,
			storageHandles:         NewOrderedHashSet[common.Hash](),
		},
	}
}

func (app *AppImpl) PreloadCiphertexts(blockNumber int64, hostStorage ChainStorageApi) error {
	log := log(&app.logger, "preload")

	computations := app.loadComputationsFromStateToCache(blockNumber, hostStorage)
	log.Info("Preload ciphertexts", "block", blockNumber, "length", computations)
	if computations > 0 {
		return executorProcessPendingComputations(app)
	}

	return nil
}

func (app *AppImpl) loadComputationsFromStateToCache(startBlockNumber int64, hostStorage ChainStorageApi) int {
	loadStartTime := time.Now()
	computations := 0
	defer func() {
		log := log(&app.logger, "preload")
		duration := time.Since(loadStartTime)
		log.Info("Preload done", "computations", computations, "duration", duration)
	}()

	// TODO: figure out the limit how long in future blocks we should preload
	lastBlockToPreload := startBlockNumber + 30

	app.cache.lock.Lock()
	defer app.cache.lock.Unlock()

	for block := startBlockNumber; block < lastBlockToPreload; block++ {
		countAddress := blockNumberToQueueItemCountAddress(block)
		ciphertextsInBlock := hostStorage.GetState(app.contractStorageAddress, countAddress).Big()
		inBlock := ciphertextsInBlock.Int64()
		queue := make([]*ComputationToInsert, 0)
		enqueuedCiphertext := make(map[string]bool)

		if inBlock == 0 {
			continue
		}

		computations += int(inBlock)

		for ctNum := 0; ctNum < int(inBlock); ctNum++ {
			layout := blockQueueStorageLayout(block, int64(ctNum))
			metadata := bytesToMetadata(hostStorage.GetState(app.contractStorageAddress, layout.metadata))
			outputHandle := hostStorage.GetState(app.contractStorageAddress, layout.outputHandle)
			computation := &ComputationToInsert{
				segmentId:     0,
				Operation:     metadata.Operation,
				OutputHandle:  outputHandle[:],
				CommitBlockId: block,
			}

			if isBinaryOp(metadata.Operation) {
				firstOpHandle := hostStorage.GetState(app.contractStorageAddress, layout.firstOperand)
				firstOpCt := ReadBytesToAddress(hostStorage, app.contractStorageAddress, firstOpHandle)

				computation.Operands = append(computation.Operands, ComputationOperand{
					IsScalar:             false,
					Handle:               firstOpHandle[:],
					CompressedCiphertext: firstOpCt,
					FheUintType:          handleType(firstOpHandle[:]),
				})

				if metadata.IsBigScalar {
					// TODO: implement big scalar
				} else if metadata.IsScalar {
					secondOpHandle := hostStorage.GetState(app.contractStorageAddress, layout.secondOperand)
					computation.Operands = append(computation.Operands, ComputationOperand{
						IsScalar:    true,
						Handle:      secondOpHandle[:],
						FheUintType: handleType(firstOpHandle[:]),
					})
				} else {
					secondOpHandle := hostStorage.GetState(app.contractStorageAddress, layout.secondOperand)
					secondOpCt := ReadBytesToAddress(hostStorage, app.contractStorageAddress, secondOpHandle)

					computation.Operands = append(computation.Operands, ComputationOperand{
						IsScalar:             false,
						Handle:               secondOpHandle[:],
						CompressedCiphertext: secondOpCt,
						FheUintType:          handleType(secondOpHandle[:]),
					})
				}
			} else if isUnaryOp(metadata.Operation) {
				firstOpAddress := hostStorage.GetState(app.contractStorageAddress, layout.firstOperand)
				firstOpCt := ReadBytesToAddress(hostStorage, app.contractStorageAddress, firstOpAddress)

				computation.Operands = append(computation.Operands, ComputationOperand{
					IsScalar:             false,
					Handle:               firstOpAddress[:],
					CompressedCiphertext: firstOpCt,
					FheUintType:          handleType(firstOpAddress[:]),
				})
			} else {
				// TODO: handle all special functions to load their ciphertext arguments
			}

			if !enqueuedCiphertext[string(computation.OutputHandle)] {
				queue = append(queue, computation)
				enqueuedCiphertext[string(computation.OutputHandle)] = true
			}
		}

		ctsToCompute := &BlockCiphertextQueue{
			queue:              queue,
			enqueuedCiphertext: enqueuedCiphertext,
		}
		app.cache.ciphertextsToCompute[block] = ctsToCompute
	}

	return computations
}

// Signal the executor that there is work available
func (app *AppImpl) notifyWorkAvailable() {
	select {
	case app.cache.workAvailableChan <- true:
	default:
	}
}

func (sess *SessionImpl) Commit(blockNumber int64, hostStorage ChainStorageApi) error {
	log := log(&sess.app.logger, "commit")

	log.Debug("Commit to session store", "block", blockNumber)
	err := sess.sessionStore.Commit(hostStorage)
	if err != nil {
		log.Error("Commit failed", "block", blockNumber, "error", err)
		return err
	}

	app := sess.app

	// Compute pending computations
	if app.commitBlockOffset == 0 {
		// Late commit is disabled, send compute gRPC request and waits for it to finish
		err := executorProcessPendingComputations(app)
		if err != nil {
			log.Error("Executor failed", "block", blockNumber, "error", err)
			return err
		}
	} else {
		// Signal the executor thread that work is ready.
		app.notifyWorkAvailable()

		// Zero out Late commit
		app.zeroLateCommit(blockNumber, hostStorage)
	}

	// Persist storage handles
	err = app.persistStorageHandles(blockNumber, sess.sessionStore.storageHandles, hostStorage)
	if err != nil {
		return err
	}

	app.runCiphertextCacheGc(uint64(blockNumber), GcBlocksNumberLimit, GcTimeLimit)

	return nil
}

func (sess *SessionImpl) AddStorageHandle(blockNumber uint64, contract common.Address, handle []byte) error {
	return sess.sessionStore.AddStorageHandle(blockNumber, handle)
}

func (sess *SessionImpl) AddComputation(dataOrig []byte, ed ExtraData, outputOrig []byte) error {
	log := log(&sess.app.logger, "session::execute")

	if len(dataOrig) < 4 {
		err := fmt.Errorf("input data must be at least 4 bytes for signature, got %d", len(dataOrig))
		log.Error("Execute failed", "error", err)
		return err
	}

	// make copies so we could assume array is immutable later
	data := make([]byte, len(dataOrig))
	output := make([]byte, len(outputOrig))
	copy(data, dataOrig)
	copy(output, outputOrig)

	signature := binary.BigEndian.Uint32(data[0:4])
	callData := data[4:]

	method, exists := signatureToFheLibMethod[signature]
	if exists {
		if len(output) >= 32 {
			// where to get output handle from?
			outputHandle := output[0:32]
			handle := common.BytesToHash(outputHandle).TerminalString()

			log.Debug("Call", "method", *method, "calldata len", len(callData),
				"extra data", ed, "handle", handle)

			err := method.runFunction(sess, callData, ed, outputHandle)
			if err != nil {
				log.Error("Computation not inserted", method, "handle", handle, "error", err)
			}

			return err
		} else {
			err := errors.New("no output data provided")
			log.Error("Execute failed", "error", err)
			return err
		}
	} else {
		err := fmt.Errorf("signature %d not recognized", signature)
		log.Error("Execute failed", "error", err)
		return err
	}
}

func (sess *SessionImpl) NextSegment() SegmentId {
	sess.sessionStore.segmentCount = sess.sessionStore.segmentCount + 1
	return SegmentId(sess.sessionStore.segmentCount)
}

func (sess *SessionImpl) InvalidateSinceSegment(id SegmentId) SegmentId {
	for idx := int(id); idx <= sess.sessionStore.segmentCount; idx++ {
		sess.sessionStore.invalidatedSegments[SegmentId(idx)] = true
	}

	return sess.NextSegment()
}

func (sess *SessionImpl) ContractAddress() common.Address {
	return sess.app.address
}

func (sess *SessionImpl) AclContractAddress() common.Address {
	return sess.app.aclContractAddress
}

func (sess *SessionImpl) GetStore() ComputationStore {
	return sess.sessionStore
}

func (dbApi *SessionComputationStore) InsertComputationBatch(computations []ComputationToInsert) error {
	for _, comp := range computations {
		dbApi.InsertComputation(comp)
	}

	return nil
}

func (dbApi *SessionComputationStore) InsertComputation(computation ComputationToInsert) error {
	log := log(&dbApi.logger, "session::execute")

	_, found := dbApi.insertedHandles[string(computation.OutputHandle)]
	if !found {
		// preserve insertion order
		dbApi.insertedHandles[string(computation.OutputHandle)] = len(dbApi.inserts)
		computation.segmentId = SegmentId(dbApi.segmentCount)
		// hardcode late commit for now to be 5 blocks from current block
		// in future we can implement dynamic compute, if user pays more
		// he can have faster commit
		computation.CommitBlockId = dbApi.blockNumber + int64(dbApi.commitBlockOffset)
		dbApi.inserts = append(dbApi.inserts, computation)
		log.Info("Insert computation",
			"inserts count", len(dbApi.inserts), "computation", computation)
	}

	return nil
}

func (dbApi *SessionComputationStore) AddStorageHandle(blockNumber uint64, handle []byte) error {
	log := log(&dbApi.logger, "session::execute")

	handleHash := common.BytesToHash(handle)
	if dbApi.storageHandles.Add(handleHash) {
		log.Info("Add storage handle", "block number", blockNumber, "handle", handleHash.TerminalString())
	}

	return nil
}

func (dbApi *SessionComputationStore) Commit(storage ChainStorageApi) error {
	finalInserts := make([]ComputationToInsert, 0, len(dbApi.inserts))
	for _, ct := range dbApi.inserts {
		if !dbApi.invalidatedSegments[ct.segmentId] {
			finalInserts = append(finalInserts, ct)
		}
	}

	dbApi.inserts = dbApi.inserts[:0]
	dbApi.insertedHandles = make(map[string]int)
	dbApi.invalidatedSegments = make(map[SegmentId]bool)
	dbApi.segmentCount = 0

	evmInserter := EvmStorageComputationStore{
		currentBlockNumber:     dbApi.blockNumber,
		contractStorageAddress: dbApi.contractStorageAddress,
		cache:                  dbApi.cache,
		logger:                 dbApi.logger,
		commitBlockOffset:      dbApi.commitBlockOffset,
	}

	err := evmInserter.InsertComputationBatch(storage, finalInserts)
	if err != nil {
		return err
	}

	return nil
}

func blockNumberToQueueItemCountAddress(blockNumber int64) common.Hash {
	return common.BigToHash(big.NewInt(blockNumber))
}

func blockQueueStorageLayout(blockNumber int64, ctNumber int64) NativeQueueAddressLayout {
	toHash := common.BigToHash(big.NewInt(blockNumber))
	// main storage prefix
	// number is on the right bitwise, should never overwrite storage prefix
	// because block numbers are much less than 256 bit numbers
	copy(toHash[:], "main")
	initialOffsetHash := crypto.Keccak256(toHash[:])
	copy(toHash[:], "bigscalar")
	bigScalarOffsetHash := crypto.Keccak256(toHash[:])
	bigScalarNum := new(big.Int)
	bigScalarNum.SetBytes(bigScalarOffsetHash)
	// 2048 bit is maximum supported number
	// one 2048 bit contains 8 256 bit words
	bigScalarNum.Add(bigScalarNum, big.NewInt(ctNumber*8))

	one := big.NewInt(1)
	res := new(big.Int)
	res.SetBytes(initialOffsetHash)
	// four 256 bit words, calculate offset
	// according to ciphertext number
	res.Add(res, big.NewInt(ctNumber*4))
	metadata := common.BytesToHash(res.Bytes())
	res.Add(res, one)
	outputHandle := common.BytesToHash(res.Bytes())
	res.Add(res, one)
	firstOperand := common.BytesToHash(res.Bytes())
	res.Add(res, one)
	secondOperand := common.BytesToHash(res.Bytes())
	res.Add(res, one)
	return NativeQueueAddressLayout{
		metadata:         metadata,
		outputHandle:     outputHandle,
		firstOperand:     firstOperand,
		secondOperand:    secondOperand,
		bigScalarOperand: common.Hash(bigScalarOffsetHash),
	}
}

func computationMetadata(comp ComputationToInsert) common.Hash {
	var res common.Hash

	// operation type
	res[0] = byte(comp.Operation)
	for _, op := range comp.Operands {
		if op.IsScalar {
			// set scalar byte
			res[1] = 1
			if op.FheUintType > FheUint256 {
				// set big scalar byte, we'll need big scalar register
				// for this computation
				res[2] = 1
			}
		}
	}

	return res
}

func bytesToMetadata(input common.Hash) ComputationMetadata {
	return ComputationMetadata{
		Operation:   FheOp(input[0]),
		IsScalar:    input[1] > 0,
		IsBigScalar: input[2] > 0,
	}
}

type ComputationMetadata struct {
	Operation   FheOp
	IsScalar    bool
	IsBigScalar bool
}

type NativeQueueAddressLayout struct {
	// metadata about the computation
	// like operation type, is scalar etc
	metadata common.Hash
	// output handle of the computation
	outputHandle common.Hash
	// first operand to the computation
	firstOperand common.Hash
	// second operand to the computation
	secondOperand common.Hash
	// if operand size is more than 256 bits
	// it is stored in special place here
	bigScalarOperand common.Hash
}

func (dbApi *EvmStorageComputationStore) InsertComputationBatch(evmStorage ChainStorageApi, computations []ComputationToInsert) error {
	log := log(&dbApi.logger, "evm_store")
	log.Info("Processing computations", "count", len(computations))

	pending_computations := 0
	buckets := make(map[int64][]*ComputationToInsert)
	// index the buckets
	for ind, comp := range computations {
		if buckets[comp.CommitBlockId] == nil {
			buckets[comp.CommitBlockId] = make([]*ComputationToInsert, 0)
		}

		buckets[comp.CommitBlockId] = append(buckets[comp.CommitBlockId], &computations[ind])
		pending_computations += 1
	}

	if len(buckets) != 0 {
		log.Debug("New buckets added", "buckets", len(buckets),
			"pending_computations", pending_computations)
	}

	// collect all their keys and sort because golang doesn't traverse map
	// in deterministic order
	allKeys := make([]int, 0)
	for k := range buckets {
		allKeys = append(allKeys, int(k))
	}
	sort.Ints(allKeys)

	// Insert new computations to the LateCommit queue, if LateCommit is enabled
	if dbApi.commitBlockOffset > 0 {
		dbApi.updateLateCommitQueue(allKeys, buckets, evmStorage)
	}

	// enqueue items to cache, we do this in the
	// end because it requires locking, so lock for minimal time
	dbApi.cache.lock.Lock()
	defer func() {
		dbApi.cache.lock.Unlock()
	}()

	for _, key := range allKeys {
		blockNumber := int64(key)
		bucket := buckets[blockNumber]
		ctsStorage := dbApi.cache.ciphertextsToCompute[blockNumber]

		if ctsStorage == nil {
			ctsStorage = &BlockCiphertextQueue{
				queue:              make([]*ComputationToInsert, 0),
				enqueuedCiphertext: make(map[string]bool),
			}
			dbApi.cache.ciphertextsToCompute[blockNumber] = ctsStorage
		}

		for _, comp := range bucket {

			// don't have duplicates, from possibly evaluating multiple trie caches
			if !ctsStorage.enqueuedCiphertext[string(comp.OutputHandle)] {
				// we must fill the raw ciphertext values here from storage so cache
				// would have ciphertexts to compute on, as cache doesn't have easy
				// access to the evm state
				dbApi.hydrateComputationFromEvmState(evmStorage, comp)
				ctsStorage.queue = append(ctsStorage.queue, comp)
				ctsStorage.enqueuedCiphertext[string(comp.OutputHandle)] = true

				log.Debug("Add computation to Cache",
					"commit block", blockNumber,
					"handle", comp.Handle(),
					"cache length", len(ctsStorage.queue))
			}
		}
	}

	return nil
}

// / Insert new computations to the LateCommit queue
// / LateCommit queue is a queue of pending computations
func (dbApi *EvmStorageComputationStore) updateLateCommitQueue(allKeys []int, buckets map[int64][]*ComputationToInsert, evmStorage ChainStorageApi) {
	// storage layout for the late commit queue:
	//
	// blockNumber address - stores the amount of ciphertexts in the queue in the block,
	// block number is directly converted to storage address which has count for the queue
	// blockNumber represents when ciphertexts are to be commited to the storage
	// and queue should be cleaned up after the block passes
	//
	// queue address - hash 'main' prefix and block number converted to 32 big endian bytes
	// this address contains all the handles to be computed in this block
	// example:
	// keccak256('main' .. blockNumber) + 0 - operation metadata, is extended scalar operand needed
	// keccak256('main' .. blockNumber) + 1 - output ciphertext handle
	// keccak256('main' .. blockNumber) + 2 - first ciphertext argument
	// keccak256('main' .. blockNumber) + 3 - second ciphertext argument
	//
	// if scalar operand is bigger than 256 bit number, we use special
	// bigscalar address

	// prepare for dynamic evaluation. Say, users want to evaluate ciphertext
	// in 5 or 10 blocks from current block, depending on how much they pay.
	// We create buckets, how many blocks in the future user wants
	// his ciphertexts to be evaluated

	log := log(&dbApi.logger, "evm_store")

	one := big.NewInt(1)
	for _, key := range allKeys {
		queueBlockNumber := int64(key)
		bucket := buckets[queueBlockNumber]

		countAddress := blockNumberToQueueItemCountAddress(queueBlockNumber)
		ciphertextsInBlock := evmStorage.GetState(dbApi.contractStorageAddress, countAddress).Big()

		for idx, comp := range bucket {
			layout := blockQueueStorageLayout(queueBlockNumber, int64(idx))
			ciphertextsInBlock = ciphertextsInBlock.Add(ciphertextsInBlock, one)

			log.Info("Persist computation to LateCommit queue",
				"handle", comp.Handle(),
				"commit block", queueBlockNumber,
				"count addr", countAddress.TerminalString(),
				"ciphertextsInBlock", ciphertextsInBlock.Int64())

			metadata := computationMetadata(*comp)
			evmStorage.SetState(dbApi.contractStorageAddress, layout.metadata, metadata)
			evmStorage.SetState(dbApi.contractStorageAddress, layout.outputHandle, common.BytesToHash(comp.OutputHandle))
			if len(comp.Operands) > 0 {
				evmStorage.SetState(dbApi.contractStorageAddress, layout.firstOperand, common.BytesToHash(comp.Operands[0].Handle))
			}
			if len(comp.Operands) > 1 {
				evmStorage.SetState(dbApi.contractStorageAddress, layout.secondOperand, common.BytesToHash(comp.Operands[1].Handle))
			}
		}

		// set updated count back
		evmStorage.SetState(dbApi.contractStorageAddress, countAddress, common.BigToHash(ciphertextsInBlock))
	}
}

func (dbApi *EvmStorageComputationStore) hydrateComputationFromEvmState(evmStorage ChainStorageApi, comp *ComputationToInsert) error {
	log := log(&dbApi.logger, "evm_store")

	// hydrate operands from storage
	for idx := range comp.Operands {
		if !comp.Operands[idx].IsScalar {
			if len(comp.Operands[idx].Handle) != 32 {
				panic("non scalar handle should always be 32 bytes")
			}
			hash := common.BytesToHash(comp.Operands[idx].Handle)
			resultCt := ReadBytesToAddress(evmStorage, dbApi.contractStorageAddress, hash)
			comp.Operands[idx].CompressedCiphertext = resultCt

			log.Info("Hydrate computation", "handle", comp.Handle(),
				"operand_handle", hash.TerminalString(), "ciphertext len", len(resultCt))
		}
	}

	return nil
}

// write arbitrary byte[] array to evm storage
func putBytesToAddress(api ChainStorageApi, contractAddress common.Address, address common.Hash, bytes []byte) {
	ctLength := big.NewInt(int64(len(bytes)))

	startAddress := new(big.Int)
	startAddress.SetBytes(address[:])
	wordAddress := func(word int64) common.Hash {
		res := big.NewInt(word)
		res.Add(res, startAddress)
		return common.BigToHash(res)
	}

	// write array length first
	api.SetState(contractAddress, address, common.BigToHash(ctLength))

	// write the ciphertext by uint256 chunks
	wholeBlocks := len(bytes) / 32
	tailBlockSize := len(bytes) % 32

	// first block starts at handle + 1
	wordOffset := int64(1)
	for i := 0; i < wholeBlocks; i++ {
		ctSlice := common.BytesToHash(bytes[i*32 : i*32+32])
		api.SetState(contractAddress, wordAddress(wordOffset), ctSlice)
		wordOffset += 1
	}

	// write the last partial block if it exists
	if tailBlockSize > 0 {
		ctSlice := common.BytesToHash(bytes[wholeBlocks*32 : wholeBlocks*32+tailBlockSize])
		api.SetState(contractAddress, wordAddress(wordOffset), ctSlice)
	}
}

// read arbitrary byte[] array from evm storage, exposed to geth
func ReadBytesToAddress(api ChainStorageApi, contractAddress common.Address, address common.Hash) []byte {
	ctLengthHash := api.GetState(contractAddress, address)
	ctLen := new(big.Int)
	ctLen.SetBytes(ctLengthHash[:])
	ctLength := ctLen.Uint64()

	resultBytes := make([]byte, 0, ctLength)
	fullWords := ctLength / 32
	finalWordSize := ctLength % 32

	startAddress := new(big.Int)
	startAddress.SetBytes(address[:])
	wordAddress := func(word int64) common.Hash {
		res := big.NewInt(word)
		res.Add(res, startAddress)
		return common.BigToHash(res)
	}

	for i := 1; i <= int(fullWords); i++ {
		word := api.GetState(contractAddress, wordAddress(int64(i)))
		resultBytes = append(resultBytes, word[:]...)
	}
	if finalWordSize > 0 {
		word := api.GetState(contractAddress, wordAddress(int64(fullWords+1)))
		finalSlice := word[len(word)-int(finalWordSize):]
		resultBytes = append(resultBytes, finalSlice...)
	}

	return resultBytes
}

// / Zero out all the computations in the LateCommit queue
func (app *AppImpl) zeroLateCommit(blockNumber int64, hostStorage ChainStorageApi) {
	log := log(&app.logger, "flush")
	contractStorageAddr := app.contractStorageAddress

	countAddress := blockNumberToQueueItemCountAddress(blockNumber)
	ciphertextsInBlock := hostStorage.GetState(contractStorageAddr, countAddress).Big()
	ctCount := ciphertextsInBlock.Int64()

	zero := common.BigToHash(big.NewInt(0))
	one := big.NewInt(1)

	// zero out queue ciphertexts
	for i := 0; i < int(ctCount); i++ {
		ctAddr := blockQueueStorageLayout(blockNumber, int64(i))
		metadata := bytesToMetadata(hostStorage.GetState(contractStorageAddr, ctAddr.metadata))
		outputHandle := hostStorage.GetState(contractStorageAddr, ctAddr.outputHandle)

		log.Debug("Reset computation LateCommit queue", "block number", blockNumber,
			"handle", outputHandle.TerminalString())

		hostStorage.SetState(contractStorageAddr, ctAddr.metadata, zero)
		hostStorage.SetState(contractStorageAddr, ctAddr.outputHandle, zero)
		hostStorage.SetState(contractStorageAddr, ctAddr.firstOperand, zero)
		hostStorage.SetState(contractStorageAddr, ctAddr.secondOperand, zero)
		if metadata.IsBigScalar {
			counter := new(big.Int)
			counter.SetBytes(ctAddr.bigScalarOperand[:])
			// max supported number 2048 is 2048
			for i := 0; i < 2048/256; i++ {
				hostStorage.SetState(contractStorageAddr, common.BigToHash(counter), zero)
				counter.Add(counter, one)
			}
		}
	}

	// set 0 as count
	if ctCount > 0 {
		hostStorage.SetState(contractStorageAddr, countAddress, zero)
		log.Debug("Reset count addr",
			"block number", blockNumber,
			"count addr", countAddress.TerminalString(), "count", ctCount)
	}
}

// Persist the computed ciphertexts to the EVM storage
func (app *AppImpl) persistStorageHandles(blockNumber int64, storageHandles *OrderedHashSet[common.Hash], hostStorage ChainStorageApi) error {
	if storageHandles.Size() == 0 {
		return nil
	}

	app.cache.lock.Lock()
	defer func() {
		app.cache.lock.Unlock()
	}()

	log := log(&app.logger, "storage")

	blockData, ok := app.cache.blocksCiphertexts[blockNumber]
	if !ok {
		return nil
	}

	for _, handle := range storageHandles.ToSlice() {
		ciphertext, ok := blockData.materializedCiphertexts[string(handle[:])]
		if !ok {
			err := errors.New("ciphertext not found in cache")
			log.Error("Persist ciphertext", "err", err)
			return err
		}

		log.Info("Persist ciphertext", "block number", blockNumber, "handle",
			handle.TerminalString(), "ciphertext length", len(ciphertext))

		putBytesToAddress(hostStorage, app.contractStorageAddress, handle, ciphertext)
	}

	return nil
}

// Run garbage collection on the ciphertext cache
// Keep latest N Blocks with ciphertexts to ensure reorgs are handled
func (app *AppImpl) runCiphertextCacheGc(blockNumber uint64, blocksNumLimit uint64, timeLimit float64) {
	log := log(&app.logger, "ct_cache_gc")
	cache := app.cache

	cache.lock.Lock()
	defer func() {
		cache.lock.Unlock()
	}()

	blockData, ok := cache.blocksCiphertexts[int64(blockNumber)]
	if ok && len(blockData.materializedCiphertexts) > 0 {
		cache.latestBlockFlushed = blockNumber
		log.Debug("Latest block flushed", "block number", blockNumber)
	}

	if cache.latestBlockFlushed == 0 || cache.latestBlockFlushed < blocksNumLimit {
		// no flushes processed yet
		return
	}

	// don't run gc more often than timeLimit seconds
	sinceLastGcSeconds := time.Since(cache.lastCacheGc).Seconds()
	if sinceLastGcSeconds < timeLimit {
		return
	}

	keysToPurge := make([]int64, 0)
	dontKeepBlockOlderThan := cache.latestBlockFlushed - blocksNumLimit

	for blockNumber := range cache.blocksCiphertexts {
		if blockNumber < int64(dontKeepBlockOlderThan) {
			keysToPurge = append(keysToPurge, blockNumber)
		}
	}

	for _, toPurge := range keysToPurge {
		delete(cache.blocksCiphertexts, toPurge)
	}

	if len(keysToPurge) > 0 {
		log.Info("Remove cts from cache", "count", len(keysToPurge))
	}

	cache.lastCacheGc = time.Now()
}

func InitExecutor(hostLogger FHELogger) (ExecutorApp, error) {
	log := log(hostLogger, "module::fhevm")

	executorUrl, hasUrl := os.LookupEnv("FHEVM_EXECUTOR_URL")
	if !hasUrl {
		return nil, errors.New("FHEVM_EXECUTOR_URL is not configured")
	}

	contractAddr, hasAddr := os.LookupEnv("FHEVM_CONTRACT_ADDRESS")
	if !hasAddr {
		return nil, errors.New("FHEVM_EXECUTOR_URL is set but FHEVM_CONTRACT_ADDRESS is not set")
	}

	fhevmContractAddress := common.HexToAddress(contractAddr)
	aclContractAddressHex := os.Getenv("ACL_CONTRACT_ADDRESS")
	if !common.IsHexAddress(aclContractAddressHex) {
		return nil, fmt.Errorf("bad or missing ACL_CONTRACT_ADDRESS: %s", aclContractAddressHex)
	}
	aclContractAddress := common.HexToAddress(aclContractAddressHex)

	// pick hardcoded value in the beginning, we can change later
	storageAddress := common.HexToAddress("0x0000000000000000000000000000000000000070")

	commitBlockOffset := uint8(0)
	offset, hasOffset := os.LookupEnv("FHEVM_COMMIT_BLOCK_OFFSET")
	if hasOffset {
		parsedOffset, err := strconv.ParseUint(offset, 10, 8)
		if err != nil {
			log.Crit("Invalid FHEVM_COMMIT_BLOCK_OFFSET", "error", err.Error())
		}
		commitBlockOffset = uint8(parsedOffset)
	}

	log.Info("FHEVM initialized",
		"Executor addr", executorUrl,
		"FHEVM contract", contractAddr,
		"ACL contract", aclContractAddressHex,
		"Storage contract", storageAddress.Hex())

	workAvailableChan := make(chan bool, 10)

	cache := &CiphertextCache{
		lock:                 sync.RWMutex{},
		blocksCiphertexts:    make(map[int64]*CacheBlockData),
		ciphertextsToCompute: make(map[int64]*BlockCiphertextQueue),
		workAvailableChan:    workAvailableChan,
		lastCacheGc:          time.Now(),
	}

	app := &AppImpl{
		address:                fhevmContractAddress,
		aclContractAddress:     aclContractAddress,
		contractStorageAddress: storageAddress,
		executorUrl:            executorUrl,
		cache:                  cache,
		commitBlockOffset:      commitBlockOffset,
	}

	// run executor worker in the background
	if commitBlockOffset > 0 {
		go executorWorkerThread(app)
	}

	return app, nil
}

func executorWorkerThread(app *AppImpl) {
	log := log(&app.logger, "worker")

	for {
		// try reading notification from channel
		<-app.cache.workAvailableChan

		// sleep for 500ms to wait for more messages
		// to consolidate them at one processing batch
		time.Sleep(time.Millisecond * 500)

		err := executorProcessPendingComputations(app)
		if err != nil {
			log.Error("Failed to compute", "error", err.Error())
		}
	}
}

func executorProcessPendingComputations(app *AppImpl) error {
	log := log(&app.logger, "sync_compute")

	app.cache.lock.Lock()
	defer func() {
		app.cache.lock.Unlock()
	}()

	availableCts := len(app.cache.ciphertextsToCompute)

	// empty channel from multiple notifications before processing
	for len(app.cache.workAvailableChan) > 0 {
		<-app.cache.workAvailableChan
	}

	// no work to be done
	if availableCts == 0 {
		return nil
	}

	var opts []grpc.DialOption
	opts = append(opts, grpc.WithInsecure())
	conn, err := grpc.NewClient(app.executorUrl, opts...)
	if err != nil {
		return err
	}
	defer conn.Close()

	request := SyncComputeRequest{
		Computations:           make([]*SyncComputation, 0),
		CompactCiphertextLists: make([][]byte, 0),
		CompressedCiphertexts:  make([]*CompressedCiphertext, 0),
	}

	ctToBlockIndex := make(map[string]int64)
	for block, compute := range app.cache.ciphertextsToCompute {
		log.Debug("Processing block",
			"commit block", block, "computations", len(compute.queue))

		for _, ct := range compute.queue {
			syncInputs := make([]*SyncInput, 0, len(ct.Operands))
			resultHandles := make([][]byte, 0, 1)
			resultHandles = append(resultHandles, ct.OutputHandle)

			for _, operand := range ct.Operands {
				if operand.IsScalar {
					syncInputs = append(syncInputs, &SyncInput{
						Input: &SyncInput_Scalar{
							Scalar: operand.Handle,
						},
					})
				} else {
					syncInputs = append(syncInputs, &SyncInput{
						Input: &SyncInput_Handle{
							Handle: operand.Handle,
						},
					})

					// if we have the compressed ciphertext, we need to send it to the executor
					// Otherwise,  we expect that the handle is already in the current compute queue
					if len(operand.CompressedCiphertext) > 0 {
						request.CompressedCiphertexts = append(request.CompressedCiphertexts, &CompressedCiphertext{
							Handle:        operand.Handle,
							Serialization: operand.CompressedCiphertext,
						})
					} else {
						// Ensure that operand.Handle is amongst the previous handles in compute.queue
						_, exists := ctToBlockIndex[string(operand.Handle)]
						if !exists {
							handle := common.BytesToHash(operand.Handle).TerminalString()
							log.Warn("Non-scalar operand handle not found in previous computations", "handle", handle)
						}
					}
				}
			}

			comp := &SyncComputation{
				Operation:     FheOperation(ct.Operation),
				Inputs:        syncInputs,
				ResultHandles: resultHandles,
			}

			request.Computations = append(request.Computations, comp)
			log.Debug("Add operation", "op", comp.Operation, "handle", ct.Handle())

			ctToBlockIndex[string(ct.OutputHandle)] = block
		}
	}

	log.Info("Sending grpc request",
		"computations", len(request.Computations),
		"compressed ciphertexts", len(request.CompressedCiphertexts))

	if len(request.Computations) != 0 {
		for _, compCt := range request.CompressedCiphertexts {
			log.Debug("Request with compressed ciphertext", "handle", common.BytesToHash(compCt.Handle).TerminalString(),
				"compCt len", len(compCt.Serialization))
		}
	}

	startTime := time.Now()
	client := NewFhevmExecutorClient(conn)
	response, err := client.SyncCompute(context.Background(), &request)
	if err != nil {
		return err
	}

	ciphertexts := response.GetResultCiphertexts()
	if ciphertexts == nil {
		return errors.New(response.GetError().String())
	}

	if availableCts > 0 {
		log.Debug("Computations completed", "duration", time.Since(startTime))
	}

	log.Info("Response", "ciphertexts count", len(ciphertexts.Ciphertexts))

	outCts := ciphertexts.Ciphertexts
	for _, ct := range outCts {
		theBlock, exists := ctToBlockIndex[string(ct.Handle)]
		if !exists {
			return errors.New("ciphertext doesn't exist in our block index we built earlier, should be impossible")
		}

		blockData := app.cache.blocksCiphertexts[theBlock]
		if blockData == nil {
			blockData = &CacheBlockData{
				materializedCiphertexts: make(map[string][]byte),
			}
			app.cache.blocksCiphertexts[theBlock] = blockData
		}

		blockData.materializedCiphertexts[string(ct.Handle)] = ct.Serialization

		log.Debug("Response ciphertext", "handle", common.BytesToHash(ct.Handle).TerminalString(), "len", len(ct.Serialization))
	}

	// reset map of the queue
	app.cache.ciphertextsToCompute = make(map[int64]*BlockCiphertextQueue)

	return nil
}
