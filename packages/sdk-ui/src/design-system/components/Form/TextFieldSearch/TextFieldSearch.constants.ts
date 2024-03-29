// External dependencies.
import { IconName, IconSize } from '../../Icons/Icon';
import { ButtonIconSizes } from '../../Buttons/ButtonIcon';
import { DEFAULT_TEXTFIELD_SIZE } from '../TextField/TextField.constants';

// Internal dependencies.
import { TextFieldSearchProps } from './TextFieldSearch.types';

// Defaults
export const DEFAULT_TEXTFIELDSEARCH_SEARCHICON_NAME = IconName.Search;
export const DEFAULT_TEXTFIELDSEARCH_SEARCHICON_SIZE = IconSize.Sm;
export const DEFAULT_TEXTFIELDSEARCH_CLOSEICON_NAME = IconName.Close;
export const DEFAULT_TEXTFIELDSEARCH_CLOSEICON_SIZE = ButtonIconSizes.Sm;

// Test IDs
export const TEXTFIELDSEARCH_TEST_ID = 'textfieldsearch';

// Sample consts
export const SAMPLE_TEXTFIELDSEARCH_PROPS: TextFieldSearchProps = {
  showClearButton: false,
  onPressClearButton: () => {
    console.log('clicked');
  },
  size: DEFAULT_TEXTFIELD_SIZE,
  isError: false,
  isDisabled: false,
  isReadonly: false,
  placeholder: 'Sample placeholder',
};
