//
//  EthereumRequestObjC.h
//  MetaMaskNativeSDK
//
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface EthereumRequestObjC : NSObject

@property (nonatomic, strong) NSString *method;
@property (nonatomic, strong) id params;

- (instancetype)initWithDictionary:(NSDictionary *)dictionary;

@end

