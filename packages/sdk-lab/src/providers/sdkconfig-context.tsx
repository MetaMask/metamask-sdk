// create an app context to fetch the socket server address in all components
import { DEFAULT_SERVER_URL } from '@metamask/sdk-communication-layer';
import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';

export interface CustomContext {
  socketServer: string;
  useDeeplink?: boolean;
  infuraAPIKey?: string;
  checkInstallationImmediately: boolean;
  logs: {
    sdk: boolean;
    provider: boolean;
    commLayer: boolean;
  };
  lang: string;
}

const initProps: CustomContext = {
  socketServer: process.env.NEXT_PUBLIC_COMM_SERVER_URL ?? DEFAULT_SERVER_URL,
  useDeeplink: true,
  checkInstallationImmediately: false,
  infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
  logs: {
    sdk: true,
    provider: true,
    commLayer: true,
  },
  lang: 'en',
};
export const SDKConfigContext = createContext({
  ...initProps,

  setAppContext: (_: Partial<CustomContext>) => {}, // placeholder
});

// FIXME use appropriate children type ( currently linting issue on devnext )
export const SDKConfigProvider = ({ children }: { children: any }) => {
  const [appContext, setAppContext] = useState(initProps);

  const syncState = (newState: CustomContext) => {
    const queryString = new URLSearchParams();
    for (const [key, value] of Object.entries(newState)) {
      queryString.set(key, encodeURIComponent(JSON.stringify(value)));
    }

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('appContext', JSON.stringify(newState));
    }

    // Update URL without refreshing the page using History API
    const newurl = `${window.location.protocol}//${window.location.host}${
      window.location.pathname
    }?${queryString.toString()}`;
    window.history.pushState({ path: newurl }, '', newurl);
  };

  useEffect(() => {
    // Load context from localStorage and URL (priority to URL)
    const loadContext = () => {
      const storedContext = localStorage.getItem('appContext');
      const initialContext: Partial<CustomContext> = storedContext
        ? JSON.parse(storedContext)
        : {};

      console.log(`[SDKConfigProvider] initialContext`, initialContext);

      const urlParams = new URLSearchParams(window.location.search);
      const urlContext = Array.from(urlParams.keys()).reduce((acc, key) => {
        try {
          // We need to assert that acc conforms to Partial<CustomContext>
          (acc as Partial<CustomContext>)[key as keyof Partial<CustomContext>] =
            JSON.parse(decodeURIComponent(urlParams.get(key) || ''));
        } catch (e) {
          console.error(`Error parsing URL param ${key}`, e);
        }
        return acc;
      }, {} as Partial<CustomContext>);
      console.log(`[SDKConfigProvider] urlContext`, urlContext);

      const computedContext: CustomContext = {
        ...initProps,
        ...initialContext,
        ...urlContext,
      };

      console.log(`[SDKConfigProvider] computedContext`, computedContext);

      setAppContext(computedContext);
    };

    if (typeof window !== 'undefined') {
      loadContext();
    }
  }, []);

  const updateAppContext = (newProps: Partial<CustomContext>) => {
    setAppContext((current) => {
      const updatedContext = { ...current, ...newProps };
      syncState(updatedContext);

      setTimeout(() => {
        // Reload window with changes
        window.location.reload();
      }, 100);
      return updatedContext;
    });
  };

  // The context value now includes the state and the function to update it
  const contextValue = {
    ...appContext,
    setAppContext: updateAppContext,
  };

  return (
    <SDKConfigContext.Provider value={contextValue}>
      {children}
    </SDKConfigContext.Provider>
  );
};

export const useSDKConfig = () => {
  const context = useContext(SDKConfigContext);
  if (context === undefined) {
    throw new Error('useSDKConfig must be used within a SDKConfigContext');
  }
  return context;
};
