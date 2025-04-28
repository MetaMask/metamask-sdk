export interface OriginatorInfo {
  url: string;
  title: string;
  platform: string;
  dappId: string;
  icon?: string;
  scheme?: string;
  source?: string;
  apiVersion?: string;
  connector?: string;
  anonId?: string; // FIXME: make this required
}
