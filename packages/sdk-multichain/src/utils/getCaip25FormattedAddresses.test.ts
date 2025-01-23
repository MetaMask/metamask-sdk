import { getCaip25FormattedAddresses } from './getCaip25FormattedAddresses';

describe('getCaip25FormattedAddresses', () => {
  it('should format addresses with scope prefix', () => {
    const scope = 'eip155:1';
    const addresses = ['0x123', '0x456'];

    const result = getCaip25FormattedAddresses(scope, addresses);

    expect(result).toEqual([
      'eip155:1:0x123',
      'eip155:1:0x456'
    ]);
  });

  it('should filter out empty addresses', () => {
    const scope = 'eip155:1';
    const addresses = ['0x123', '', '0x456', ''];

    const result = getCaip25FormattedAddresses(scope, addresses);

    expect(result).toEqual([
      'eip155:1:0x123',
      'eip155:1:0x456'
    ]);
  });

  it('should return empty array for empty input', () => {
    const scope = 'eip155:1';
    const addresses: string[] = [];

    const result = getCaip25FormattedAddresses(scope, addresses);

    expect(result).toEqual([]);
  });

  it('should handle different scope formats', () => {
    const scope = 'solana:mainnet';
    const addresses = ['address1', 'address2'];

    const result = getCaip25FormattedAddresses(scope, addresses);

    expect(result).toEqual([
      'solana:mainnet:address1',
      'solana:mainnet:address2'
    ]);
  });
});
