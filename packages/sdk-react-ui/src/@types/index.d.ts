declare module 'react-copy-to-clipboard' {
  import { ComponentType } from 'react';
  
  const CopyToClipboard: ComponentType<{ text: string; onCopy?: (text: string) => void; children: React.ReactNode }>;
  
  export { CopyToClipboard };
}