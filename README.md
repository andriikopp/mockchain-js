## mockchain-js

🔗 MockchainJS is a lightweight, simple blockchain-inspired ledger that allows users easily and quickly achieve blockchain-like behavior for NodeJS.

### 🛠 Algorithm
MockchainJS uses a *simplified* **Proof of Authority (PoA)** algorithm to add new blocks.
It uses the ```list``` array containing addresses of authorized validators in the ```validators.js``` file:
```javascript
const list = [
    '12f91d12ae69b01feef0c9a1291a364e1fc7483ff4c1c4506c3ff4fc5971a488'
];
```
Authorized validators should use the ```/confirm``` Application Programming Interface (API) gateway to put new records in blockchain.
This approach allows MockchainJS to deliver fast transactions.

### 🔓 Security
Each time blockchain is addressed through API endpoints, the chain is checked, and blocks starting from the first invalid one are rejected.
The SHA256 encryption algorithm is used to check the consistency of the blockchain.

### 🤖 Programmability
MockchainJS offers simple programmability to execute *oversimplified* **smart-contracts** that should be given as the JavaScript code in the ```blockData.metadata``` property:
```json
{
  "senderAddress": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
  "senderPrivateKey": "1c69428f44b32bcd5441e1e370c83469f585169a908917fe9124157f6ca13aaf41a684b9cd47770b059c4ea0000e007fd928bf468d5b06d54f5df38c1e1984fc",
  "metadata": "(x, y) => x + y",
  "timestamp": 1670771435228
}
```
Deployed "contracts" can be called using the ```/call``` API gateway.
A contract is addressed by a hash value of the block in which it was published.
Arguments should be passed as the string enclosed in parentheses, i.e. ```"(2, 2)"```.
In the future, the ```to``` property will be used to assign the contract's address.

### Dependencies:
- ⚙️ express
- 🔐 crypto-js, crypto
- ⛈ stormdb
- ❓ request
- 🖥 prompt-sync

### 🚀 Running a node
MockchainJS node starts using a simple command, such as the following:
```shell
node index.js -n <node_name> -p <port_number>
```
Here ```-n``` is the node name option and ```-p``` is the port number option. Both options are mandatory.

### 🖥 CLI Interface
MockchainJS offers a simple Command-Line Interface (CLI) that you can run using the following command:
```shell
node client.js -c <command>
```
Here ```-c``` is the command that user wants to submit to a node:
- ```block``` submits a new block, for example:
```shell
node client.js -c block
> { "senderAddress": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc", "senderPrivateKey": "1c69428f44b32bcd5441e1e370c83469f585169a908917fe9124157f6ca13aaf41a684b9cd47770b059c4ea0000e007fd928bf468d5b06d54f5df38c1e1984fc", "metadata": "MockchainJS is awesome!"}
```
- ```confirm``` confirms pending blocks if the user is an authorized validator, for example:
```shell
node client.js -c confirm
> { "validatorAddress": "12f91d12ae69b01feef0c9a1291a364e1fc7483ff4c1c4506c3ff4fc5971a488", "validatorPrivateKey": "387e5da7215c16063e9b9b50f8da5d8f3a338c3c7f936e069a2bf9b595bfa948b2b9484b6662d9505f8a582c2a8c12c3fcd8f72ff4c836d0d4d1db4bf777b0bc"}
```
The list of active peers is given in the ```nodes``` array:
```javascript
const nodes = [
    'http://localhost:3001',
    'http://localhost:3002'
];
```

### ♻️ Chain synchronization
Use the ```sync.js``` util to synchronize your node with peers given in the array ```peers```:
```javascript
const peers = [
    'http://localhost:3001',
    'http://localhost:3002'
];
```
**WARNING!** Shut down your node before running the synchronization tool or remove it from the list of peers.
For example, if your node's name is *n2*, run the following command:
```shell
node sync.js -n n2
```

### 📱 Web client
The HTML client is available in the ```/app``` folder, its usage examples are given below:

<img src="https://raw.githubusercontent.com/andriikopp/mockchain-js/main/figures/index.png" height="400">
<img src="https://raw.githubusercontent.com/andriikopp/mockchain-js/main/figures/block.png" height="400">
<img src="https://raw.githubusercontent.com/andriikopp/mockchain-js/main/figures/confirm.png" height="400">
<img src="https://raw.githubusercontent.com/andriikopp/mockchain-js/main/figures/chain.png" height="400">

Using the HTML client, users can create accounts, send blocks, confirm pending blocks (if they are authorized validators), and see the whole chain.
By default, the web client connects to the node by address ```http://localhost:3001/account```. If necessary, this can be easily changed in the code of HTML pages.

### API Endpoints
---
#### 🟢 /account
- Method: **GET**
- Response:
```json
{
    "address": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
    "privateKey": "1c69428f44b32bcd5441e1e370c83469f585169a908917fe9124157f6ca13aaf41a684b9cd47770b059c4ea0000e007fd928bf468d5b06d54f5df38c1e1984fc"
}
```
---
#### 🟢 /current
- Method: **GET**
- Response:
```json
2
```
---
#### 🟢 /height/{blockNumber}
- Method: **GET**
- Response:
```json
{
    "blockTime": "1670771435228",
    "blockData": {
        "senderAddress": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
        "metadata": "MockchainJS is awesome!",
        "confirmedBy": "12f91d12ae69b01feef0c9a1291a364e1fc7483ff4c1c4506c3ff4fc5971a488"
    },
    "blockHash": "e09d2c1684948c7b78433e25c9c9ad55f21e2f76e032c43208a42e465e738c8b",
    "previousBlockHash": "9a052e006f51a7d78ce8e672b168ae54b779724900b96f52ab0b06fc940bdb65"
}
```
---
#### 🟢 /hash/{blockHash}
- Method: **GET**
- Response:
```json
{
    "blockTime": "1670771435228",
    "blockData": {
        "senderAddress": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
        "metadata": "MockchainJS is awesome!",
        "confirmedBy": "12f91d12ae69b01feef0c9a1291a364e1fc7483ff4c1c4506c3ff4fc5971a488"
    },
    "blockHash": "e09d2c1684948c7b78433e25c9c9ad55f21e2f76e032c43208a42e465e738c8b",
    "previousBlockHash": "9a052e006f51a7d78ce8e672b168ae54b779724900b96f52ab0b06fc940bdb65"
}
```
---
#### 🟢 /chain
- Method: **GET**
- Response:
```json
{
    "chain": [{
            "blockTime": "0",
            "blockData": [],
            "previousBlockHash": "",
            "blockHash": "431bf5c814e384ce9fa40f655f4b94f7f6a8c8504ea4844c30c484ebf03121f1"
        },
        {
            "blockTime": 1670924128758,
            "blockData": {
                "senderAddress": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
                "metadata": "MockchainJS is awesome!",
                "confirmedBy": "12f91d12ae69b01feef0c9a1291a364e1fc7483ff4c1c4506c3ff4fc5971a488"
            },
            "previousBlockHash": "431bf5c814e384ce9fa40f655f4b94f7f6a8c8504ea4844c30c484ebf03121f1",
            "blockHash": "5dfea2593f943ac8620c2a3ef6345c1c9815a7f2f3f53c16ec0ba40f6acedcb8"
        }
    ],
    "hashList": {
        "431bf5c814e384ce9fa40f655f4b94f7f6a8c8504ea4844c30c484ebf03121f1": 0,
        "5dfea2593f943ac8620c2a3ef6345c1c9815a7f2f3f53c16ec0ba40f6acedcb8": 1
    }
}
```
---
#### 🔴 /block
- Method: **POST**
- Request:
```json
{
  "senderAddress": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
  "senderPrivateKey": "1c69428f44b32bcd5441e1e370c83469f585169a908917fe9124157f6ca13aaf41a684b9cd47770b059c4ea0000e007fd928bf468d5b06d54f5df38c1e1984fc",
  "metadata": "MockchainJS is awesome!",
  "timestamp": 1670771435228
}
```
- Response:
```json
{
    "blockHash": "e09d2c1684948c7b78433e25c9c9ad55f21e2f76e032c43208a42e465e738c8b"
}
```
---
#### 🔴 /confirm
- Method: **POST**
- Request:
```json
{
  "validatorAddress": "12f91d12ae69b01feef0c9a1291a364e1fc7483ff4c1c4506c3ff4fc5971a488",
  "validatorPrivateKey": "387e5da7215c16063e9b9b50f8da5d8f3a338c3c7f936e069a2bf9b595bfa948b2b9484b6662d9505f8a582c2a8c12c3fcd8f72ff4c836d0d4d1db4bf777b0bc"
}
```
- Response:
```json
{
    "blockHashes": ["a0fce24c1413b8a550fdd5a59c48eea15cc35478b97fed85ccf0843c0bc9ccfc", "999f9758bb4f853b4000e39c6be8a0006e3ecb2e38031389350a2cf735a69465", "762e2cefdb15c9e59c3381b79b3e2ed1c45ca6f8bda98366f16f806d1f92ce1a"]
}
```
---
#### 🔴 /call
- Method: **POST**
- Request:
```json
{
	"block": "49ae5d253e05bd9982a2cfba8c30393f47654d5e0838f346b54df9d36dcc3d45",
	"args": "(2, 2)"
}
```
- Response:
```json
{
    "result": 4
}
```

### License
---
[MIT](https://github.com/andriikopp/mockchain-js/blob/main/LICENSE)