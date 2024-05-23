#import "EthereumRequestObjC.h"
#import <React/RCTLog.h>

@implementation EthereumRequestObjC

@synthesize method = _method;
@synthesize params = _params;

- (instancetype)initWithDictionary:(NSDictionary *)dictionary {
  if (self = [super init]) {
    _method = dictionary[@"method"];
    _params = dictionary[@"params"];
  }
  return self;
}

@end
