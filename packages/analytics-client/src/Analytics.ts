import crossFetch from 'cross-fetch';
import { type OriginatorInfo, TrackingEvent } from '@metamask/sdk-types'; // Use types package

// Changed to type as per lint rule
export type AnalyticsProps = {
  id: string;
  event: TrackingEvent; // Reverted back to enum type
  originatorInfo?: OriginatorInfo; // Now uses local type
  // commLayer?: CommunicationLayerPreference; // Removed prop
  sdkVersion?: string;
  commLayerVersion?: string;
  walletVersion?: string;
  params?: Record<string, unknown>;
};

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
    ? `${targetUrl}evt`
    : `${targetUrl}/evt`;

  const flatParams: {
    [key: string]: unknown;
  } = { ...parameters };
  delete flatParams.params;

  // remove params from the event and append each property to the object instead
  if (parameters.params) {
    for (const [key, value] of Object.entries(parameters.params)) {
      flatParams[key] = value;
    }
  }

  const body = JSON.stringify(flatParams);

  try {
    const response = await crossFetch(serverUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    // Check if the request was successful before clearing the buffer
    if (!response.ok) {
      // Log a warning if the request failed
      console.warn(
        `[Analytics] Failed to send analytics event: ${response.status} ${response.statusText}`,
      );
      // Optionally, handle the error differently, e.g., retry or log more details
      // For now, we proceed to clear the buffer even on failure to prevent buildup
    }

    // Clear the processed buffer --- operation is atomic and no race condition can happen since we use a separate buffer
    // eslint-disable-next-line require-atomic-updates
    analyticsBuffer.length = 0;
  } catch (error) {
    // console.warn is kept as a basic logging mechanism for now
    console.warn(`[Analytics] Error sending analytics`, error);
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
  analyticsServerUrl: string,
) => {
  targetUrl = analyticsServerUrl;

  // Safely add the analytics event to the buffer
  addToBuffer(parameters);
  sendBufferedEvents(parameters).catch(() => {
    // ignore
  });
};
