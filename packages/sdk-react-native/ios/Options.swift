//
//  Metadata.swift
//  MetaMaskReactNativeSdk
//

import Foundation

@objc class Options: NSObject {
  let dappName: String
  let dappUrl: String
  let dappIconUrl: String
  let dappScheme: String
  let infuraAPIKey: String

  @objc init(dappName: String, dappUrl: String, dappIconUrl: String, dappScheme: String, infuraAPIKey: String) {
    self.dappName = dappName
    self.dappUrl = dappUrl
    self.dappIconUrl = dappIconUrl
    self.dappScheme = dappScheme
    self.infuraAPIKey = infuraAPIKey
    super.init()
  }
}
