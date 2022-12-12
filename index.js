const express = require('express');
const crypto = require('crypto');
const SHA256 = require('crypto-js/sha256');

const { Block, Blockchain } = require('./blockchain.js');

const validators = require('./validators.js');

const app = express();
const blockchain = new Blockchain();

const pendingBlocks = [];

const PORT_NUMBER = 3000;
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

app.post('/block', express.json({ type: '*/*' }), (req, res) => {
    try {
        if (!blockchain.isValid()) {
            blockchain.rejectInvalidBlocks();
        }

        const from = req.body.from;
        const fromPrivateKey = req.body.fromPrivateKey;
        const to = req.body.to;
        const metadata = req.body.metadata;

        if (from && fromPrivateKey && to && metadata && from.toString() === SHA256(fromPrivateKey).toString()) {
            const newBlock = new Block({
                'from': from,
                'to': to,
                'metadata': metadata
            });

            pendingBlocks.push(newBlock);

            res.status(200).send({
                'blockHash': newBlock.getHash()
            });
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

        const from = req.body.from;
        const fromPrivateKey = req.body.fromPrivateKey;

        if (from && fromPrivateKey && from.toString() === SHA256(fromPrivateKey).toString() && validators.list.includes(from)) {
            const confirmedBlocks = [];

            for (let i = 0; i < pendingBlocks.length; i++) {
                blockchain.addBlock(pendingBlocks[i]);

                confirmedBlocks.push(pendingBlocks[i].getHash());
            }

            res.status(200).send({
                'blockHashes': confirmedBlocks
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
    console.log(`Listening on port ${PORT_NUMBER}`);
});