// Third party dependencies.
import React, { useRef, ReactNode } from 'react';

// Internal dependencies.
import { ToastRef, ToastContextParams } from './Toast.types';

interface Props {
  children: ReactNode;
}

export const ToastContext = React.createContext<ToastContextParams>({
  toastRef: undefined,
});

export const ToastContextWrapper = ({ children }: Props) => {
  const toastRef = useRef<ToastRef | null>(null);
  return (
    <ToastContext.Provider value={{ toastRef }}>
      {children}
    </ToastContext.Provider>
  );
};
