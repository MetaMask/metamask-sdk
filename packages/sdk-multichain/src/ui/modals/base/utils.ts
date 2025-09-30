export function formatRemainingTime(milliseconds: number): string {
	if (milliseconds <= 0) return 'EXPIRED';
	const seconds = Math.floor(milliseconds / 1000);
	return `${seconds}s`;
}

export function shouldLogCountdown(remainingSeconds: number): boolean {
	// Log at specific intervals to avoid spam
	if (remainingSeconds <= 10) {
		// Log every second for the last 10 seconds
		return true;
	} else if (remainingSeconds <= 30) {
		// Log every 5 seconds for the last 30 seconds
		return remainingSeconds % 5 === 0;
	} else if (remainingSeconds <= 60) {
		// Log every 10 seconds for the last minute
		return remainingSeconds % 10 === 0;
	} else if (remainingSeconds <= 300) {
		// Log every 30 seconds for the last 5 minutes
		return remainingSeconds % 30 === 0;
	} else {
		// Log every minute for longer durations
		return remainingSeconds % 60 === 0;
	}
}
