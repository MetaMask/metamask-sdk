import {
  MetaMaskProvider,
  SDKConfigContext,
  SDKConfigContextProps,
  SDKConfigProvider,
  SDKConfigProviderProps,
  SDKContext,
  SDKState,
  useSDK,
  useSDKConfig,
} from '@metamask/sdk-react';
import { AddressCopyButton } from './components/address-copy-button/address-copy-button';
import { FloatingMetaMaskButton } from './components/floating-metamask-button/floating-metamask-button';
import { IconOriginal } from './components/icons/IconOriginal';
import { IconSimplified } from './components/icons/IconsSimplified';
import { ItemView } from './components/item-view/item-view';
import { LanguagePicker } from './components/language-picker/language-picker';
import { MetaMaskButton } from './components/metamask-button/metamask-button';
import {
  RPCHistoryViewer,
  RPCHistoryViewerProps,
} from './components/rpc-history-viewer/rpc-history-viewer';
import {
  SDKConfigCard,
  SDKConfigCardProps,
} from './components/sdk-config-card/sdk-config-card';
import { SDKConfig, SDKConfigProps } from './components/sdk-config/sdk-config';
import {
  SDKDebugPanel,
  SDKDebugPanelProps,
} from './components/sdk-debug-panel/sdk-debug-panel';
import { SDKStatus, SDKStatusProps } from './components/sdk-status/sdk-status';
import { UIProvider } from './context/ui-provider';
import DS from './design-system';
import { ToastContext } from './design-system/components/Toast';
import { PreviewScreen } from './screens/preview/preview';
import { useTheme } from './theme';

const {
  Avatar,
  AvatarGroup,
  Button,
  ButtonIcon,
  Card,
  Cell,
  Checkbox,
  Icon,
  ListItem,
  ListItemColumn,
  ListItemMultiSelect,
  ListItemSelect,
  Tag,
  TagUrl,
  Text,
  TextWithPrefixIcon,
  Toast,
  useComponentSize,
  useStyles,
  assets,
} = DS;

export {
  AddressCopyButton,
  Avatar,
  AvatarGroup,
  Button,
  ButtonIcon,
  Card,
  Cell,
  Checkbox,
  FloatingMetaMaskButton,
  Icon,
  IconOriginal,
  IconSimplified,
  ItemView,
  LanguagePicker,
  ListItem,
  ListItemColumn,
  ListItemMultiSelect,
  ListItemSelect,
  MetaMaskButton,
  PreviewScreen,
  RPCHistoryViewer,
  RPCHistoryViewerProps,
  SDKConfig,
  SDKConfigCard,
  SDKConfigCardProps,
  SDKConfigProps,
  SDKDebugPanel,
  SDKDebugPanelProps,
  SDKStatus,
  SDKStatusProps,
  Tag,
  TagUrl,
  Text,
  TextWithPrefixIcon,
  Toast,
  ToastContext,
  UIProvider,
  assets,
  useComponentSize,
  useStyles,
  useTheme,
};

// Need to re-export these from @metamask/sdk-react to be available in children components
export {
  MetaMaskProvider,
  SDKConfigContext,
  SDKConfigContextProps,
  SDKConfigProvider,
  SDKConfigProviderProps,
  SDKContext,
  SDKState,
  useSDK,
  useSDKConfig,
};
