import { Json } from "@metamask/utils";
import crossFetch from "cross-fetch";


let rpcId = 1;

function getNextRpcId() {
  rpcId += 1;
  return rpcId;
}

export type RPCResponse = {
  id: number, jsonrpc: string, result: unknown
}


export class RPCClient {

  constructor(
    private readonly endpoint: string,
    private readonly sdkInfo: string) {
  }

  private get headers() {
    const defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (this.endpoint.includes('infura')) {
      return {
        ...defaultHeaders,
        'Metamask-Sdk-Info': this.sdkInfo,
      }
    }
    return defaultHeaders;
  }

  private async _fetch(body: string, method: string, headers: Record<string, string>) {
    try {
      const {endpoint} = this;
      const response = await crossFetch(endpoint, {
        method,
        headers,
        body,
      });
      if (!response.ok) {
        throw new Error(`Server responded with a status of ${response.status}`);
      }
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from RPC: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch from RPC: ${error}`);
      }
    }
  }

  private async parseResponse(response: Response) {
   try {
    const rpcResponse = await response.json() as RPCResponse;
    return rpcResponse.result as Json;
   } catch (error) {
    throw new Error(`Failed to parse response from RPC: ${error}`);
   }
  }

  async request(method: string, params: unknown) {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: getNextRpcId(),
    });
    const request = await this._fetch(body, "POST", this.headers);
    const response = await this.parseResponse(request);
    return response
  }


}