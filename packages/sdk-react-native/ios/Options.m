//
//  Options.m
//  MetaMaskNativeSDK
//

#import "Options.h"
#import <React/RCTLog.h>

@implementation Options

@synthesize dappName = _dappName;
@synthesize dappUrl = _dappUrl;
@synthesize dappIconUrl = _dappIconUrl;
@synthesize dappScheme = _dappScheme;
@synthesize infuraAPIKey = _infuraAPIKey;

- (instancetype)initWithDictionary:(NSDictionary *)dictionary {
  if (self = [super init]) {
    _dappName = dictionary[@"dappName"];
    _dappUrl = dictionary[@"dappUrl"];
    _dappIconUrl = dictionary[@"dappIconUrl"];
    _dappScheme = dictionary[@"dappScheme"];
    _infuraAPIKey = dictionary[@"infuraAPIKey"];
  }
  return self;
}

@end
