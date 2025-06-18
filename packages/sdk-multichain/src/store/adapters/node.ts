import { StoreAdapter } from "../../domain/store/adapter";
import fs from 'node:fs';
import path from 'node:path';

const CONFIG_FILE = path.resolve(process.cwd(), '.metamask.json');

export class StoreAdapterNode extends StoreAdapter {

  async getItem(key: string): Promise<string | null> {
    if (!fs.existsSync(CONFIG_FILE)) {
      return null;
    }
    const contents = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(contents);
    return config[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, '{}');
    }
    const contents = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(contents);
    config[key] = value;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  async deleteItem(key: string): Promise<void> {
    if (!fs.existsSync(CONFIG_FILE)) {
      return;
    }
    const contents = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(contents);
    delete config[key];
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }
}
