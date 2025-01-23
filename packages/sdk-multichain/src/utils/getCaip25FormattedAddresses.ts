// packages/sdk-multichain/src/utils/getCaip25FormattedAddresses.ts

/**
 * Formats addresses as [CAIP-10](https://chainagnostic.org/CAIPs/caip-10) addresses for it's respective request scope. See [CAIP-25](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-25.md) and .
 * @param scope - The scope to create session for.
 * @param addresses - The addresses to format. If address is empty, we remove it from the array.
 * @returns The formatted addresses with the scope to create session for.
 */
export const getCaip25FormattedAddresses = (
  scope: string,
  addresses: string[],
): string[] => {
  return addresses.reduce<string[]>((result, address) => {
    if (address.length > 0) {
      result.push(`${scope}:${address}`);
    }
    return result;
  }, []);
};
