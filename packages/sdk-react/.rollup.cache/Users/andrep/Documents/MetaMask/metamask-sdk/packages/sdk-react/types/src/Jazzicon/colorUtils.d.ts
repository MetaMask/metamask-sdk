declare type HSL = {
    h: number;
    s: number;
    l: number;
};
export declare const colorRotate: (hex: string, degrees: number) => string;
export declare const hexToHSL: (hex: string) => HSL;
export declare const HSLToHex: (hsl: HSL) => string;
export {};
