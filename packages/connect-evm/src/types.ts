// Basic types redefined to avoid importing @metamask/utils due to Buffer dependency

export type Hex = `0x${string}`;
export type Address = Hex;
