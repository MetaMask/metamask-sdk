import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { analyticsServerUrl } from './config';
import { getLogger } from './logger';

const logger = getLogger();

export const analyticsRedirectMiddleware = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction,
): void => {
  if (req.path === '/evt' || req.path === '/debug') {
    const targetUrl = `${analyticsServerUrl}${req.path}`;
    logger.debug(`Redirecting analytics request to ${targetUrl}`);
    return res.redirect(307, targetUrl);
  }
  return next();
};
