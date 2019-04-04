import {
  NextBlock,
  Block,
  IndexState,
  HandlerInfo,
  Updater,
  Effect
} from "./interfaces";

export default abstract class AbstractMinterActionHandler {
  protected lastProcessedBlockHeight: number = 0;
  protected lastProcessedBlockHash: string = "";
  protected initialized: boolean = false;

  constructor(
    protected updaters: Updater[] = [],
    protected effects: Effect[] = []
  ) {
    this.updaters = updaters;
    this.effects = effects;
  }

  public async handleBlock(nextBlock: NextBlock): Promise<void> {
    const {
      block: {
        blockInfo: { blockHeight }
      }
    } = nextBlock;

    if (!this.initialized) {
      await this.initialize();
      this.initialized = true;
    }

    if (blockHeight === this.lastProcessedBlockHeight) {
      return;
    }

    const handleWithArgs: (state: any, context?: any) => Promise<void> = async (
      state: any,
      context: any = {}
    ) => {
      await this.handleActions(state, context, nextBlock);
    };

    await this.handleWithState(handleWithArgs);
  }

  public async initialize(): Promise<void> {
    await this.setup();
    await this.refreshIndexState();
  }

  public get info(): HandlerInfo {
    return {
      lastProcessedBlockHeight: this.lastProcessedBlockHeight,
      lastProcessedBlockHash: this.lastProcessedBlockHash
    };
  }

  protected abstract async updateIndexState(
    state: any,
    block: Block,
    context?: any
  ): Promise<void>;

  protected abstract async setup(): Promise<void>;

  protected abstract async loadIndexState(): Promise<IndexState>;

  protected abstract async handleWithState(
    handle: (state: any, context?: any) => void
  ): Promise<void>;

  protected async handleActions(
    state: any,
    context: any,
    nextBlock: NextBlock
  ): Promise<void> {
    const { block } = nextBlock;
    const {
      blockInfo: { blockHeight, blockHash }
    } = block;

    await this.runUpdaters(state, block, context);

    this.runEffects(state, block, context);

    await this.updateIndexState(state, block, context);

    this.lastProcessedBlockHeight = blockHeight;
    this.lastProcessedBlockHash = blockHash;
  }

  protected async runUpdaters(
    state: any,
    block: Block,
    context: any
  ): Promise<void> {
    const { actions, blockInfo } = block;
    for (const action of actions) {
      for (const updater of this.updaters) {
        if (action.type === updater.type) {
          await updater.updater(state, action.payload, blockInfo, context);
        }
      }
    }
  }

  protected runEffects(state: any, block: Block, context: any): void {
    const { actions, blockInfo } = block;
    for (const action of actions) {
      for (const effect of this.effects) {
        if (action.type === effect.type) {
          effect.effect(state, action.payload, blockInfo, context);
        }
      }
    }
  }

  private async refreshIndexState() {
    const { blockHeight, blockHash } = await this.loadIndexState();

    this.lastProcessedBlockHeight = blockHeight;
    this.lastProcessedBlockHash = blockHash;
  }
}
