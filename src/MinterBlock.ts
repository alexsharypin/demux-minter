import { Block, Action, BlockInfo } from "./interfaces";

export default class MinterBlock implements Block {
  public blockInfo: BlockInfo;
  public actions: Action[];

  constructor(rawBlock: any) {
    const {
      hash,
      height,
      time,
      num_txs,
      total_txs,
      transactions,
      block_reward,
      size,
      proposer,
      validators,
      events
    } = rawBlock;

    this.blockInfo = {
      blockHash: hash,
      blockHeight: parseInt(height),
      time: new Date(time),
      numTxs: parseInt(num_txs),
      totalTxs: parseInt(total_txs),
      blockReward: parseInt(block_reward),
      size: parseInt(size),
      proposer,
      validators
    };

    this.actions = this.collectActionsFromBlock(transactions, events);
  }

  collectActionsFromBlock(transactions: [], events: []) {
    const collectedTransactions: Action[] = transactions.map(
      ({ type, ...payload }: { type: number }) => ({
        type: this.getTransactionType(type),
        payload
      })
    );

    const collectedEvents: Action[] = events.map(
      ({ type, value: payload }: { type: string; value: Object }) => ({
        type: this.getEventType(type),
        payload
      })
    );

    return [...collectedTransactions, ...collectedEvents];
  }

  getTransactionType(type: number) {
    const TransactionType: { [k: number]: string } = {
      1: "Send",
      2: "SellCoin",
      3: "SellAllCoin",
      4: "BuyCoin",
      5: "CreateCoin",
      6: "DeclareCandidacy",
      7: "Delegate",
      8: "Unbond",
      9: "RedeemCheck",
      10: "SetCandidateOnline",
      11: "SetCandidateOffline",
      12: "CreateMultisig",
      13: "Multisend",
      14: "EditCandidate"
    };

    return TransactionType[type];
  }

  getEventType(type: string) {
    const EventType: { [k: string]: string } = {
      "minter/RewardEvent": "Reward",
      "minter/SlashEvent": "Slash"
    };

    return EventType[type];
  }
}
