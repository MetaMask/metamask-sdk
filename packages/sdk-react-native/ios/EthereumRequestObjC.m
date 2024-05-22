//
//  EthereumRequestObjC.m
//  MetaMaskNativeSDK
//

#import <Foundation/Foundation.h>
#import <React/RCTConvert.h>
#import "MetaMaskReactNativeSdk-Bridging-Header.h"

@interface RCTConvert (EthereumRequestObjC)

+ (EthereumRequestObjC *)EthereumRequestObjC:(id)json;
+ (NSArray<EthereumRequestObjC *> *)EthereumRequestObjCArray:(id)json;

@end

@implementation RCTConvert (EthereumRequestObjC)

+ (EthereumRequestObjC *)EthereumRequestObjC:(id)json {
    if (![json isKindOfClass:[NSDictionary class]]) {
        RCTLogConvertError(json, @"an NSDictionary");
        return nil;
    }

    NSDictionary *dictionary = (NSDictionary *)json;
    NSString *method = [RCTConvert NSString:dictionary[@"method"]];
    id params = dictionary[@"params"];

    if (method == nil || params == nil) {
        RCTLogConvertError(json, @"a valid EthereumRequestObjC");
        return nil;
    }

    return [[EthereumRequestObjC alloc] initWithMethod:method params:params];
}

+ (NSArray<EthereumRequestObjC *> *)EthereumRequestObjCArray:(id)json {
    if (![json isKindOfClass:[NSArray class]]) {
        RCTLogConvertError(json, @"an NSArray");
        return nil;
    }

    NSMutableArray<EthereumRequestObjC *> *requestArray = [NSMutableArray array];
    for (id element in (NSArray *)json) {
        EthereumRequestObjC *request = [RCTConvert EthereumRequestObjC:element];
        if (request) {
            [requestArray addObject:request];
        }
    }

    return requestArray;
}
