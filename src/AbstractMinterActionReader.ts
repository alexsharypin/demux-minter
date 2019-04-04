import {
  Block,
  AbstractMinterActionReaderOptions,
  NextBlock,
  BlockMeta,
  ReaderInfo
} from "./interfaces";

const defaultBlock: Block = {
  blockInfo: {
    blockHash: "",
    blockHeight: 0,
    time: new Date(0),
    numTxs: 0,
    totalTxs: 0,
    blockReward: 0,
    size: 0,
    proposer: "",
    validators: []
  },
  actions: []
};

export default abstract class AbstractMinterActionReader {
  public startAtBlock: number;
  public headBlockHeight: number = 0;
  public currentBlockHeight: number;
  protected currentBlockData: Block = defaultBlock;
  protected initialized: boolean = false;

  constructor(options: AbstractMinterActionReaderOptions) {
    const { startAtBlock = 1 } = options;

    this.startAtBlock = startAtBlock;
    this.currentBlockHeight = startAtBlock - 1;
  }

  public abstract async getHeadBlockHeight(): Promise<number>;

  public abstract async getBlock(blockHeight: number): Promise<Block>;

  public async getNextBlock(): Promise<NextBlock> {
    const blockMeta: BlockMeta = {
      isNewBlock: false
    };

    if (!this.initialized) await this.initialize();

    if (this.currentBlockHeight === this.headBlockHeight) {
      this.headBlockHeight = await this.getHeadBlockHeight();
    }

    if (this.currentBlockHeight < this.headBlockHeight) {
      const blockData: Block = await this.getBlock(this.currentBlockHeight + 1);

      this.currentBlockData = blockData;
      this.currentBlockHeight = this.currentBlockData.blockInfo.blockHeight;

      blockMeta.isNewBlock = true;
    }

    return {
      block: this.currentBlockData,
      blockMeta
    };
  }

  public async initialize(): Promise<void> {
    await this.setup();
    await this.initBlockState();
    this.initialized = true;
  }

  public get info(): ReaderInfo {
    return {
      currentBlockHeight: this.currentBlockHeight,
      startAtBlock: this.startAtBlock,
      headBlockHeight: this.headBlockHeight
    };
  }

  protected abstract async setup(): Promise<void>;

  private async initBlockState() {
    this.headBlockHeight = await this.getHeadBlockHeight();
    if (this.currentBlockHeight < 0) {
      this.currentBlockHeight = this.headBlockHeight + this.currentBlockHeight;
      this.startAtBlock = this.currentBlockHeight + 1;
    }
  }
}
