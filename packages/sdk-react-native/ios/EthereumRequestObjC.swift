//
//  EthereumRequestObjC.swift
//  MetaMaskNativeSDK
//

import Foundation
import metamask_ios_sdk

@objc class EthereumRequestObjC: NSObject {
  var method: String
  var params: Any

  @objc init(method: String, params: Any) {
      self.method = method
      self.params = params
  }
}
