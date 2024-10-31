import { NextFunction, Request, Response } from 'express';
import {
    setAnalyticsRequestDuration,
    setAnalyticsRequestsTotal,
} from './metrics';

export function evtMetricsMiddleware(
    req: Request,
    res: Response,
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
