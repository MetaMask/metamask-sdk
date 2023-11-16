import Link from 'next/link';
import { FABAccount, First, IconSimplified, ItemView } from '@metamask/sdk-ui';

export default function Home() {
  return (
    <div>
      <div style={{ height: '100vh' }}>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ padding: 20, border: '1px solid' }}>
            <Link href={'demo'}>Main demo</Link>
          </div>
          <div style={{ padding: 20, border: '1px solid' }}>
            <Link href={'uikit'}>UI Kit demo</Link>
          </div>
        </div>
        <hr />
        <div>
          <h2>Testing UI Components</h2>
          <div style={{ margin: 20 }}>
            <First />
          </div>
          <div style={{ margin: 20, backgroundColor: 'black' }}>
            <IconSimplified color={'white'} />
            <IconSimplified color={'orange'} />
          </div>
          <div style={{ margin: 20 }}>
            <ItemView processing={true} label="label" value="value" />
          </div>
          <FABAccount />
        </div>
      </div>
    </div>
  );
}
