# demux-minter

[Demux](https://github.com/EOSIO/demux-js) implementations to read blocks, actions and events from Minter blockchain.

## Installation

```bash
# Using yarn
yarn add demux-minter

# Using npm
npm install --save demux-minter
```

## Usage

This library provides the following classes:

- `AbstractMinterActionReader`: Abstract class used for implementing your own Action Readers

- `AbstractMinterActionHandler`: Abstract class used for implementing your own Action Handlers

- `MinterActionReader`: Base class that implements a ready-to-use Action Reader

- `MinterActionWatcher`: Base class that implements a ready-to-use Action Watcher

For action types (transactions and events) description we use human-readable names:

#### Transactions [types](https://docs.minter.network/#section/Transactions/Types)

- `Send` - 0x01
- `SellCoin` - 0x02
- `SellAllCoin` - 0x03
- `BuyCoin` - 0x04
- `CreateCoin` - 0x05
- `DeclareCandidacy` - 0x06
- `Delegate` - 0x07
- `Unbond` - 0x08
- `RedeemCheck` - 0x09
- `SetCandidateOnline` - 0x0A
- `SetCandidateOffline` - 0x0B
- `CreateMultisig` - 0x0C
- `Multisend` - 0x0D
- `EditCandidate` - 0x0E

#### Events types

- `Reward` - minter/RewardEvent
- `Slash` - minter/SlashEvent

## Action Handler Example

```js
import { AbstractMinterActionHandler } from "demux-minter";

const state = {
  blockHash: "",
  blockHeight: 0,
  sendCount: 0,
  delegateCount: 0
};

class MinterActionHandler extends AbstractMinterActionHandler {
  async handleWithState(handle) {
    await handle(state);
  }

  async loadIndexState() {
    return state;
  }

  async updateIndexState(state, block, context) {
    state.blockHeight = block.blockInfo.blockHeight;
    state.blockHash = block.blockInfo.blockHash;
  }

  async setup() {}
}
```

## Full example

```js
import { MinterActionWatcher, MinterActionReader } from "demux-minter";
import MinterActionHandler from "./MinterActionHandler";

function sendUpdater(state, payload, blockInfo, context) {
  state.sendCount += 1;
}

function delegateUpdater(state, payload, blockInfo, context) {
  state.delegateCount += 1;
}

function sendEffect(state, payload, blockInfo, context) {
  console.log("Send", state.sendCount);
}

function delegateEffect(state, payload, blockInfo, context) {
  console.log("Delegate", state.delegateCount);
}

const updaters = [
  {
    type: "Send",
    updater: sendUpdater
  },
  {
    type: "Delegate",
    updater: delegateUpdater
  }
];

const effects = [
  {
    type: "Send",
    effect: sendEffect
  },
  {
    type: "Delegate",
    effect: delegateEffect
  }
];

const actionReader = new MinterActionReader({
  minterEndpoint: "https://minter-node-1.testnet.minter.network:8841",
  startAtBlock: 0
});

const actionHandler = new MinterActionHandler(updaters, effects);

const actionWatcher = new MinterActionWatcher({ actionReader, actionHandler });

actionWatcher.watch();
```
