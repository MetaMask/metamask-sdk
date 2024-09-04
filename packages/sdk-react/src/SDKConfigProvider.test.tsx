import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useContext } from 'react';
import { SDKConfigProvider, SDKConfigContext } from './SDKConfigProvider';

// Mock logger
jest.mock('./utils/logger', () => ({
  logger: jest.fn(),
}));

const TestComponent = () => {
  const { socketServer, infuraAPIKey, useDeeplink, checkInstallationImmediately, setAppContext, reset, debug, logs, lang } = useContext(SDKConfigContext);

  return (
    <div>
      <div data-testid="socketServer">{socketServer}</div>
      <div data-testid="infuraAPIKey">{infuraAPIKey}</div>
      <div data-testid="useDeeplink">{useDeeplink ? 'true' : 'false'}</div>
      <div data-testid="checkInstallationImmediately">{checkInstallationImmediately ? 'true' : 'false'}</div>
      <div data-testid="debug">{debug ? 'true' : 'false'}</div>
      <div data-testid="logs">{JSON.stringify(logs)}</div>
      <div data-testid="lang">{lang}</div>
      <button onClick={() => setAppContext({ socketServer: 'wss://newserver.com' })}>Update Context</button>
      <button onClick={() => reset()}>Reset Context</button>
    </div>
  );
};

describe('SDKConfigProvider', () => {
  const initialSocketServer = 'wss://initialserver.com';
  const initialInfuraKey = 'initialInfuraKey';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.history.pushState({}, 'Test', '/');
  });

  it('should provide initial context values', () => {
    render(
      <SDKConfigProvider initialSocketServer={initialSocketServer} initialInfuraKey={initialInfuraKey}>
        <TestComponent />
      </SDKConfigProvider>,
    );

    expect(screen.getByTestId('socketServer')).toHaveTextContent(initialSocketServer);
    expect(screen.getByTestId('infuraAPIKey')).toHaveTextContent(initialInfuraKey);
    expect(screen.getByTestId('useDeeplink')).toHaveTextContent('true');
    expect(screen.getByTestId('checkInstallationImmediately')).toHaveTextContent('false');
    expect(screen.getByTestId('debug')).toHaveTextContent('true');
    expect(screen.getByTestId('logs')).toHaveTextContent(JSON.stringify({ sdk: true, provider: true, commLayer: true }));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });

  it('should update context values', async () => {
    render(
      <SDKConfigProvider initialSocketServer={initialSocketServer} initialInfuraKey={initialInfuraKey}>
        <TestComponent />
      </SDKConfigProvider>,
    );

    fireEvent.click(screen.getByText('Update Context'));

    await waitFor(() => {
      expect(screen.getByTestId('socketServer')).toHaveTextContent('wss://newserver.com');
    });
  });

  it('should reset context values to initial values', async () => {
    render(
      <SDKConfigProvider initialSocketServer={initialSocketServer} initialInfuraKey={initialInfuraKey}>
        <TestComponent />
      </SDKConfigProvider>,
    );

    fireEvent.click(screen.getByText('Update Context'));

    await waitFor(() => {
      expect(screen.getByTestId('socketServer')).toHaveTextContent('wss://newserver.com');
    });

    fireEvent.click(screen.getByText('Reset Context'));

    await waitFor(() => {
      expect(screen.getByTestId('socketServer')).toHaveTextContent(initialSocketServer);
      expect(screen.getByTestId('infuraAPIKey')).toHaveTextContent(initialInfuraKey);
    });
  });

  it('should load context from localStorage on initial load', async () => {
    const storedContext = {
      socketServer: 'wss://storedserver.com',
      infuraAPIKey: 'storedInfuraKey',
    };
    localStorage.setItem('appContext', JSON.stringify(storedContext));

    render(
      <SDKConfigProvider initialSocketServer={initialSocketServer} initialInfuraKey={initialInfuraKey}>
        <TestComponent />
      </SDKConfigProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('socketServer')).toHaveTextContent(storedContext.socketServer);
      expect(screen.getByTestId('infuraAPIKey')).toHaveTextContent(storedContext.infuraAPIKey);
    });
  });

  it('should load context from URL parameters on initial load', async () => {
    const urlParams = new URLSearchParams({
      socketServer: JSON.stringify('wss://urlserver.com'),
      infuraAPIKey: JSON.stringify('urlInfuraKey'),
    });
    window.history.pushState({}, 'Test', `/?${urlParams.toString()}`);

    render(
      <SDKConfigProvider initialSocketServer={initialSocketServer} initialInfuraKey={initialInfuraKey}>
        <TestComponent />
      </SDKConfigProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('socketServer')).toHaveTextContent('wss://urlserver.com');
      expect(screen.getByTestId('infuraAPIKey')).toHaveTextContent('urlInfuraKey');
    });
  });
});
