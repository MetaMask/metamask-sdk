import winston from 'winston';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    isDevelopment ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(),
    // You can also add file transport or any other transport here
  ],
});
