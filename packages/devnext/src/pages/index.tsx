import Link from 'next/link';
import { First } from '@metamask/sdk-ui';

export default function Home() {
  return (
    <div>
      <div>
        <Link href={'demo'}>Main demo</Link>
      </div>
      <div>
        <Link href={'uikit'}>UI Kit demo</Link>
      </div>
      <div style={{ margin: 20 }}>
        <First />
      </div>
    </div>
  );
}
