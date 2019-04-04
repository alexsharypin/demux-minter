import AbstractMinterActionReader from "./AbstractMinterActionReader";
import Axios from "axios";
import { MinterActionReaderOptions } from "./interfaces";
import {
  RetrieveHeadBlockError,
  RetrieveBlockError,
  NotInitializedError
} from "./errors";
import { retry } from "./utils";
import MinterBlock from "./MinterBlock";

export default class MinterActionReader extends AbstractMinterActionReader {
  protected minterEndpoint: string;

  constructor(options: MinterActionReaderOptions) {
    super(options);
    const { minterEndpoint } = options;
    this.minterEndpoint = minterEndpoint.replace(/\/+$/g, "");
  }

  public async getHeadBlockHeight(
    numRetries: number = 120,
    waitTimeMs: number = 250
  ): Promise<number> {
    try {
      const blockHeight = await retry(
        async () => {
          const {
            data: {
              result: { latest_block_height }
            }
          } = await Axios.get(`${this.minterEndpoint}/status`);

          return latest_block_height;
        },
        numRetries,
        waitTimeMs
      );

      return parseInt(blockHeight);
    } catch (err) {
      throw new RetrieveHeadBlockError();
    }
  }

  public async getBlock(
    blockHeight: number,
    numRetries: number = 120,
    waitTimeMs: number = 250
  ): Promise<MinterBlock> {
    try {
      const block = await retry(
        async () => {
          const {
            data: { result }
          } = await Axios.get(`${this.minterEndpoint}/block`, {
            params: { height: blockHeight }
          });

          const {
            data: {
              result: { events }
            }
          } = await Axios.get(`${this.minterEndpoint}/events`, {
            params: { height: blockHeight }
          });

          const rawBlock = { ...result, events };

          return new MinterBlock(rawBlock);
        },
        numRetries,
        waitTimeMs
      );

      return block;
    } catch (err) {
      throw new RetrieveBlockError();
    }
  }

  protected async setup(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await Axios.get(`${this.minterEndpoint}/status`);
    } catch (err) {
      throw new NotInitializedError();
    }
  }
}
