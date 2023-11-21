import { ItemView } from './components/item-view/item-view';
import { IconSimplified } from './components/icons/IconsSimplified';
import { IconOriginal } from './components/icons/IconOriginal';
import { MetaMaskButton } from './components/metamask-button/metamask-button';
import { PreviewScreen } from './screens/preview/preview';
import { AddressCopyButton } from './components/address-copy-button/address-copy-button';
import { UIProvider } from './context/ui-provider';
import DS from './design-system';
import { useTheme } from './theme';
import { ToastContext } from './design-system/components/Toast';
import { FloatingMetaMaskButton } from './components/floating-metamask-button/floating-metamask-button';

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
  ItemView,
  UIProvider,
  FloatingMetaMaskButton,
  IconSimplified,
  IconOriginal,
  MetaMaskButton,
  PreviewScreen,
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
  ToastContext,
  useComponentSize,
  useStyles,
  useTheme,
  assets,
};
