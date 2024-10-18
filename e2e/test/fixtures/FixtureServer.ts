import Koa from 'koa';
import * as http from "http";
import { FIXTURE_SERVER_HOST, FIXTURE_SERVER_PORT } from '../../src/Constants';

const CURRENT_STATE_KEY = '__CURRENT__';
const DEFAULT_STATE_KEY = '__DEFAULT__';

class FixtureServer {
  private _app: Koa;
  private _stateMap: Map<string, Record<string, unknown>>;
  private _server: http.Server | undefined;

  constructor() {
    this._app = new Koa();
    this._stateMap = new Map([[DEFAULT_STATE_KEY, Object.create(null)]]);

    this._app.use(async (ctx: any) => {
      // Middleware to handle requests
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      ctx.set(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
      // Check if it's a request for the current state
      if (this._isStateRequest(ctx)) {
        ctx.body = this._stateMap.get(CURRENT_STATE_KEY);
      }
    });
  }

  // Start the fixture server
  async start(): Promise<void> {
    const options = {
      host: FIXTURE_SERVER_HOST,
      port: FIXTURE_SERVER_PORT,
      exclusive: true,
    };

    return new Promise<void>((resolve, reject) => {
      console.log('Starting fixture server...');
      this._server = this._app.listen(options);
      this._server.once('error', reject);
      this._server.once('listening', resolve);
    });
  }

  // Stop the fixture server
  async stop(): Promise<void> {
    if (!this._server) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      console.log('Stopping fixture server...');
      this._server!.close();
      this._server!.once('error', reject);
      this._server!.once('close', resolve);
      this._server = undefined;
    });
  }

  // Load JSON state into the server
  loadJsonState(rawState: Record<string, unknown>): void {
    console.log('Loading JSON state...');
    this._stateMap.set(CURRENT_STATE_KEY, rawState);
    console.log('JSON state loaded');
  }

  // Check if the request is for the current state
  private _isStateRequest(ctx: Koa.Context): boolean {
    return ctx.method === 'GET' && ctx.path === '/state.json';
  }
}

export default FixtureServer;
