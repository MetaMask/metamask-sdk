export interface SDKUIOptions {
  installer?: (params: { link: string }) => void;
  confirm?: () => void;
}
