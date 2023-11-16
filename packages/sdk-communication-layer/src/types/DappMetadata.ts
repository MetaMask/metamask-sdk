export interface DappMetadata {
  url?: string;
  name?: string;
  iconUrl?: string;
}

export interface DappMetadataWithSource extends DappMetadata {
  source?: string;
}
