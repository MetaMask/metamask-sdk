export interface DappMetadata {
  url?: string;
  name?: string;
  iconUrl?: string;
  scheme?: string;
  base64Icon?: string; // @deprecated use iconUrl instead - backwards compatibility
  connector?: string;
}

export interface DappMetadataWithSource extends DappMetadata {
  source?: string;
}
