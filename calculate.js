import { RLP, keccak256 } from './vendor.min.js';

// Uint8Array to hex string
function hex(array) {
  return `0x${[...array].map(v => v.toString(16).padStart(2, '0')).join('')}`;
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
    rlp: hex(rlp),
    hash: hex(hash)
  };
}

export { calculate };