import { Chain } from 'wagmi';
declare const IconNetwork: ({ network, size, }: {
    network?: Chain | undefined;
    size?: "big" | "small" | undefined;
}) => JSX.Element;
export default IconNetwork;
