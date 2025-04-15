import winston, { format } from 'winston';

const customFormat = format.printf((ti) => {
  const { level, message, timestamp } = ti;
  const args = ti[Symbol.for('splat')] as unknown[];

  const color = {
    info: '\x1b[36m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    debug: '\x1b[32m',
  };

  // add color to the level of the log
  // let msg = `${timestamp} [${level}] : `;
  let printTsLevel = level;
  if (color[level as keyof typeof color]) {
    printTsLevel = `${
      color[level as keyof typeof color]
    }${timestamp} [${level}]\x1b[0m`;
  }
  let msg = `${printTsLevel}: `;

  const extras =
    args
      ?.map((arg: unknown) => {
        if (typeof arg === 'object' && arg !== null) {
          return JSON.stringify(args);
        }
        return arg;
      })
      .join(' ') ?? '';

  const searchContext = message as string;
  if (searchContext.indexOf('wallet') !== -1) {
    msg += `\x1b[36m${message} ${extras}\x1b[0m`;
    // eslint-disable-next-line no-negated-condition
  } else if (searchContext.indexOf('dapp') !== -1) {
    msg += `\x1b[35m${message} ${extras}\x1b[0m`;
  } else {
    msg += `${message} ${extras}`;
  }
  return msg;
});

// Create a function to initialize the logger
export function createLogger(isDevelopment: boolean) {
  return winston.createLogger({
    level: isDevelopment ? 'debug' : 'warn',
    format: isDevelopment
      ? winston.format.combine(winston.format.timestamp(), customFormat)
      : winston.format.json(),
    transports: [
      new winston.transports.Console(),
      // You can also add file transport or any other transport here
    ],
  });
}

let _logger: winston.Logger;

export function getLogger(): winston.Logger {
  return _logger;
}

export function setLogger(newLogger: winston.Logger): void {
  _logger = newLogger;
}
