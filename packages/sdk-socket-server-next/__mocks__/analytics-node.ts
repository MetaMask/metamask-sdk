class Analytics {
  // rome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(writeKey: string, options?: object) {
    // Mock constructor
  }

  track(_event: string, callback?: (err: Error | null) => void): void {
    // Mock track method
    if (callback) {
      callback(null);
    }
  }
}

export default Analytics;
