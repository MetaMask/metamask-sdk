declare const brand: unique symbol;
export declare type Opaque<Base, Brand extends symbol> = Base & {
    [brand]: Brand;
};
export {};
//# sourceMappingURL=opaque.d.ts.map