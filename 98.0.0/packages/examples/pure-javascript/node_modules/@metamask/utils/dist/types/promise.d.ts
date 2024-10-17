/**
 * A deferred Promise.
 *
 * A deferred Promise is one that can be resolved or rejected independently of
 * the Promise construction.
 * @template Result - The result type of the Promise.
 */
export declare type DeferredPromise<Result = void> = {
    /**
     * The Promise that has been deferred.
     */
    promise: Promise<Result>;
    /**
     * A function that resolves the Promise.
     */
    resolve: (result: Result) => void;
    /**
     * A function that rejects the Promise.
     */
    reject: (error: unknown) => void;
};
/**
 * Create a defered Promise.
 *
 * @param args - The arguments.
 * @param args.suppressUnhandledRejection - This option adds an empty error handler
 * to the Promise to suppress the UnhandledPromiseRejection error. This can be
 * useful if the deferred Promise is sometimes intentionally not used.
 * @returns A deferred Promise.
 * @template Result - The result type of the Promise.
 */
export declare function createDeferredPromise<Result = void>({ suppressUnhandledRejection, }?: {
    suppressUnhandledRejection?: boolean;
}): DeferredPromise<Result>;
//# sourceMappingURL=promise.d.ts.map