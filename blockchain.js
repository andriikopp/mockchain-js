const SHA256 = require('crypto-js/sha256');
const StormDB = require('stormdb');

const engine = new StormDB.localFileEngine('./chain.json');
const db = new StormDB(engine);

db.default({ chain: [], hashList: {} });

class Block {
    constructor(blockData = []) {
        this.blockTime = Date.now().toString();
        this.blockData = blockData;
        this.blockHash = this.getHash();
        this.previousBlockHash = '';
    }

    getHash() {
        return SHA256(this.previousBlockHash + this.blockTime + JSON.stringify(this.blockData)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [new Block()];
        this.hashList = {};
        this.hashList[this.chain[0].blockHash] = 0;

        if (db.get('chain').length > 0) {
            this.chain = db.get('chain');
            this.hashList = db.get('hashList');
        }
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    getBlockByNumber(number) {
        return this.chain[number];
    }

    getBlockByHash(hash) {
        return this.chain[this.hashList[hash]];
    }

    addBlock(block) {
        block.previousBlockHash = this.getLastBlock().blockHash;
        block.blockHash = block.getHash();

        this.chain.push(Object.freeze(block));
        this.hashList[block.blockHash] = this.chain.length - 1;

        db.set('chain', this.chain).save();
        db.set('hashList', this.hashList).save();

        return block.blockHash;
    }

    isValid(blockchain = this) {
        for (let i = 1; i < blockchain.chain.length; i++) {
            const currentBlock = blockchain.chain[i];
            const prevBlock = blockchain.chain[i - 1];

            if (currentBlock.blockHash !== currentBlock.getHash() || prevBlock.blockHash !== currentBlock.previousBlockHash) {
                return false;
            }
        }

        return true;
    }
}

module.exports = { Block, Blockchain };