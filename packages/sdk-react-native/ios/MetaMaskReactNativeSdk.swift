//
//  MetaMaskSDKWrapper.swift
//  MetaMaskReactNativeSdk
//

import Foundation
import React
import metamask_ios_sdk

@objc(MetaMaskReactNativeSdk)
class MetaMaskReactNativeSdk: NSObject, RCTBridgeModule {
  private var metaMaskSDK: MetaMaskSDK!

  static func moduleName() -> String! {
      return "MetaMaskReactNativeSdk"
  }

  static func requiresMainQueueSetup() -> Bool {
      return true
  }

  @objc func initialize(_ options: Options) {
    metaMaskSDK = MetaMaskSDK.shared(
      AppMetadata(
        name: options.dappName,
        url: options.dappUrl,
        iconUrl: options.dappIconUrl),
      transport: !options.dappScheme.isEmpty
      ? .deeplinking(dappScheme: options.dappScheme)
      : .socket,
      sdkOptions: !options.infuraAPIKey.isEmpty
      ? SDKOptions(infuraAPIKey: options.infuraAPIKey)
      : nil
    )
  }

  @objc func disconnect(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      resolve(metaMaskSDK.disconnect())
  }

  @objc func clearSession(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      resolve(metaMaskSDK.clearSession())
  }

  @objc func handleDeepLink(_ url: String) {
    guard let url = URL(string: url) else {
      return
    }
    metaMaskSDK.handleUrl(url)
  }

  @objc func chainId(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve(metaMaskSDK.chainId)
  }

  @objc func selectedAddress(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve(metaMaskSDK.account)
  }

  @objc func connect(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard metaMaskSDK != nil else {
      let error = RequestError(from: [
        "code": -101,
        "message": "SDK not initialised. Call initialize first."
    ])
      reject("ERROR_CONNECT", error.message, error)
      return
    }

    Task {
      let result = await metaMaskSDK.connect()

      switch result {
      case .success(let account):
        resolve(account)
        return
      case .failure(let error):
        reject("ERROR_CONNECT", error.localizedDescription, error)
        return
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

  @objc func connectWith(_ request: EthereumRequestObjC, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {

        let jsonData = try JSONSerialization.data(withJSONObject: request.params, options: [])
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

  @objc func request(_ ethRequest: EthereumRequestObjC, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        let jsonData = try JSONSerialization.data(withJSONObject: ethRequest.params, options: [])

        let ethereumRequest = EthereumRequest(
                            method: ethRequest.method,
                            params: jsonData
                        )
        let result = await metaMaskSDK?.request(ethereumRequest)

        switch result {
        case .success(let response):
          resolve(response)
        case .failure(let error):
          reject("ERROR_Request", error.localizedDescription, error)
        default:
          reject("ERROR_Request", "Something went wrong", nil)
        }
      } catch {
          let error = NSError(domain: "ERROR_Request", code: 500, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject("ERROR_Request", error.localizedDescription, error)
      }
    }
  }

    @objc func batchRequest(_ ethRequests: [EthereumRequestObjC], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      Task {
        var batchRequest: [EthereumRequest<Data>] = []

        for ethRequest in ethRequests {
          do {
            let jsonData = try JSONSerialization.data(withJSONObject: ethRequest.params, options: [])
            let ethereumRequest = EthereumRequest(
                                method: ethRequest.method,
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
