export abstract class StoreClient {
  abstract getAnonId(): Promise<string>;
}
