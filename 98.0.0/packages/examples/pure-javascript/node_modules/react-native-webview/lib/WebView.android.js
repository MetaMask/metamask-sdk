var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Image, View, NativeModules, } from 'react-native';
import BatchedBridge from 'react-native/Libraries/BatchedBridge/BatchedBridge';
// @ts-expect-error react-native doesn't have this type
import codegenNativeCommandsUntyped from 'react-native/Libraries/Utilities/codegenNativeCommands';
import invariant from 'invariant';
import RNCWebView from "./WebViewNativeComponent.android";
import { defaultOriginWhitelist, defaultRenderError, defaultRenderLoading, useWebWiewLogic, } from './WebViewShared';
import styles from './WebView.styles';
var codegenNativeCommands = codegenNativeCommandsUntyped;
var Commands = codegenNativeCommands({
    supportedCommands: ['goBack', 'goForward', 'reload', 'stopLoading', 'injectJavaScript', 'requestFocus', 'postMessage', 'clearFormData', 'clearCache', 'clearHistory', 'loadUrl']
});
var resolveAssetSource = Image.resolveAssetSource;
/**
 * A simple counter to uniquely identify WebView instances. Do not use this for anything else.
 */
var uniqueRef = 0;
var WebViewComponent = forwardRef(function (_a, ref) {
    var _b = _a.overScrollMode, overScrollMode = _b === void 0 ? 'always' : _b, _c = _a.javaScriptEnabled, javaScriptEnabled = _c === void 0 ? true : _c, _d = _a.thirdPartyCookiesEnabled, thirdPartyCookiesEnabled = _d === void 0 ? true : _d, _e = _a.scalesPageToFit, scalesPageToFit = _e === void 0 ? true : _e, _f = _a.allowsFullscreenVideo, allowsFullscreenVideo = _f === void 0 ? false : _f, _g = _a.allowFileAccess, allowFileAccess = _g === void 0 ? false : _g, _h = _a.saveFormDataDisabled, saveFormDataDisabled = _h === void 0 ? false : _h, _j = _a.cacheEnabled, cacheEnabled = _j === void 0 ? true : _j, _k = _a.androidHardwareAccelerationDisabled, androidHardwareAccelerationDisabled = _k === void 0 ? false : _k, _l = _a.androidLayerType, androidLayerType = _l === void 0 ? "none" : _l, _m = _a.originWhitelist, originWhitelist = _m === void 0 ? defaultOriginWhitelist : _m, _o = _a.setSupportMultipleWindows, setSupportMultipleWindows = _o === void 0 ? true : _o, _p = _a.setBuiltInZoomControls, setBuiltInZoomControls = _p === void 0 ? true : _p, _q = _a.setDisplayZoomControls, setDisplayZoomControls = _q === void 0 ? false : _q, _r = _a.nestedScrollEnabled, nestedScrollEnabled = _r === void 0 ? false : _r, startInLoadingState = _a.startInLoadingState, onNavigationStateChange = _a.onNavigationStateChange, onLoadStart = _a.onLoadStart, onError = _a.onError, onLoad = _a.onLoad, onLoadEnd = _a.onLoadEnd, onLoadProgress = _a.onLoadProgress, onHttpErrorProp = _a.onHttpError, onRenderProcessGoneProp = _a.onRenderProcessGone, onMessageProp = _a.onMessage, renderLoading = _a.renderLoading, renderError = _a.renderError, style = _a.style, containerStyle = _a.containerStyle, source = _a.source, nativeConfig = _a.nativeConfig, onShouldStartLoadWithRequestProp = _a.onShouldStartLoadWithRequest, otherProps = __rest(_a, ["overScrollMode", "javaScriptEnabled", "thirdPartyCookiesEnabled", "scalesPageToFit", "allowsFullscreenVideo", "allowFileAccess", "saveFormDataDisabled", "cacheEnabled", "androidHardwareAccelerationDisabled", "androidLayerType", "originWhitelist", "setSupportMultipleWindows", "setBuiltInZoomControls", "setDisplayZoomControls", "nestedScrollEnabled", "startInLoadingState", "onNavigationStateChange", "onLoadStart", "onError", "onLoad", "onLoadEnd", "onLoadProgress", "onHttpError", "onRenderProcessGone", "onMessage", "renderLoading", "renderError", "style", "containerStyle", "source", "nativeConfig", "onShouldStartLoadWithRequest"]);
    var messagingModuleName = useRef("WebViewMessageHandler".concat(uniqueRef += 1)).current;
    var webViewRef = useRef(null);
    var onShouldStartLoadWithRequestCallback = useCallback(function (shouldStart, url, lockIdentifier) {
        if (lockIdentifier) {
            NativeModules.RNCWebView.onShouldStartLoadWithRequestCallback(shouldStart, lockIdentifier);
        }
        else if (shouldStart) {
            Commands.loadUrl(webViewRef.current, url);
        }
    }, []);
    var _s = useWebWiewLogic({
        onNavigationStateChange: onNavigationStateChange,
        onLoad: onLoad,
        onError: onError,
        onHttpErrorProp: onHttpErrorProp,
        onLoadEnd: onLoadEnd,
        onLoadProgress: onLoadProgress,
        onLoadStart: onLoadStart,
        onRenderProcessGoneProp: onRenderProcessGoneProp,
        onMessageProp: onMessageProp,
        startInLoadingState: startInLoadingState,
        originWhitelist: originWhitelist,
        onShouldStartLoadWithRequestProp: onShouldStartLoadWithRequestProp,
        onShouldStartLoadWithRequestCallback: onShouldStartLoadWithRequestCallback
    }), onLoadingStart = _s.onLoadingStart, onShouldStartLoadWithRequest = _s.onShouldStartLoadWithRequest, onMessage = _s.onMessage, viewState = _s.viewState, setViewState = _s.setViewState, lastErrorEvent = _s.lastErrorEvent, onHttpError = _s.onHttpError, onLoadingError = _s.onLoadingError, onLoadingFinish = _s.onLoadingFinish, onLoadingProgress = _s.onLoadingProgress, onRenderProcessGone = _s.onRenderProcessGone;
    useImperativeHandle(ref, function () { return ({
        goForward: function () { return Commands.goForward(webViewRef.current); },
        goBack: function () { return Commands.goBack(webViewRef.current); },
        reload: function () {
            setViewState('LOADING');
            Commands.reload(webViewRef.current);
        },
        stopLoading: function () { return Commands.stopLoading(webViewRef.current); },
        postMessage: function (data) { return Commands.postMessage(webViewRef.current, data); },
        injectJavaScript: function (data) { return Commands.injectJavaScript(webViewRef.current, data); },
        requestFocus: function () { return Commands.requestFocus(webViewRef.current); },
        clearFormData: function () { return Commands.clearFormData(webViewRef.current); },
        clearCache: function (includeDiskFiles) { return Commands.clearCache(webViewRef.current, includeDiskFiles); },
        clearHistory: function () { return Commands.clearHistory(webViewRef.current); }
    }); }, [setViewState, webViewRef]);
    var directEventCallbacks = useMemo(function () { return ({
        onShouldStartLoadWithRequest: onShouldStartLoadWithRequest,
        onMessage: onMessage
    }); }, [onMessage, onShouldStartLoadWithRequest]);
    useEffect(function () {
        BatchedBridge.registerCallableModule(messagingModuleName, directEventCallbacks);
    }, [messagingModuleName, directEventCallbacks]);
    var otherView = null;
    if (viewState === 'LOADING') {
        otherView = (renderLoading || defaultRenderLoading)();
    }
    else if (viewState === 'ERROR') {
        invariant(lastErrorEvent != null, 'lastErrorEvent expected to be non-null');
        otherView = (renderError || defaultRenderError)(lastErrorEvent.domain, lastErrorEvent.code, lastErrorEvent.description);
    }
    else if (viewState !== 'IDLE') {
        console.error("RNCWebView invalid state encountered: ".concat(viewState));
    }
    var webViewStyles = [styles.container, styles.webView, style];
    var webViewContainerStyle = [styles.container, containerStyle];
    if (typeof source !== "number" && source && 'method' in source) {
        if (source.method === 'POST' && source.headers) {
            console.warn('WebView: `source.headers` is not supported when using POST.');
        }
        else if (source.method === 'GET' && source.body) {
            console.warn('WebView: `source.body` is not supported when using GET.');
        }
    }
    var NativeWebView = (nativeConfig === null || nativeConfig === void 0 ? void 0 : nativeConfig.component) || RNCWebView;
    var webView = <NativeWebView key="webViewKey" {...otherProps} messagingEnabled={typeof onMessageProp === 'function'} messagingModuleName={messagingModuleName} onLoadingError={onLoadingError} onLoadingFinish={onLoadingFinish} onLoadingProgress={onLoadingProgress} onLoadingStart={onLoadingStart} onHttpError={onHttpError} onRenderProcessGone={onRenderProcessGone} onMessage={onMessage} onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} ref={webViewRef} 
    // TODO: find a better way to type this.
    source={resolveAssetSource(source)} style={webViewStyles} overScrollMode={overScrollMode} javaScriptEnabled={javaScriptEnabled} thirdPartyCookiesEnabled={thirdPartyCookiesEnabled} scalesPageToFit={scalesPageToFit} allowsFullscreenVideo={allowsFullscreenVideo} allowFileAccess={allowFileAccess} saveFormDataDisabled={saveFormDataDisabled} cacheEnabled={cacheEnabled} androidHardwareAccelerationDisabled={androidHardwareAccelerationDisabled} androidLayerType={androidLayerType} setSupportMultipleWindows={setSupportMultipleWindows} setBuiltInZoomControls={setBuiltInZoomControls} setDisplayZoomControls={setDisplayZoomControls} nestedScrollEnabled={nestedScrollEnabled} {...nativeConfig === null || nativeConfig === void 0 ? void 0 : nativeConfig.props}/>;
    return (<View style={webViewContainerStyle}>
      {webView}
      {otherView}
    </View>);
});
// native implementation should return "true" only for Android 5+
var isFileUploadSupported = NativeModules.RNCWebView.isFileUploadSupported();
var WebView = Object.assign(WebViewComponent, { isFileUploadSupported: isFileUploadSupported });
export default WebView;
