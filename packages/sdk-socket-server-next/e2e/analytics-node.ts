class Analytics {
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
