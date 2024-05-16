// MetaMaskReactNativeSdk.m

#import "MetaMaskReactNativeSdk.h"

@implementation MetaMaskReactNativeSdk

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(sampleMethod:(NSString *)stringArgument numberParameter:(nonnull NSNumber *)numberArgument callback:(RCTResponseSenderBlock)callback)
{
    // Since you just want to return stringArgument, you can directly use it in the callback
    callback(@[stringArgument]);
}

@end
