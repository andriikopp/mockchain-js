const assert = require('assert');
const fs = require('fs');

const { Block, Blockchain } = require('./blockchain.js');

const blockchain = new Blockchain('test');

const previousBlockHash = blockchain.getLastBlock().blockHash;

const blockHash = blockchain.addBlock(new Block({
    'from': 'cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc',
    'to': 'cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc',
    'metadata': 'authentic'
}));

let block;

block = blockchain.getLastBlock();
assert(block.blockHash === blockHash);

block = blockchain.getBlockByNumber(1);
assert(block.blockHash === blockHash);

block = blockchain.getBlockByHash(blockHash);
assert(block.blockHash === blockHash);

assert(blockchain.isValid());

blockchain.chain[1].blockData.metadata = 'tampered';

assert(!blockchain.isValid());

blockchain.rejectInvalidBlocks();

block = blockchain.getLastBlock();
assert(block.blockHash = previousBlockHash);

fs.unlinkSync('./test_chain.json');