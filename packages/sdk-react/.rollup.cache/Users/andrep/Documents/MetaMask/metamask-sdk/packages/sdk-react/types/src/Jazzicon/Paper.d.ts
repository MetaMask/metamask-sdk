declare type PaperProps = {
    children: any;
    color: string;
    diameter: number;
    style: object;
};
declare const Paper: ({ children, color, diameter, style: styleOverrides, }: PaperProps) => JSX.Element;
export default Paper;
