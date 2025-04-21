import winston from 'winston';

export const createLogger = (isDevelopment: boolean) => {
  return winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
    ],
  });
};
