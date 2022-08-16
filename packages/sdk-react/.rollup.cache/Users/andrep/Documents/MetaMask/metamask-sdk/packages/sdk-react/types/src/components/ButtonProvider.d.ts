import { Theme } from "./theme";
export declare const ConnectButton: ({ chainId, chainDisplayName, theme }: {
    chainId?: number | undefined;
    chainDisplayName?: string | undefined;
    theme?: "base" | "dark" | "w3fs" | "midnight" | "elegant" | undefined;
}) => JSX.Element;
export declare const useDesiredChainId: () => string | number;
export declare const useDesiredChainDisplayName: () => string;
export declare const useTheme: () => {
    header: string;
    text: string;
    button: string;
    connectedPill: string;
    notConnectedPill: string;
    loadingPill: string;
    connectPill: string;
    modal: string;
} | {
    header: string;
    text: string;
    button: string;
    connectedPill: string;
    loadingPill: string;
    connectPill: string;
    notConnectedPill: string;
    modal: string;
} | {
    header: string;
    text: string;
    button: string;
    connectedPill: string;
    loadingPill: string;
    connectPill: string;
    notConnectedPill: string;
    modal: string;
} | {
    header: string;
    text: string;
    button: string;
    connectedPill: string;
    notConnectedPill: string;
    loadingPill: string;
    connectPill: string;
    modal: string;
} | {
    header: string;
    text: string;
    button: string;
    connectedPill: string;
    loadingPill: string;
    connectPill: string;
    notConnectedPill: string;
    modal: string;
};
