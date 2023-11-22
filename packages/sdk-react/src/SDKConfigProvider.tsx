import { DEFAULT_SERVER_URL } from '@metamask/sdk-communication-layer';
import React, { createContext, useEffect, useState } from 'react';

export interface SDKConfigContextProps {
  socketServer: string;
  useDeeplink?: boolean;
  infuraAPIKey?: string;
  checkInstallationImmediately: boolean;
  debug: boolean;
  logs: {
    sdk: boolean;
    provider: boolean;
    commLayer: boolean;
  };
  lang: string;
}

const initProps: SDKConfigContextProps = {
  socketServer: DEFAULT_SERVER_URL,
  useDeeplink: true,
  checkInstallationImmediately: false,
  debug: true,
  logs: {
    sdk: true,
    provider: true,
    commLayer: true,
  },
  lang: 'en',
};
export const SDKConfigContext = createContext({
  ...initProps,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAppContext: (_: Partial<SDKConfigContextProps>) => { }, // placeholder implemented in the provider.
});

export interface SDKConfigProviderProps {
  initialSocketServer?: string;
  initialInfuraKey?: string;
  children: React.ReactNode;
}

// FIXME use appropriate children type ( currently linting issue on devnext )
export const SDKConfigProvider = ({ initialSocketServer, initialInfuraKey, children }: SDKConfigProviderProps) => {
  const [appContext, setAppContext] = useState<SDKConfigContextProps>({ ...initProps, socketServer: initialSocketServer ?? DEFAULT_SERVER_URL, infuraAPIKey: initialInfuraKey });

  const syncState = (newState: SDKConfigContextProps) => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    const queryString = new URLSearchParams();
    for (const [key, value] of Object.entries(newState)) {
      queryString.set(key, encodeURIComponent(JSON.stringify(value)));
    }

    localStorage.setItem('appContext', JSON.stringify(newState));
    // Update URL without refreshing the page using History API
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname
      }?${queryString.toString()}`;
    window.history.pushState({ path: newurl }, '', newurl);
  };

  useEffect(() => {
    // Load context from localStorage and URL (priority to URL)
    const loadContext = () => {
      const storedContext = localStorage.getItem('appContext');
      const initialContext: Partial<SDKConfigContextProps> = storedContext
        ? JSON.parse(storedContext)
        : {};

      console.log(`[SDKConfigProvider] initialContext`, initialContext);

      const urlParams = new URLSearchParams(window.location.search);
      const urlContext = Array.from(urlParams.keys()).reduce((acc, key) => {
        try {
          // We need to assert that acc conforms to Partial<CustomContext>
          (acc as Partial<SDKConfigContextProps>)[key as keyof Partial<SDKConfigContextProps>] =
            JSON.parse(decodeURIComponent(urlParams.get(key) || ''));
        } catch (e) {
          console.error(`Error parsing URL param ${key}`, e);
        }
        return acc;
      }, {} as Partial<SDKConfigContextProps>);
      console.log(`[SDKConfigProvider] urlContext`, urlContext);

      const computedContext: SDKConfigContextProps = {
        ...initProps,
        ...initialContext,
        ...urlContext,
      };

      console.log(`[SDKConfigProvider] computedContext`, computedContext);

      setAppContext(computedContext);
    };

    if (typeof window === 'undefined' && typeof localStorage !== 'undefined') {
      loadContext();
    }
  }, []);

  const updateAppContext = (newProps: Partial<SDKConfigContextProps>) => {
    setAppContext((current) => {
      const updatedContext = { ...current, ...newProps };
      syncState(updatedContext);

      setTimeout(() => {
        if(typeof window !== 'undefined' && typeof window.location !== 'undefined' && typeof window.location.reload !== 'undefined') {
          // Reload window with changes
          window.location.reload();
        } else {
          console.warn(`[SDKConfigProvider] updateAppContext not implemented`)
        }
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
