/**
 * Common duration constants, in milliseconds.
 */
export declare enum Duration {
    /**
     * A millisecond.
     */
    Millisecond = 1,
    /**
     * A second, in milliseconds.
     */
    Second = 1000,
    /**
     * A minute, in milliseconds.
     */
    Minute = 60000,
    /**
     * An hour, in milliseconds.
     */
    Hour = 3600000,
    /**
     * A day, in milliseconds.
     */
    Day = 86400000,
    /**
     * A week, in milliseconds.
     */
    Week = 604800000,
    /**
     * A year, in milliseconds.
     */
    Year = 31536000000
}
/**
 * Calculates the millisecond value of the specified number of units of time.
 *
 * @param count - The number of units of time.
 * @param duration - The unit of time to count.
 * @returns The count multiplied by the specified duration.
 */
export declare function inMilliseconds(count: number, duration: Duration): number;
/**
 * Gets the milliseconds since a particular Unix epoch timestamp.
 *
 * @param timestamp - A Unix millisecond timestamp.
 * @returns The number of milliseconds elapsed since the specified timestamp.
 */
export declare function timeSince(timestamp: number): number;
//# sourceMappingURL=time.d.ts.map