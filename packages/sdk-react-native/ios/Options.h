#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface Options : NSObject

@property (nonatomic, strong, readonly) NSString *dappName;
@property (nonatomic, strong, readonly) NSString *dappUrl;
@property (nonatomic, strong, readonly) NSString *dappIconUrl;
@property (nonatomic, strong, readonly) NSString *dappScheme;
@property (nonatomic, strong, readonly) NSString *infuraAPIKey;
@property (nonatomic, strong, readonly) NSString *apiVersion;

- (instancetype)initWithDictionary:(NSDictionary *)dictionary;

@end
