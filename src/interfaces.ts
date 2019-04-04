import { IndexingStatus } from "./enums";
import AbstractMinterActionHandler from "./AbstractMinterActionHandler";
import AbstractMinterActionReader from "./AbstractMinterActionReader";

export interface MinterActionWatcherOptions {
  actionReader: AbstractMinterActionReader;
  actionHandler: AbstractMinterActionHandler;
  pollInterval: number;
}

export interface AbstractMinterActionReaderOptions {
  startAtBlock?: number;
}

export interface MinterActionReaderOptions
  extends AbstractMinterActionReaderOptions {
  minterEndpoint: string;
}

export interface NextBlock {
  block: Block;
  blockMeta: BlockMeta;
}

export interface BlockMeta {
  isNewBlock: boolean;
}

export interface Block {
  blockInfo: BlockInfo;
  actions: Action[];
}

export interface Validator {
  pubkey: string;
  signed: boolean;
}

export interface BlockInfo {
  blockHash: string;
  blockHeight: number;
  time: Date;
  numTxs: number;
  totalTxs: number;
  blockReward: number;
  size: number;
  proposer: string;
  validators: Validator[];
}

export interface Action {
  type: string;
  payload: Object;
}

export interface IndexState {
  blockHeight: number;
  blockHash: string;
}

export interface Updater {
  type: string;
  updater: (
    state: any,
    payload: any,
    blockInfo: BlockInfo,
    context: any
  ) => void;
}

export interface Effect {
  type: string;
  effect: (
    state: any,
    payload: any,
    blockInfo: BlockInfo,
    context: any
  ) => void;
}

export interface WatcherInfo {
  indexingStatus: IndexingStatus;
  error?: Error;
  handler: HandlerInfo;
  reader: ReaderInfo;
}

export interface HandlerInfo {
  lastProcessedBlockHeight: number;
  lastProcessedBlockHash: string;
}

export interface ReaderInfo {
  currentBlockHeight: number;
  startAtBlock: number;
  headBlockHeight: number;
}
