const prompt = require('prompt-sync')({ sigint: true });
const request = require('request');

const nodes = [
    'http://localhost:3001',
    'http://localhost:3002'
];

const argv = process.argv;

if (argv.length < 4 || argv[2] !== '-c') {
    console.log('\nWelcome to MockchainJS CLI!\n\n' +
        'Run node client.js with the following options:\n\n' +
        '-c\tCommand name:\tblock | confirm\n');
    return;
}

const sendPostRequest = (path, body) => {
    request({
        url: path,
        method: 'POST',
        json: true,
        body: body
    }, function(error, response, body) {
        console.log(response.body);
    });
}

const json = JSON.parse(prompt());

json.timestamp = Date.now().toString();

for (let i = 0; i < nodes.length; i++) {
    sendPostRequest(nodes[i] + '/' + argv[3], json);
}