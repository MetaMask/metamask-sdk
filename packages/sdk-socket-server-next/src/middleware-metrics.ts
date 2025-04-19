import {
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {
  setAnalyticsRequestDuration,
  setAnalyticsRequestsTotal,
} from './metrics';

export function evtMetricsMiddleware(
  _req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction,
): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    setAnalyticsRequestsTotal(res.statusCode);
    setAnalyticsRequestDuration(duration);
  });

  next();
}
