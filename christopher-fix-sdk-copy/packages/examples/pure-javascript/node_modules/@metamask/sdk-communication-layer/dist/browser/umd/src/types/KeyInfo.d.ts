export interface KeyInfo {
    step: string;
    ecies: {
        public: string;
        private: string;
        otherPubKey?: string;
    };
    keysExchanged: boolean;
}
//# sourceMappingURL=KeyInfo.d.ts.map