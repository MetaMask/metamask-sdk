import { FloatingMetaMaskButton, MetaMaskButton } from '@metamask/sdk-ui';
import Link from 'next/link';

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
        <div style={{ padding: 20 }}>
          <MetaMaskButton />
        </div>
        <div>
          {/* <ADD />
          <PreviewScreen />
          <Avatar
            variant={AvatarVariant.Network}
            name="Ethereum"
            imageSource={assets.ethereum}
          /> */}
        </div>
      </div>
    </div>
  );
}
