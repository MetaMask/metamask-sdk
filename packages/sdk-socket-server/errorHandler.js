const ErrorCategories = {
  RATE_LIMIT: 'Rate Limit',
  VALIDATION: 'Validation',
  SERVER: 'Server',
  MESSAGE: 'Message',
  PING: 'Ping',
};

function emitError(socket, eventId, message, category) {
  const errorPayload = {
    category,
    message,
  };

  socket.emit(`error-${eventId}`, errorPayload);
}

module.exports = {
  ErrorCategories,
  emitError,
};
