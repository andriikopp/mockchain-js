const express = require('express');
const crypto = require('crypto');
const SHA256 = require('crypto-js/sha256');

const { Block, Blockchain } = require('./blockchain.js');

const app = express();
const blockchain = new Blockchain();

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
        if (blockchain.isValid()) {
            res.status(200).send(blockchain.chain.length.toString());
        } else {
            res.status(400).send(BAD_REQUEST_RESPONSE);
        }
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.get('/height/:height', (req, res) => {
    try {
        if (req.params.height < 0 || req.params.height > blockchain.chain.length - 1) {
            res.status(400).send(BAD_REQUEST_RESPONSE);
        } else {
            if (blockchain.isValid()) {
                const block = blockchain.getBlockByNumber(req.params.height);
                block.blockHeight = req.params.height;

                res.status(200).send(block);
            } else {
                res.status(400).send(BAD_REQUEST_RESPONSE);
            }
        }
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.get('/hash/:hash', (req, res) => {
    try {
        if (blockchain.isValid()) {
            res.status(200).send(blockchain.getBlockByHash(req.params.hash));
        } else {
            res.status(400).send(BAD_REQUEST_RESPONSE);
        }
    } catch (err) {
        res.status(500).send(ERROR_RESPONSE);
        console.error(err);
    }
});

app.post('/block', express.json({ type: '*/*' }), (req, res) => {
    try {
        const from = req.body.from;
        const fromPrivateKey = req.body.fromPrivateKey;
        const to = req.body.to;
        const metadata = req.body.metadata;

        if ((from && fromPrivateKey && to && metadata) &&
            from.toString() === SHA256(fromPrivateKey).toString() &&
            blockchain.isValid()) {

            const blockHash = blockchain.addBlock(new Block({
                'from': from,
                'to': to,
                'metadata': metadata
            }));

            res.status(200).send({
                'blockHash': blockHash
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