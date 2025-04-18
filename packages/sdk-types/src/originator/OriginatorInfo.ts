/**
 * Defines the metadata for the originator (DApp) sending analytics or requesting connection.
 */
export type OriginatorInfo = {
  /** The canonical URL of the DApp */
  url: string;
  /** The display name of the DApp */
  title: string;
  /** The platform identifier (e.g., 'web', 'react-native') */
  platform: string;
  /** A unique identifier for the DApp, often the hostname */
  dappId: string;
  /** Optional URL to the DApp's icon */
  icon?: string;
  /** Optional URL scheme used by the DApp (e.g., for deep linking) */
  scheme?: string;
  /** Optional source identifier (e.g., 'qrcode', 'deeplink') */
  source?: string;
  /** Optional API version used by the DApp */
  apiVersion?: string;
  /** Optional identifier for the specific connector/library used (e.g., '@metamask/sdk-react-native') */
  connector?: string;
};
