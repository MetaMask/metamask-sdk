//
//  MetaMaskReactNativeSdk.swift
//  MetaMaskReactNativeSdk
//

import Foundation
import React
import metamask_ios_sdk

@objc(MetaMaskReactNativeSdk)
class MetaMaskReactNativeSdk: RCTEventEmitter {

  private var metaMaskSDK: MetaMaskSDK?
  private var hasListeners = false
    
  override init() {
      super.init()

      // Observe the account change notification
      NotificationCenter.default.addObserver(
          self,
          selector: #selector(handleAccountChanged(_:)),
          name: .MetaMaskAccountChanged,
          object: nil
      )
      
      // Observe the chainId change notification
      NotificationCenter.default.addObserver(
          self,
          selector: #selector(handleChainIdChanged(_:)),
          name: .MetaMaskChainIdChanged,
          object: nil
      )
  }

  deinit {
      // Remove the observers when the instance is deallocated
      NotificationCenter.default.removeObserver(self, name: .MetaMaskAccountChanged, object: nil)
      NotificationCenter.default.removeObserver(self, name: .MetaMaskChainIdChanged, object: nil)
  }  

  override static func moduleName() -> String! {
    return "MetaMaskReactNativeSdk"
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
    
  override func startObserving() {
      hasListeners = true
  }
  
  override func stopObserving() {
      hasListeners = false
  }

  // Required method to tell React Native which events are supported
  override func supportedEvents() -> [String]! {
      return ["onAccountChanged", "onChainIdChanged"]
  }
    
  // Handle the account change
  @objc private func handleAccountChanged(_ notification: Notification) {
      guard let account = notification.userInfo?["account"] as? String else { return }
      sendEvent("onAccountChanged", payload: ["account": account])
  }

  // Handle the chainId change
  @objc private func handleChainIdChanged(_ notification: Notification) {
      guard let chainId = notification.userInfo?["chainId"] as? String else { return }
      sendEvent("onChainIdChanged", payload: ["chainId": chainId])
  }
  
  private func sendEvent(_ event: String, payload: [String: Any]) {
      // Emit the event to the JavaScript side
      guard hasListeners else { return }
      sendEvent(withName: event, body: payload)
  }

  @objc func initialize(_ options: [String: Any]) {
    Logging.log("MetaMaskReactNativeSdk:: initializing with: \(options)")

    guard let options = Options(dictionary: options) else {
      Logging.error("MetaMaskReactNativeSdk:: initialize options undefined")
      return
    }

    let transport: Transport

    if let dappScheme = options.dappScheme {
      transport = .deeplinking(dappScheme: dappScheme)
    } else {
      transport = .socket
    }

    var sdkOptions: SDKOptions?

    if let infuraAPIKey = options.infuraAPIKey {
      sdkOptions = SDKOptions(infuraAPIKey: infuraAPIKey)
    }

    metaMaskSDK = MetaMaskSDK.shared(
      AppMetadata(
        name: options.dappName,
        url: options.dappUrl,
        iconUrl: options.dappIconUrl,
        apiVersion: options.apiVersion),
      transport: transport,
      sdkOptions: sdkOptions
    )
  }

  @objc func disconnect(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    metaMaskSDK?.disconnect()
    resolve(true)
  }
   @objc func clearSession(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      metaMaskSDK?.clearSession()
      resolve(true)
  }

  @objc func handleDeepLink(_ url: String) {
    guard let url = URL(string: url) else {
      return
    }
    metaMaskSDK?.handleUrl(url)
  }

  @objc func chainId(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve(metaMaskSDK?.chainId)
  }

  @objc func selectedAddress(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve(metaMaskSDK?.account)
  }

  @objc func connect(_ resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {

    Task {
      let result = await metaMaskSDK?.connect()

      switch result {
      case .success(let accounts):
        resolve(accounts)
        return
      case .failure(let error):
        reject("ERROR_CONNECT", error.localizedDescription, error)
        return
      default:
        reject("ERROR_CONNECT", "Something went wrong", nil)
      }
    }
  }

  @objc func connectAndSign(_ message: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    Task {
      let result = await metaMaskSDK?.connectAndSign(message: message)

      switch result {
      case .success(let response):
        resolve(response)
      case .failure(let error):
        reject("ERROR_CONNECT_SIGN", error.localizedDescription, error)
      default:
        reject("ERROR_CONNECT_SIGN", "Something went wrong", nil)
      }
    }
  }

  @objc func connectWith(_ request: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

    guard let request = EthereumRequestObjC(dictionary: request) else {
      let error = NSError(domain: "ERROR_CONNECT_WITH", code: 500, userInfo: [NSLocalizedDescriptionKey: "ConnectWith method received undefined request"])
      reject("ERROR_CONNECT_WITH", error.localizedDescription, error)
      return
    }

    Logging.log("MetaMaskReactNativeSdk:: connectWith with: \(request)")

    Task {
      do {
        let jsonData = try JSONSerialization.data(withJSONObject: request.params as Any, options: [])
        let ethereumRequest = EthereumRequest(
                            method: request.method,
                            params: jsonData
                        )
        let result = await metaMaskSDK?.connectWith(ethereumRequest)

        switch result {
        case .success(let response):
          resolve(response)
        case .failure(let error):
          reject("ERROR_CONNECT_WITH", error.localizedDescription, error)
        default:
          reject("ERROR_CONNECT_WITH", "Something went wrong", nil)
        }
      } catch {
          let error = NSError(domain: "ERROR_CONNECT_WITH", code: 500, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject("ERROR_CONNECT_WITH", error.localizedDescription, error)
      }
    }
  }

  @objc func request(_ ethRequest: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

    guard
      let method = ethRequest["method"] as? String,
      let params = ethRequest["params"] else {
      let error = NSError(domain: "ERROR_REQUEST", code: 500, userInfo: [NSLocalizedDescriptionKey: "Request method received undefined request"])
      reject("ERROR_REQUEST", error.localizedDescription, error)
      return
    }

    Task {
      do {
        let jsonData = try JSONSerialization.data(withJSONObject: params, options: [])

        let ethereumRequest = EthereumRequest(
                            method: method,
                            params: jsonData
                        )
        let result = await metaMaskSDK?.request(ethereumRequest)

        switch result {
        case .success(let response):
          resolve(response)
        case .failure(let error):
          reject("ERROR_REQUEST", error.localizedDescription, error)
        default:
          reject("ERROR_REQUEST", "Something went wrong", nil)
        }
      } catch {
          let error = NSError(domain: "ERROR_REQUEST", code: 500, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject("ERROR_REQUEST", error.localizedDescription, error)
      }
    }
  }

  @objc func batchRequest(_ ethRequests: [[String: Any]], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

    let requests: [EthereumRequestObjC] = ethRequests.compactMap { EthereumRequestObjC(dictionary: $0) }

    guard !requests.isEmpty else {
      Logging.error("MetaMaskReactNativeSdk:: batchRequest request undefined")
      return
    }

    Logging.log("MetaMaskReactNativeSdk:: batch sign with: \(ethRequests)")

      Task {
        var batchRequest: [EthereumRequest<Data>] = []

        for request in requests {
          do {
            let jsonData = try JSONSerialization.data(withJSONObject: request.params as Any, options: [])
            let ethereumRequest = EthereumRequest(
                                method: request.method,
                                params: jsonData
                            )
            batchRequest.append(ethereumRequest)
          } catch {
            let error = NSError(domain: "ERROR_BATCH_REQUEST", code: 500, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
            reject("ERROR_BATCH_REQUEST", error.localizedDescription, error)
          }
        }

        let result = await metaMaskSDK?.batchRequest(batchRequest)

        switch result {
        case .success(let response):
          resolve(response)
        case .failure(let error):
          reject("ERROR_BATCH_REQUEST", error.localizedDescription, error)
        default:
          reject("ERROR_BATCH_REQUEST", "Something went wrong", nil)
        }
      }
    }
}