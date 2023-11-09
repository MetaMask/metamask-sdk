import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <div>
        <Link href={'demo'}>Main demo</Link>
      </div>
      <div>
        <Link href={'uikit'}>UI Kit demo</Link>
      </div>
    </div>
  );
}
