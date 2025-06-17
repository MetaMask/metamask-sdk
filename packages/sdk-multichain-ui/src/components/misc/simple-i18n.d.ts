interface I18nInstance {
    t: (key: string) => string;
    init: (config: {
        fallbackLng: string;
    }) => Promise<void>;
}
export declare class SimpleI18n implements I18nInstance {
    private translations;
    private supportedLocales;
    private baseUrl;
    constructor(config?: {
        baseUrl?: string;
    });
    private getBrowserLanguage;
    init(config: {
        fallbackLng: string;
    }): Promise<void>;
    loadTranslations(locale: string): Promise<void>;
    t(key: string): string;
    private getNestedTranslation;
}
export {};
//# sourceMappingURL=simple-i18n.d.ts.map