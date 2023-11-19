import { MetaMaskProvider } from '@metamask/sdk-react';
import type { Decorator, Preview } from '@storybook/react';
import React from 'react';
import { Platform } from 'react-native';
import { UIProvider } from '../src/index';

import { Buffer } from 'buffer';

// Assign Buffer to the global scope so it's available globally
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
} else if (typeof window !== 'undefined') {
  (window as any ).Buffer = Buffer;
}
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export const decorators: Decorator[] = [
  // Using a decorator to apply padding for every story
  (StoryFn: any) => {
    return (
      <MetaMaskProvider
        debug={true}
        sdkOptions={{
          enableDebug: true,
          logging: {
            developerMode: true,
          },
          dappMetadata: {
            name: 'StoryBook UI',
            url: 'http://devnext.fakeurl.com',
          },
        }}
      >
        <React.Fragment>
          {Platform.OS === 'web' ? (
            <style type="text/css">{`
                  @font-face {
                    font-family: 'MaterialCommunityIcons';
                    src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
                  }
                  @font-face {
                    font-family: 'FontAwesome';
                    src: url(${require('react-native-vector-icons/Fonts/FontAwesome.ttf')}) format('truetype');
                  }
                  @font-face {
                    font-family: 'MaterialIcons';
                    src: url(${require('react-native-vector-icons/Fonts/MaterialIcons.ttf')}) format('truetype');
                  }
                `}
            </style>
          ) : null
          }
          <UIProvider>
            <StoryFn />
          </UIProvider>
        </React.Fragment>
      </MetaMaskProvider>
    )
  },
];

export default preview;
