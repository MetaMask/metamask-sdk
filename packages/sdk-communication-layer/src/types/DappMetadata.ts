export interface DappMetadata {
  url?: string;
  name?: string;
  base64Icon?: string;
}

export interface DappMetadataWithSource extends DappMetadata {
  source?: string;
}
