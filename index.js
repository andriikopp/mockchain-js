const express = require('express');
const crypto = require('crypto');
const SHA256 = require('crypto-js/sha256');

const { Block, Blockchain } = require('./blockchain.js');

const validators = require('./validators.js');

const argv = process.argv;

if (argv.length < 5 || argv[2] !== '-n' || argv[4] !== '-p') {
    console.log('\nWelcome to MockchainJS!\n\n' +
        'Run node index.js with the following options:\n\n' +
        '-n\tNode name\n-p\tPort number\n');
    return;
}

const app = express();

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
                'blockHash': blockchain.getBlockHash(newBlock)
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
                confirmedBlocks.push(blockchain.addBlock(pendingBlocks[i]));
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
    console.log(`Listening on port ${PORT_NUMBER}`);
});