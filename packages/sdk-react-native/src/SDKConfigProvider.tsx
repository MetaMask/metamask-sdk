import React, { createContext, useEffect, useState } from 'react';
import { logger } from './utils/logger';

export interface SDKConfigContextProps {
  dappMetadata: {
    name: string;
    url: string;
    iconUrl: string;
    scheme: string;
  };
  infuraAPIKey?: string;
}

const initProps: SDKConfigContextProps = {
  dappMetadata: {
    name: 'My DApp',
    url: 'https://mydapp.com',
    iconUrl: 'https://mydapp.com/icon',
    scheme: 'mydapp',
  },
};

export const SDKConfigContext = createContext({
  ...initProps,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAppContext: (_: Partial<SDKConfigContextProps>) => {
    // placeholder implemented in the provider.
  }, // placeholder implemented in the provider.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset: () => {
    // placeholder implemented in the provider.
  }, // placeholder implemented in the provider.
});

export interface SDKConfigProviderProps {
  initialSocketServer?: string;
  initialInfuraKey?: string;
  children: React.ReactNode;
  debug?: boolean;
}

const STORAGE_LOCATION = 'appContext';

// FIXME use appropriate children type ( currently linting issue on devnext )
export const SDKConfigProvider = ({
  initialSocketServer,
  initialInfuraKey,
  children,
}: SDKConfigProviderProps) => {
  const [appContext, setAppContext] = useState<SDKConfigContextProps>({
    ...initProps,
    infuraAPIKey: initialInfuraKey,
  });

  const syncState = (newState: SDKConfigContextProps) => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    const queryString = new URLSearchParams();
    for (const [key, value] of Object.entries(newState)) {
      queryString.set(key, encodeURIComponent(JSON.stringify(value)));
    }

    // eslint-disable-next-line no-undef
    localStorage.setItem(STORAGE_LOCATION, JSON.stringify(newState));
    // Update URL without refreshing the page using History API
    // eslint-disable-next-line no-undef
    const newurl = `${window.location.protocol}//${window.location.host}${
      // eslint-disable-next-line no-undef
      window.location.pathname
    }?${queryString.toString()}`;
    // eslint-disable-next-line no-undef
    window.history.pushState({ path: newurl }, '', newurl);
  };

  useEffect(() => {
    // Load context from localStorage and URL (priority to URL)
    const loadContext = () => {
      // eslint-disable-next-line no-undef
      const storedContext = localStorage?.getItem(STORAGE_LOCATION);
      const initialContext: Partial<SDKConfigContextProps> = storedContext
        ? JSON.parse(storedContext)
        : {
            infuraAPIKey: initialInfuraKey,
            socketServer: initialSocketServer,
          };

      if (!initialContext.infuraAPIKey) {
        initialContext.infuraAPIKey = initialInfuraKey;
      }

      logger(`[SDKConfigProvider] initialContext`, initialContext);

      // eslint-disable-next-line no-undef
      const urlParams = new URLSearchParams(window.location.search);
      const urlContext = Array.from(urlParams.keys()).reduce((acc, key) => {
        try {
          // We need to assert that acc conforms to Partial<CustomContext>
          (acc as Partial<SDKConfigContextProps>)[
            key as keyof Partial<SDKConfigContextProps>
          ] = JSON.parse(decodeURIComponent(urlParams.get(key) || ''));
        } catch (e) {
          console.error(`Error parsing URL param ${key}`, e);
        }
        return acc;
      }, {} as Partial<SDKConfigContextProps>);

      logger(`[SDKConfigProvider] urlContext`, urlContext);

      const computedContext: SDKConfigContextProps = {
        ...initProps,
        ...initialContext,
        ...urlContext,
      };

      logger(`[SDKConfigProvider] computedContext`, computedContext);

      setAppContext(computedContext);
    };

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      loadContext();
    }
  }, []);

  const updateAppContext = (newProps: Partial<SDKConfigContextProps>) => {
    setAppContext((current) => {
      const updatedContext = { ...current, ...newProps };
      syncState(updatedContext);

      setTimeout(() => {
        if (
          typeof window !== 'undefined' &&
          // eslint-disable-next-line no-undef
          typeof window.location !== 'undefined' &&
          // eslint-disable-next-line no-undef
          typeof window.location.reload !== 'undefined'
        ) {
          // Reload window with changes
          // eslint-disable-next-line no-undef
          window.location.reload();
        } else {
          console.warn(`[SDKConfigProvider] updateAppContext not implemented`);
        }
      }, 100);
      return updatedContext;
    });
  };

  const reset = () => {
    updateAppContext({
      ...initProps,
      infuraAPIKey: initialInfuraKey,
    });
  };

  // The context value now includes the state and the function to update it
  const contextValue = {
    ...appContext,
    reset,
    setAppContext: updateAppContext,
  };

  return (
    <SDKConfigContext.Provider value={contextValue}>
      {children}
    </SDKConfigContext.Provider>
  );
};
