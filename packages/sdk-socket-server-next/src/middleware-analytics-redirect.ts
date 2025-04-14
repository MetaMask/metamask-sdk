import { Request, Response, NextFunction } from 'express';
import { analyticsServerUrl } from './config';
import { getLogger } from './logger';

const logger = getLogger();

export const analyticsRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/evt' || req.path === '/debug') {
    const targetUrl = `${analyticsServerUrl}${req.path}`;
    logger.debug(`Redirecting analytics request to ${targetUrl}`);
    return res.redirect(307, targetUrl);
  }
  next();
}; 