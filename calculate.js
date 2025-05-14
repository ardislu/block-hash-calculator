import { RLP, keccak256 } from './vendor.min.js';

// Uint8Array to hex string
function hex(array) {
  return `0x${[...array].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Hex string to Uint8Array
function arr(hex) {
  return Uint8Array.from(hex.replace('0x', '').match(/.{2}/g), v => parseInt(v, 16));
}

// Number to Uint8Array (big-endian)
function arrBE(n) {
  const v = new DataView(new ArrayBuffer(8));
  v.setBigUint64(0, BigInt(n), false);
  return new Uint8Array(v.buffer);
}

// Calculate the header, RLP-encoded header, and Keccak-256 hash of RLP
function calculate(block) {
  // Header fields available at genesis
  const header = [
    block.parentHash,
    block.sha3Uncles,
    block.miner,
    block.stateRoot,
    block.transactionsRoot,
    block.receiptsRoot,
    block.logsBloom,
    BigInt(block.difficulty),
    BigInt(block.number),
    BigInt(block.gasLimit),
    BigInt(block.gasUsed),
    BigInt(block.timestamp),
    block.extraData,
    block.mixHash,
    block.nonce
  ];

  // Avalanche Apricot Phase 1 (no specification)
  // https://github.com/ava-labs/coreth/blob/master/README.md#block-format
  if (block?.extDataHash) {
    header.push(block.extDataHash);
  }

  // London hard fork
  // https://eips.ethereum.org/EIPS/eip-1559#block-hash-changing
  if (block?.baseFeePerGas) {
    header.push(BigInt(block.baseFeePerGas));
  }

  // Avalanche Apricot Phase 4 (no specification)
  // https://github.com/ava-labs/coreth/blob/f4aa91c7af01cc27b95dfc0086fd92a8174cf67c/core/types/block.go#L99
  if (block?.extDataGasUsed) {
    header.push(BigInt(block.extDataGasUsed));
    header.push(BigInt(block.blockGasCost));
  }

  // Paris hard fork
  // https://eips.ethereum.org/EIPS/eip-3675#block-structure
  // Hardcodes block.nonce to '0x0000000000000000'.
  // No code change required, just FYI.

  // Shapella hard fork
  // https://eips.ethereum.org/EIPS/eip-4895#new-field-in-the-execution-payload-header-withdrawals-root
  if (block?.withdrawalsRoot) {
    header.push(block.withdrawalsRoot);
  }

  // Dencun hard fork
  // https://eips.ethereum.org/EIPS/eip-4844#header-extension
  if (block?.blobGasUsed) {
    header.push(
      BigInt(block.blobGasUsed),
      BigInt(block.excessBlobGas)
    );
  }

  // Dencun hard fork
  // https://eips.ethereum.org/EIPS/eip-4788#block-structure-and-validity
  if (block?.parentBeaconBlockRoot) {
    header.push(block.parentBeaconBlockRoot);
  }

  const rlp = RLP.encode(header);
  const hash = keccak256(rlp);

  return {
    header,
    encoded: hex(rlp),
    hash: hex(hash)
  };
}

// ZKsync Era ABI-encodes its block header parameters instead of RLP-encoding
// https://docs.zksync.io/zk-stack/concepts/blocks#l2-blockhash-calculation-and-storage
function calculateZkSync(block) {
  // Block number 13234791 was not documented in the upgrade spec but retrieved from manual testing
  // https://github.com/zkSync-Community-Hub/zksync-developers/discussions/87
  if (Number(block.number) < 13234791) { // "Legacy blockhash" is keccak256(abi.encodePacked(uint32(_blockNumber)))
    const header = [Number(block.number)];

    // abi.encodePacked(uint32(_blockNumber)) is the block number literal as a big-endian uint32
    const n = new DataView(new ArrayBuffer(4));
    n.setUint32(0, Number(block.number), false); // Forces big-endian regardless of platform
    const data = new Uint8Array(n.buffer);

    const hash = keccak256(data);

    return {
      header,
      encoded: hex(data),
      hash: hex(hash)
    };
  }

  // Non-legacy blockhash is keccak256(abi.encode(_blockNumber, _blockTimestamp, _prevL2BlockHash, _blockTxsRollingHash))
  // where "_blockTxsRollingHash" is defined as:
  // _blockTxsRollingHash = 0 for an empty block.
  // _blockTxsRollingHash = keccak(0, tx1_hash) for a block with one tx.
  // _blockTxsRollingHash = keccak(keccak(0, tx1_hash), tx2_hash) for a block with two txs, etc.
  // Note that abi.encode() is used to concat bytes, i.e. "0" is uint32(0).
  function blockTxsRollingHash(transactions) {
    if (transactions.length === 0) {
      return new Uint8Array(32);
    }
    let hash = keccak256(Uint8Array.from([...new Uint8Array(32), ...arr(transactions[0])]));
    for (let i = 1; i < transactions.length; i++) {
      hash = keccak256(Uint8Array.from([...hash, ...arr(transactions[i])]));
    }
    return hash;
  }

  const header = [
    Number(block.number),
    Number(block.timestamp),
    block.parentHash,
    block.transactions.length === 0 ? `0x${'0'.repeat(64)}` : block.transactions
  ];

  // Manually create ABI encoded value for (uint64, uint64, bytes32, bytes32)
  const data = new Uint8Array(32 * 4);                       // The end value will look like this in hex (offset indices for clarity):
  data.set(arrBE(block.number), 32 - 8);                     // 00: 000000000000000000000000000000000000000000000000NNNNNNNNNNNNNNNN <-- block.number (big-endian)
  data.set(arrBE(block.timestamp), 32 * 2 - 8);              // 32: 000000000000000000000000000000000000000000000000NNNNNNNNNNNNNNNN <-- block.timestamp (big-endian)
  data.set(arr(block.parentHash), 32 * 2);                   // 64: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH <-- block.parentHash
  data.set(blockTxsRollingHash(block.transactions), 32 * 3); // 96: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH <-- blockTxsRollingHash

  const hash = keccak256(data);

  return {
    header,
    encoded: hex(data),
    hash: hex(hash)
  }
}

export { calculate, calculateZkSync };