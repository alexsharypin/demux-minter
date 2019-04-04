import AbstractMinterActionReader from "./AbstractMinterActionReader";
import AbstractMinterActionHandler from "./AbstractMinterActionHandler";
import { WatcherInfo, MinterActionWatcherOptions } from "./interfaces";
import { IndexingStatus } from "./enums";

export default class MinterActionWatcher {
  private running: boolean = false;
  private shouldPause: boolean = false;
  private clean: boolean = true;
  private error: Error | undefined = undefined;
  protected actionReader: AbstractMinterActionReader;
  protected actionHandler: AbstractMinterActionHandler;
  protected pollInterval: number;

  constructor(options: MinterActionWatcherOptions) {
    const { actionReader, actionHandler, pollInterval } = options;

    this.actionReader = actionReader;
    this.actionHandler = actionHandler;
    this.pollInterval = pollInterval;
  }

  public async watch() {
    if (this.shouldPause) {
      this.running = false;
      this.shouldPause = false;
      return;
    }

    this.clean = false;
    this.running = true;
    this.error = undefined;

    const startTime = Date.now();

    try {
      await this.checkForBlocks();
    } catch (err) {
      this.running = false;
      this.shouldPause = false;
      this.error = err;
      return;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    let waitTime = this.pollInterval - duration;
    if (waitTime < 0) {
      waitTime = 0;
    }
    setTimeout(async () => await this.watch(), waitTime);
  }

  public start(): boolean {
    if (this.running) {
      return false;
    }

    this.watch();
    return true;
  }

  public pause(): boolean {
    if (!this.running) {
      return false;
    }

    this.shouldPause = true;
    return true;
  }

  public get info(): WatcherInfo {
    const info: WatcherInfo = {
      handler: this.actionHandler.info,
      reader: this.actionReader.info,
      indexingStatus: this.status
    };
    if (this.error) {
      info.error = this.error;
    }
    return info;
  }

  protected async checkForBlocks() {
    let headBlockHeight = 0;
    while (
      !headBlockHeight ||
      this.actionReader.currentBlockHeight < headBlockHeight
    ) {
      if (this.shouldPause) {
        return;
      }

      const nextBlock = await this.actionReader.getNextBlock();

      if (!nextBlock.blockMeta.isNewBlock) {
        break;
      }

      await this.actionHandler.handleBlock(nextBlock);

      headBlockHeight = this.actionReader.headBlockHeight;
    }
  }

  private get status() {
    if (this.clean) {
      return IndexingStatus.Initial;
    }
    if (this.running && !this.shouldPause) {
      return IndexingStatus.Indexing;
    }
    if (this.running && this.shouldPause) {
      return IndexingStatus.Pausing;
    }
    if (this.error) {
      return IndexingStatus.Stopped;
    }
    return IndexingStatus.Paused;
  }
}
