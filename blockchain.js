const SHA256 = require('crypto-js/sha256');
const StormDB = require('stormdb');

const engine = new StormDB.localFileEngine('./chain.json');
const db = new StormDB(engine);

db.default({ chain: [], hashList: {} });

class Block {
    constructor(blockData = []) {
        this.blockTime = Date.now().toString();
        this.blockData = blockData;
        this.previousBlockHash = '';
        this.blockHash = SHA256(this.previousBlockHash + this.blockTime + JSON.stringify(this.blockData)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [new Block()];
        this.hashList = {};
        this.hashList[this.chain[0].blockHash] = 0;

        if (db.get('chain').value().length > 0) {
            this.chain = db.get('chain').value();
            this.hashList = db.get('hashList').value();
        }
    }

    getBlockHash(block) {
        return SHA256(block.previousBlockHash + block.blockTime + JSON.stringify(block.blockData)).toString();
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
        block.blockHash = this.getBlockHash(block);

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

            if (currentBlock.blockHash !== blockchain.getBlockHash(currentBlock) ||
                prevBlock.blockHash !== currentBlock.previousBlockHash) {

                return false;
            }
        }

        return true;
    }

    rejectInvalidBlocks(blockchain = this) {
        const validChain = [blockchain.chain[0]];
        const validHashList = {};
        validHashList[validChain[0].blockHash] = 0;

        for (let i = 1; i < blockchain.chain.length; i++) {
            const currentBlock = blockchain.chain[i];
            const prevBlock = blockchain.chain[i - 1];

            if (currentBlock.blockHash !== blockchain.getBlockHash(currentBlock) ||
                prevBlock.blockHash !== currentBlock.previousBlockHash) {

                break;
            } else {
                validChain.push(currentBlock);
                validHashList[currentBlock.blockHash] = i;
            }
        }

        this.chain = validChain;
        this.hashList = validHashList;

        db.set('chain', this.chain).save();
        db.set('hashList', this.hashList).save();
    }
}

module.exports = { Block, Blockchain };