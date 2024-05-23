#import <Foundation/Foundation.h>

@interface EthereumRequestObjC : NSObject

@property (nonatomic, strong) NSString *method;
@property (nonatomic, strong) id params;

- (instancetype)initWithMethod:(NSString *)method params:(id)params;

@end
