import crossFetch from 'cross-fetch';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { OriginatorInfo } from './types/OriginatorInfo';
import { TrackingEvents } from './types/TrackingEvent';
import { logger } from './utils/logger';

export interface AnalyticsProps {
  id: string;
  event: TrackingEvents;
  originationInfo?: OriginatorInfo;
  commLayer?: CommunicationLayerPreference;
  sdkVersion?: string;
  commLayerVersion?: string;
  walletVersion?: string;
  params?: Record<string, unknown>;
}

// Buffer for storing events
let analyticsBuffer: AnalyticsProps[] = [];
let tempBuffer: AnalyticsProps[] = []; // Temporary buffer to hold new events during send operation
let targetUrl: string | undefined;

// Function to safely add events to the buffer
function addToBuffer(event: AnalyticsProps) {
  tempBuffer.push(event);
}

// Function to swap buffers atomically
function swapBuffers() {
  const swap = tempBuffer;
  tempBuffer = analyticsBuffer;
  analyticsBuffer = swap;
}

// Function to send buffered events
async function sendBufferedEvents(parameters: AnalyticsProps) {
  // TODO:  re-enabled once buffered events activated
  // if (!targetUrl || (analyticsBuffer.length === 0 && tempBuffer.length === 0)) {
  //   return;
  // }
  if (!targetUrl || !parameters) {
    return;
  }

  // Atomically swap the buffers
  swapBuffers();

  const serverUrl = targetUrl.endsWith('/')
    ? `${targetUrl}debug`
    : `${targetUrl}/debug`;

  const flatParams: {
    [key: string]: unknown;
  } = { ...parameters, params: undefined };
  // remove params from the event and append each property to the object instead
  if (parameters.params) {
    for (const [key, value] of Object.entries(parameters.params)) {
      flatParams[key] = value;
    }
  }

  const body = JSON.stringify(flatParams);

  logger.RemoteCommunication(
    `[sendBufferedEvents] Sending ${analyticsBuffer.length} analytics events to ${serverUrl}`,
  );

  try {
    const response = await crossFetch(serverUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    const text = await response.text();
    logger.RemoteCommunication(`[sendBufferedEvents] Response: ${text}`);

    // Clear the processed buffer --- operation is atomic and no race condition can happen since we use a separate buffer
    // eslint-disable-next-line require-atomic-updates
    analyticsBuffer.length = 0;
  } catch (error) {
    console.warn(`Error sending analytics`, error);
  }
}

// TODO re-enable whenever we want to activate buffered events and socket code has been updated.
// // Initialize timer to send analytics in batch every 15 seconds
// setInterval(() => {
//   sendBufferedEvents().catch(() => {
//     // ignore errors
//   });
// }, 15000);

// Modified SendAnalytics to add events to buffer instead of sending directly
export const SendAnalytics = async (
  parameters: AnalyticsProps,
  socketServerUrl: string,
) => {
  targetUrl = socketServerUrl;

  // Safely add the analytics event to the buffer
  addToBuffer(parameters);
  sendBufferedEvents(parameters).catch(() => {
    // ignore
  });
};
