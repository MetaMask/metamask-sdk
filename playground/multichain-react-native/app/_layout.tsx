import 'react-native-get-random-values';

import { SDKProvider } from '../src/sdk/SDKProvider';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <SDKProvider>
      <Slot />
    </SDKProvider>
  );
}
