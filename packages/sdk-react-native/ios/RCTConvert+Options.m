#import "RCTConvert+Options.h"

@implementation RCTConvert (Options)

+ (Options *)Options:(id)json {
    NSDictionary *optionsData = [self NSDictionary:json];
    NSString *dappName = optionsData[@"dappName"];
    NSString *dappUrl = optionsData[@"dappUrl"];
    NSString *dappIconUrl = optionsData[@"dappIconUrl"];
    NSString *dappScheme = optionsData[@"dappScheme"];
    NSString *infuraAPIKey = optionsData[@"infuraAPIKey"];

    Options *options = [[Options alloc] initWithDappName:dappName
                                                 dappUrl:dappUrl
                                             dappIconUrl:dappIconUrl
                                              dappScheme:dappScheme
                                            infuraAPIKey:infuraAPIKey];
    return options;
}

@end
