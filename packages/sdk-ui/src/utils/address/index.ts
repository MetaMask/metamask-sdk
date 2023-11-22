import { isValidAddress, toChecksumAddress } from 'ethereumjs-util';

// Define a type for the strings function
type StringsFunction = (key: string) => string;

// Assuming strings is a function that takes a key and returns a string
const strings: StringsFunction = (key: string) => `String for ${key}`;

export function renderFullAddress(address: string): string {
  return address
    ? toChecksumAddress(address)
    : strings('transactions.tx_details_not_available');
}

export const formatAddress = (
  rawAddress: string,
  type?: 'short' | 'mid' | 'full',
): string => {
  if (!isValidAddress(rawAddress)) {
    return rawAddress;
  }

  switch (type) {
    case 'short':
      return renderShortAddress(rawAddress);
    case 'mid':
      return renderSlightlyLongAddress(rawAddress);
    default:
      return renderFullAddress(rawAddress);
  }
};

export function renderShortAddress(address: string, chars: number = 4): string {
  if (!address) return address;
  const checksummedAddress = toChecksumAddress(address);
  return `${checksummedAddress.substr(
    0,
    chars + 2,
  )}...${checksummedAddress.substr(-chars)}`;
}

export function renderSlightlyLongAddress(
  address: string,
  chars: number = 4,
  initialChars: number = 20,
): string {
  if (!address) return address;
  const checksummedAddress = toChecksumAddress(address);
  return `${checksummedAddress.slice(
    0,
    chars + initialChars,
  )}...${checksummedAddress.slice(-chars)}`;
}
