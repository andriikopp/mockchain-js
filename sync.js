const request = require('request');
const fs = require('fs');

const { Block, Blockchain } = require('./blockchain.js');

const peers = [
    'http://localhost:3001',
    'http://localhost:3002'
];

const argv = process.argv;

if (argv.length < 4 || argv[2] !== '-n') {
    console.log('\nWelcome to MockchainJS Synchronization Util!\n\n' +
        'Run node sync.js with the following options:\n\n' +
        '-n\tNode name\n\n' +
        'ATTENTION! SHUT DOWN YOUR NODE before synchronization!\n\n');
    return;
}

const blockchain = new Blockchain(argv[3]);

let currentHeight = blockchain.chain.length;

for (let i = 0; i < peers.length; i++) {
    request({
        url: peers[i] + '/current',
        method: 'GET'
    }, function(error, response, body) {
        try {
            const peerHeight = Number.parseInt(response.body);

            if (peerHeight > currentHeight) {
                request({
                    url: peers[i] + '/chain',
                    method: 'GET'
                }, function(error, response, body) {
                    try {
                        const peerChain = JSON.parse(response.body);

                        fs.writeFileSync(`./${argv[3]}_chain.json`, JSON.stringify(peerChain));
                    } catch (error) {
                        console.error(`WARNING!\tRequest ${peers[i]}/chain failed:\t${error.message}`);
                    }
                });

                currentHeight = peerHeight;
            }
        } catch (error) {
            console.error(`WARNING!\tRequest ${peers[i]}/current failed:\t${error.message}`);
        }
    });
}