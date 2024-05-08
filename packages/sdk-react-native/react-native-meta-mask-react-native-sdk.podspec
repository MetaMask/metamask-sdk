# react-native-meta-mask-react-native-sdk.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-meta-mask-react-native-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-meta-mask-react-native-sdk
                   DESC
  s.homepage     = "https://github.com/MetaMask/metamask-ios-sdk"
  # brief license entry:
  s.license      = { :type => 'Copyright ConsenSys Software Inc. 2022. All rights reserved.', :file => 'LICENSE' }
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "MetaMask" => "sdk@metamask.io" }
  s.platforms    = { :ios => "15.0" }
  s.source       = { :git => "https://github.com/MetaMask/metamask-ios-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React"
  # ...
  # s.dependency "..."
end

