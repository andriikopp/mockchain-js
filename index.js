const express = require('express');
const cors = require('cors')
const crypto = require('crypto');
const SHA256 = require('crypto-js/sha256');

const { Block, Blockchain } = require('./blockchain.js');

const validators = require('./validators.js');

const argv = process.argv;

if (argv.length < 6 || argv[2] !== '-n' || argv[4] !== '-p') {
    console.log('\nWelcome to MockchainJS!\n\n' +
        'Run node index.js with the following options:\n\n' +
        '-n\tNode name\n' +
        '-p\tPort number\n');
    return;
}

const app = express();
app.use(cors());

const blockchain = new Blockchain(argv[3]);
const pendingBlocks = [];

const PORT_NUMBER = Number.parseInt(argv[5]);

const ADDRESS_LENGTH = 64;

const BAD_REQUEST_RESPONSE = {
    'message': 'Request validation failed',
    'statusCode': 400
};

const ERROR_RESPONSE = {
    'message': 'Internal server error',
    'statusCode': 500
};

app.get('/account', (req, res) => {
    try {
        const privateKey = crypto.randomBytes(ADDRESS_LENGTH).toString('hex');
        const address = SHA256(privateKey.toString());

        const account = {
            'address': address.toString(),
            'privateKey': privateKey.toString()
        };

        res.status(200).send(account);
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.get('/current', (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        res.status(200).send(blockchain.chain.length.toString());
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.get('/height/:height', (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        if (req.params.height < 0 || req.params.height > blockchain.chain.length - 1) {
            res.status(400).send(BAD_REQUEST_RESPONSE);
        } else {
            const block = blockchain.getBlockByNumber(req.params.height);
            block.blockHeight = req.params.height;

            res.status(200).send(block);
        }
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.get('/hash/:hash', (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        res.status(200).send(blockchain.getBlockByHash(req.params.hash));
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.get('/chain', (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        res.status(200).send({
            'chain': blockchain.chain,
            'hashList': blockchain.hashList
        });
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.post('/block', express.json({ type: '*/*' }), (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        const senderAddress = req.body.senderAddress;
        const senderPrivateKey = req.body.senderPrivateKey;
        const metadata = req.body.metadata;
        const timestamp = Number.parseInt(req.body.timestamp);

        const previousBlock = blockchain.getLastBlock();

        if (senderAddress && senderPrivateKey && metadata && timestamp &&
            senderAddress.toString() === SHA256(senderPrivateKey).toString() &&
            timestamp > Number.parseInt(previousBlock.blockTime)) {

            const newBlock = new Block(timestamp, {
                'senderAddress': senderAddress,
                'metadata': metadata
            });

            pendingBlocks.push(newBlock);

            const newBlockHash = blockchain.getBlockHash(newBlock);

            res.status(200).send({
                'blockHash': newBlockHash
            });

            console.log(`${new Date().toLocaleString()} - Block ${newBlockHash} pending`);
        } else {
            res.status(400).send(BAD_REQUEST_RESPONSE);
        }
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.post('/confirm', express.json({ type: '*/*' }), (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        const validatorAddress = req.body.validatorAddress;
        const validatorPrivateKey = req.body.validatorPrivateKey;

        if (validatorAddress && validatorPrivateKey &&
            validatorAddress.toString() === SHA256(validatorPrivateKey).toString() &&
            validators.list.includes(validatorAddress)) {

            const confirmedBlocks = [];

            for (let i = 0; i < pendingBlocks.length; i++) {
                pendingBlocks[i].blockData.confirmedBy = validatorAddress;

                confirmedBlocks.push(blockchain.addBlock(new Block(pendingBlocks[i].blockTime, pendingBlocks[i].blockData)));
            }

            pendingBlocks.length = 0;

            res.status(200).send({
                'blockHashes': confirmedBlocks
            });

            for (let i = 0; i < confirmedBlocks.length; i++) {
                console.log(`${new Date().toLocaleString()} - Block ${confirmedBlocks[i]} confirmed`);
            }
        } else {
            res.status(400).send(BAD_REQUEST_RESPONSE);
        }
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.post('/call', express.json({ type: '*/*' }), (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        const block = req.body.block;
        const args = req.body.args;

        if (block && args) {
            const code = blockchain.getBlockByHash(block).blockData.metadata;
            const result = eval(`(${code})${args}`);

            res.status(200).send({
                'result': result
            });
        } else {
            res.status(400).send(BAD_REQUEST_RESPONSE);
        }
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.listen(PORT_NUMBER, () => {
    console.log(`MockchainJS node ${argv[3]} listening on port ${PORT_NUMBER}`);
});