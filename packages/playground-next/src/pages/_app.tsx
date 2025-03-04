import '../styles/globals.css'; // Import global CSS here
import type { AppProps } from 'next/app';
import { Header } from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
