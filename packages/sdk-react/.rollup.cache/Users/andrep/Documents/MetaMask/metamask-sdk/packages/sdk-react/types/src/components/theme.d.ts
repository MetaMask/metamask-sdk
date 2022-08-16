export declare type ThemeComponentNames = "header" | "text" | "button" | "connectedPill" | "notConnectedPill" | "loadingPill" | "connectPill" | "modal";
export declare type ThemeComponents = Record<ThemeComponentNames, string>;
export declare const themeMap: {
    base: {
        header: string;
        text: string;
        button: string;
        connectedPill: string;
        notConnectedPill: string;
        loadingPill: string;
        connectPill: string;
        modal: string;
    };
    dark: {
        header: string;
        text: string;
        button: string;
        connectedPill: string;
        loadingPill: string;
        connectPill: string;
        notConnectedPill: string;
        modal: string;
    };
    w3fs: {
        header: string;
        text: string;
        button: string;
        connectedPill: string;
        loadingPill: string;
        connectPill: string;
        notConnectedPill: string;
        modal: string;
    };
    midnight: {
        header: string;
        text: string;
        button: string;
        connectedPill: string;
        notConnectedPill: string;
        loadingPill: string;
        connectPill: string;
        modal: string;
    };
    elegant: {
        header: string;
        text: string;
        button: string;
        connectedPill: string;
        loadingPill: string;
        connectPill: string;
        notConnectedPill: string;
        modal: string;
    };
};
export declare type Theme = keyof typeof themeMap;
