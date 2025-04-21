/* eslint-disable import/first */
import crypto from 'crypto';
import dotenv from 'dotenv';
// Dotenv must be loaded before importing local files
dotenv.config();

import Analytics from 'analytics-node';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { createLogger } from './logger';

const IS_DEV = process.env.NODE_ENV === 'development';

const logger = createLogger(IS_DEV);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.disable('x-powered-by');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  // This high limit is effectively unused as rate limiting is primarily handled
  // at the infrastructure level (e.g., Cloudflare). It was retained from a previous configuration.
  max: 20, // limit each IP to max requests per windowMs
  legacyHeaders: false,
});

app.use(limiter);

const analytics = new Analytics(
  IS_DEV ? process.env.SEGMENT_API_KEY_DEBUG || '' : process.env.SEGMENT_API_KEY_PRODUCTION || '',
  {
    flushInterval: IS_DEV ? 1000 : 10000,
    errorHandler: (err: Error) => {
      logger.error(`ERROR> Analytics-node flush failed: ${err}`);
    },
  },
);

app.get('/', (req, res) => {
  if (IS_DEV) {
    logger.info(`health check from`, {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'cf-connecting-ip': req.headers['cf-connecting-ip'],
    });
  }
  res.json({ success: true });
});

app.post('/evt', async (req, res) => {
  try {
    const { body } = req;

    if (!body.event) {
      logger.error(`Event is required`);
      return res.status(400).json({ error: 'event is required' });
    }

    if (!body.event.startsWith('sdk_')) {
      logger.error(`Wrong event name: ${body.event}`);
      return res.status(400).json({ error: 'wrong event name' });
    }

    const toCheckEvents = ['sdk_rpc_request_done', 'sdk_rpc_request'];
    const allowedMethods = [
      'eth_sendTransaction',
      'wallet_switchEthereumChain',
      'personal_sign',
      'eth_signTypedData_v4',
      'wallet_requestPermissions',
      'metamask_connectSign',
    ];

    if (
      toCheckEvents.includes(body.event) &&
      (!body.method || !allowedMethods.includes(body.method))
    ) {
      return res.json({ success: true });
    }

    const channelId: string = body.id || 'sdk';
    let isExtensionEvent = body.from === 'extension';

    if (typeof channelId !== 'string') {
      logger.error(`Received event with invalid channelId: ${channelId}`, body);
      return res.status(400).json({ status: 'error' });
    }

    if (channelId === 'sdk') {
      isExtensionEvent = true;
    }

    logger.debug(
      `Received event /evt channelId=${channelId} isExtensionEvent=${isExtensionEvent}`,
      body,
    );

    const userIdHash = crypto.createHash('sha1').update(channelId).digest('hex');

    const event = {
      userId: userIdHash,
      event: body.event,
      properties: {
        userId: userIdHash,
        ...body.properties,
      },
    };

    if (!event.properties.dappId) {
      const newDappId =
        event.properties.url && event.properties.url !== 'N/A'
          ? event.properties.url
          : event.properties.title || 'N/A';
      event.properties.dappId = newDappId;
      logger.debug(`event: ${event.event} - dappId missing - replacing with '${newDappId}'`, event);
    }

    const propertiesToExclude: string[] = ['icon', 'originationInfo', 'id'];

    for (const property in body) {
      if (
        Object.prototype.hasOwnProperty.call(body, property) &&
        body[property] &&
        !propertiesToExclude.includes(property)
      ) {
        event.properties[property] = body[property];
      }
    }

    if (process.env.EVENTS_DEBUG_LOGS === 'true') {
      logger.debug('Event object:', event);
    }

    analytics.track(event, function (err: Error) {
      if (process.env.EVENTS_DEBUG_LOGS === 'true') {
        logger.info('Segment batch', JSON.stringify({ event }, null, 2));
      } else {
        logger.info('Segment batch', { event });
      }

      if (err) {
        logger.error('Segment error:', err);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  logger.info(`Analytics server listening on port ${port}`);
});

export { app };
