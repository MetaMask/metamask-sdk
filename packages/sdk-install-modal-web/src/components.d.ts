/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { TrackingEvents } from "./components/misc/tracking-events";
export { TrackingEvents } from "./components/misc/tracking-events";
export namespace Components {
    interface MmInstallModal {
        /**
          * The QR code link
         */
        "link": string;
        "preferDesktop": boolean;
        "sdkVersion"?: string;
    }
    interface MmPendingModal {
        /**
          * The QR code link
         */
        "displayOTP"?: boolean;
        "otpCode"?: string;
        "sdkVersion"?: string;
    }
    interface MmSelectModal {
        /**
          * The QR code link
         */
        "link": string;
        "preferDesktop": boolean;
        "sdkVersion"?: string;
    }
}
export interface MmInstallModalCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLMmInstallModalElement;
}
export interface MmPendingModalCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLMmPendingModalElement;
}
export interface MmSelectModalCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLMmSelectModalElement;
}
declare global {
    interface HTMLMmInstallModalElementEventMap {
        "close": any;
        "startDesktopOnboarding": any;
        "trackAnalytics": { event: TrackingEvents, params?: Record<string, unknown> };
    }
    interface HTMLMmInstallModalElement extends Components.MmInstallModal, HTMLStencilElement {
        addEventListener<K extends keyof HTMLMmInstallModalElementEventMap>(type: K, listener: (this: HTMLMmInstallModalElement, ev: MmInstallModalCustomEvent<HTMLMmInstallModalElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLMmInstallModalElementEventMap>(type: K, listener: (this: HTMLMmInstallModalElement, ev: MmInstallModalCustomEvent<HTMLMmInstallModalElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLMmInstallModalElement: {
        prototype: HTMLMmInstallModalElement;
        new (): HTMLMmInstallModalElement;
    };
    interface HTMLMmPendingModalElementEventMap {
        "close": any;
        "disconnect": any;
        "updateOTPValue": { otpValue: string };
    }
    interface HTMLMmPendingModalElement extends Components.MmPendingModal, HTMLStencilElement {
        addEventListener<K extends keyof HTMLMmPendingModalElementEventMap>(type: K, listener: (this: HTMLMmPendingModalElement, ev: MmPendingModalCustomEvent<HTMLMmPendingModalElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLMmPendingModalElementEventMap>(type: K, listener: (this: HTMLMmPendingModalElement, ev: MmPendingModalCustomEvent<HTMLMmPendingModalElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLMmPendingModalElement: {
        prototype: HTMLMmPendingModalElement;
        new (): HTMLMmPendingModalElement;
    };
    interface HTMLMmSelectModalElementEventMap {
        "close": { shouldTerminate?: boolean };
        "connectWithExtension": any;
    }
    interface HTMLMmSelectModalElement extends Components.MmSelectModal, HTMLStencilElement {
        addEventListener<K extends keyof HTMLMmSelectModalElementEventMap>(type: K, listener: (this: HTMLMmSelectModalElement, ev: MmSelectModalCustomEvent<HTMLMmSelectModalElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLMmSelectModalElementEventMap>(type: K, listener: (this: HTMLMmSelectModalElement, ev: MmSelectModalCustomEvent<HTMLMmSelectModalElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLMmSelectModalElement: {
        prototype: HTMLMmSelectModalElement;
        new (): HTMLMmSelectModalElement;
    };
    interface HTMLElementTagNameMap {
        "mm-install-modal": HTMLMmInstallModalElement;
        "mm-pending-modal": HTMLMmPendingModalElement;
        "mm-select-modal": HTMLMmSelectModalElement;
    }
}
declare namespace LocalJSX {
    interface MmInstallModal {
        /**
          * The QR code link
         */
        "link"?: string;
        "onClose"?: (event: MmInstallModalCustomEvent<any>) => void;
        "onStartDesktopOnboarding"?: (event: MmInstallModalCustomEvent<any>) => void;
        "onTrackAnalytics"?: (event: MmInstallModalCustomEvent<{ event: TrackingEvents, params?: Record<string, unknown> }>) => void;
        "preferDesktop"?: boolean;
        "sdkVersion"?: string;
    }
    interface MmPendingModal {
        /**
          * The QR code link
         */
        "displayOTP"?: boolean;
        "onClose"?: (event: MmPendingModalCustomEvent<any>) => void;
        "onDisconnect"?: (event: MmPendingModalCustomEvent<any>) => void;
        "onUpdateOTPValue"?: (event: MmPendingModalCustomEvent<{ otpValue: string }>) => void;
        "otpCode"?: string;
        "sdkVersion"?: string;
    }
    interface MmSelectModal {
        /**
          * The QR code link
         */
        "link"?: string;
        "onClose"?: (event: MmSelectModalCustomEvent<{ shouldTerminate?: boolean }>) => void;
        "onConnectWithExtension"?: (event: MmSelectModalCustomEvent<any>) => void;
        "preferDesktop"?: boolean;
        "sdkVersion"?: string;
    }
    interface IntrinsicElements {
        "mm-install-modal": MmInstallModal;
        "mm-pending-modal": MmPendingModal;
        "mm-select-modal": MmSelectModal;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "mm-install-modal": LocalJSX.MmInstallModal & JSXBase.HTMLAttributes<HTMLMmInstallModalElement>;
            "mm-pending-modal": LocalJSX.MmPendingModal & JSXBase.HTMLAttributes<HTMLMmPendingModalElement>;
            "mm-select-modal": LocalJSX.MmSelectModal & JSXBase.HTMLAttributes<HTMLMmSelectModalElement>;
        }
    }
}
