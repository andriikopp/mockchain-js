## mockchain-js

🔗 MockchainJS is a lightweight, simple blockchain-inspired ledger that allows users easily and quickly achieve blockchain-like behavior for NodeJS.

### Dependencies:
- ⚙️ express
- 🔐 crypto-js, crypto
- ⛈ stormdb

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
        "from": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
        "to": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
        "metadata": {
            "name": "Test NFT",
            "symbol": "TNFT",
            "uri": "http://localhost:3000/TestNFT.json"
        }
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
        "from": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
        "to": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
        "metadata": {
            "name": "Test NFT",
            "symbol": "TNFT",
            "uri": "http://localhost:3000/TestNFT.json"
        }
    },
    "blockHash": "e09d2c1684948c7b78433e25c9c9ad55f21e2f76e032c43208a42e465e738c8b",
    "previousBlockHash": "9a052e006f51a7d78ce8e672b168ae54b779724900b96f52ab0b06fc940bdb65"
}
```
---
#### 🔴 /block
- Method: **POST**
- Request:
```json
{
  "from": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
  "fromPrivateKey": "1c69428f44b32bcd5441e1e370c83469f585169a908917fe9124157f6ca13aaf41a684b9cd47770b059c4ea0000e007fd928bf468d5b06d54f5df38c1e1984fc",
  "to": "cd6005508d123dfde8c255a01631fa4ee67dbe1f78c6172ebc6241676a6b6dbc",
  "metadata": {
    "name": "Test NFT",
    "symbol": "TNFT",
    "uri": "http://localhost:3000/TestNFT.json"
  }
}
```
- Response:
```json
{
    "blockHash": "e09d2c1684948c7b78433e25c9c9ad55f21e2f76e032c43208a42e465e738c8b"
}
```

### License
---
MIT