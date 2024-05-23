#import <Foundation/Foundation.h>

@interface Options : NSObject

@property (nonatomic, strong) NSString *dappName;
@property (nonatomic, strong) NSString *dappUrl;
@property (nonatomic, strong) NSString *dappIconUrl;
@property (nonatomic, strong) NSString *dappScheme;
@property (nonatomic, strong) NSString *infuraAPIKey;

- (instancetype)initWithDappName:(NSString *)dappName
                         dappUrl:(NSString *)dappUrl
                     dappIconUrl:(NSString *)dappIconUrl
                      dappScheme:(NSString *)dappScheme
                    infuraAPIKey:(NSString *)infuraAPIKey;

@end
