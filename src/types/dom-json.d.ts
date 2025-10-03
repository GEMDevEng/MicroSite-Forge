// Augment DOM Response to ensure .json() is available and typed
declare global {
  interface Response {
    json(): Promise<any>
  }
}

export {}
