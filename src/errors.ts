export class RetrieveHeadBlockError extends Error {
  constructor() {
    super("Error retrieving head block, max retries failed");
    Object.setPrototypeOf(this, RetrieveHeadBlockError.prototype);
  }
}

export class RetrieveBlockError extends Error {
  constructor() {
    super("Error block, max retries failed");
    Object.setPrototypeOf(this, RetrieveBlockError.prototype);
  }
}

export class NotInitializedError extends Error {
  constructor() {
    super(`Cannot reach supplied minter endpoint`);
    Object.setPrototypeOf(this, NotInitializedError.prototype);
  }
}
