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
        iconUrl: options.dappIconUrl),
      transport: transport,
      sdkOptions: sdkOptions
    )
  }
  
  @objc func disconnect(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      resolve(metaMaskSDK.disconnect())
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
                     reject: @escaping RCTPromiseRejectBlock) {
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
    
    guard let request = EthereumRequestObjC(dictionary: ethRequest) else {
      let error = NSError(domain: "ERROR_REQUEST", code: 500, userInfo: [NSLocalizedDescriptionKey: "Request method received undefined request"])
      reject("ERROR_REQUEST", error.localizedDescription, error)
      return
    }
    
    Task {
      do {
        let jsonData = try JSONSerialization.data(withJSONObject: request.params as Any, options: [])
        
        let ethereumRequest = EthereumRequest(
                            method: request.method,
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
