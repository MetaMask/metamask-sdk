#import <React/RCTConvert.h>
#import "EthereumRequestObjC.h"

@interface RCTConvert (EthereumRequestObjC)

+ (EthereumRequestObjC *)EthereumRequestObjC:(id)json;
+ (NSArray<EthereumRequestObjC *> *)EthereumRequestObjCArray:(id)json;

@end
