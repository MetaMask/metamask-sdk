import * as React from "react";
import MersenneTwister from "mersenne-twister";
declare type JazziconProps = {
    diameter?: number;
    paperStyles?: object;
    seed?: number;
    svgStyles?: object;
};
declare type Colors = Array<string>;
export default class Jazzicon extends React.PureComponent<JazziconProps> {
    generator: MersenneTwister;
    props: JazziconProps;
    genColor: (colors: Colors) => string;
    hueShift: (colors: Colors, generator: MersenneTwister) => Array<string>;
    genShape: (remainingColors: Colors, diameter: number, i: number, total: number) => JSX.Element;
    render(): JSX.Element;
}
export {};
