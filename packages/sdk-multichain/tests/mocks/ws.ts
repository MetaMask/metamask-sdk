import * as t from 'vitest';

// Mock WebSocket at the top level
const createMockWebSocket = () => {
  const mockWS = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    readyState: 1,
    url: '',
    protocol: '',
    bufferedAmount: 0,
    extensions: '',
    binaryType: 'blob' as BinaryType,
    onopen: null as ((event: Event) => void) | null,
    onmessage: null as ((event: MessageEvent) => void) | null,
    onerror: null as ((event: Event) => void) | null,
    onclose: null as ((event: CloseEvent) => void) | null,
    send: t.vi.fn(),
    close: t.vi.fn(),
    addEventListener: t.vi.fn(),
    removeEventListener: t.vi.fn(),
    dispatchEvent: t.vi.fn(),
  };
  return mockWS;
};

t.vi.mock('ws', () => {
  return {
    default: t.vi.fn().mockImplementation(() => createMockWebSocket()),
    WebSocket: t.vi.fn().mockImplementation(() => createMockWebSocket()),
  }
});

// Mock native WebSocket for browser environments
const mockWebSocketConstructor = t.vi.fn().mockImplementation(() => createMockWebSocket());
t.vi.stubGlobal('WebSocket', mockWebSocketConstructor);
