export function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64');
}
