import {
  isValidAddress,
  toChecksumAddress
} from 'ethereumjs-util';

//FIXME use actual strings
const strings = {}
/**
 * Returns full checksummed address
 *
 * @param {String} address - String corresponding to an address
 * @returns {String} - String corresponding to full checksummed address
 */
export function renderFullAddress(address) {
  return address
    ? toChecksumAddress(address)
    : strings('transactions.tx_details_not_available');
}

/**
 * Method to format the address to a shorter version
 * @param {String} rawAddress - Full public  address
 * @param {String} type - Format  type
 * @returns {String} Formatted address
 */
export const formatAddress = (rawAddress, type) => {
  let formattedAddress = rawAddress;

  if (!isValidAddress(rawAddress)) {
    return rawAddress;
  }

  if (type && type === 'short') {
    formattedAddress = renderShortAddress(rawAddress);
  } else if (type && type === 'mid') {
    formattedAddress = renderSlightlyLongAddress(rawAddress);
  } else {
    formattedAddress = renderFullAddress(rawAddress);
  }

  return formattedAddress;
};

/**
 * Returns short address format
 *
 * @param {String} address - String corresponding to an address
 * @param {Number} chars - Number of characters to show at the end and beginning.
 * Defaults to 4.
 * @returns {String} - String corresponding to short address format
 */
export function renderShortAddress(address, chars = 4) {
  if (!address) return address;
  const checksummedAddress = toChecksumAddress(address);
  return `${checksummedAddress.substr(
    0,
    chars + 2,
  )}...${checksummedAddress.substr(-chars)}`;
}

export function renderSlightlyLongAddress(
  address,
  chars = 4,
  initialChars = 20,
) {
  if (!address) return address;
  const checksummedAddress = toChecksumAddress(address);
  return `${checksummedAddress.slice(
    0,
    chars + initialChars,
  )}...${checksummedAddress.slice(-chars)}`;
}

