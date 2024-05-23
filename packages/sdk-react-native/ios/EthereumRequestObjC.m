#import "EthereumRequestObjC.h"

@implementation EthereumRequestObjC

- (instancetype)initWithMethod:(NSString *)method params:(id)params {
    self = [super init];
    if (self) {
        _method = method;
        _params = params;
    }
    return self;
}

@end
