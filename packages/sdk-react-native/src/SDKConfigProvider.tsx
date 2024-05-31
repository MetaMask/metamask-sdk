import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

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
  setAppContext: (_: Partial<SDKConfigContextProps>) => {
    // placeholder implemented in the provider.
  },
  reset: () => {
    // placeholder implemented in the provider.
  },
});

export interface SDKConfigProviderProps {
  initialInfuraKey?: string;
  children: React.ReactNode;
}

const STORAGE_LOCATION = 'appContext';

export const SDKConfigProvider = ({
  initialInfuraKey,
  children,
}: SDKConfigProviderProps) => {
  const [appContext, setAppContext] = useState<SDKConfigContextProps>({
    ...initProps,
    infuraAPIKey: initialInfuraKey,
  });

  const syncState = async (newState: SDKConfigContextProps) => {
    try {
      const queryString = new URLSearchParams();
      for (const [key, value] of Object.entries(newState)) {
        queryString.set(key, encodeURIComponent(JSON.stringify(value)));
      }

      await AsyncStorage.setItem(STORAGE_LOCATION, JSON.stringify(newState));
    } catch (error) {
      console.error('Error syncing state to AsyncStorage:', error);
    }
  };

  useEffect(() => {
    const loadContext = async () => {
      try {
        const storedContext = await AsyncStorage.getItem(STORAGE_LOCATION);
        const initialContext: Partial<SDKConfigContextProps> = storedContext
          ? JSON.parse(storedContext)
          : {
              infuraAPIKey: initialInfuraKey,
            };

        if (!initialContext.infuraAPIKey) {
          initialContext.infuraAPIKey = initialInfuraKey;
        }

        const computedContext: SDKConfigContextProps = {
          ...initProps,
          ...initialContext,
        };

        setAppContext(computedContext);
      } catch (error) {
        console.error('Error loading context from AsyncStorage:', error);
      }
    };

    loadContext().catch((error) => {
      console.error('Error loading context from AsyncStorage:', error);
    });
  }, []);

  const updateAppContext = (newProps: Partial<SDKConfigContextProps>) => {
    setAppContext((current) => {
      const updatedContext = { ...current, ...newProps };
      syncState(updatedContext).catch((error) => {
        console.error('Error syncing state to AsyncStorage:', error);
      });

      setTimeout(() => {
        console.log('[SDKConfigProvider] Context updated', updatedContext);
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
