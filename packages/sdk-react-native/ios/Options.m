#import "Options.h"

@implementation Options

- (instancetype)initWithDappName:(NSString *)dappName
                         dappUrl:(NSString *)dappUrl
                     dappIconUrl:(NSString *)dappIconUrl
                      dappScheme:(NSString *)dappScheme
                    infuraAPIKey:(NSString *)infuraAPIKey {
    self = [super init];
    if (self) {
        _dappName = dappName;
        _dappUrl = dappUrl;
        _dappIconUrl = dappIconUrl;
        _dappScheme = dappScheme;
        _infuraAPIKey = infuraAPIKey;
    }
    return self;
}

@end
