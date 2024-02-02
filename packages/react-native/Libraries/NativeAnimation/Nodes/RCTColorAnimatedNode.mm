/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTColorAnimatedNode.h>
#import <React/RCTValueAnimatedNode.h>

#import <React/RCTAnimationUtils.h>
#import <React/RCTConvert.h>

@implementation RCTColorAnimatedNode

- (void)performUpdate
{
  [super performUpdate];

  CGFloat divisor = self.config[@"space"] ? 1.0 : 255.0;
  RCTColorSpace space = [RCTConvert colorSpaceFromString:self.config[@"space"]];
  RCTValueAnimatedNode *rNode = (RCTValueAnimatedNode *)[self.parentNodes objectForKey:self.config[@"r"]];
  RCTValueAnimatedNode *gNode = (RCTValueAnimatedNode *)[self.parentNodes objectForKey:self.config[@"g"]];
  RCTValueAnimatedNode *bNode = (RCTValueAnimatedNode *)[self.parentNodes objectForKey:self.config[@"b"]];
  RCTValueAnimatedNode *aNode = (RCTValueAnimatedNode *)[self.parentNodes objectForKey:self.config[@"a"]];
    
// TODO: why can't we just use UIColor here?
//  _color = [RCTConvert createColorFrom:rNode.value green:gNode.value blue:bNode.value alpha:aNode.value andColorSpace:space];
  _color = @{
    @"space": space == RCTColorSpaceDisplayP3 ? @"display-p3" : @"srgb",
    @"r": @(rNode.value / divisor),
    @"g": @(gNode.value / divisor),
    @"b": @(bNode.value / divisor),
    @"a": @(aNode.value),
  };

  // TODO (T111179606): Support platform colors for color animations
}

@end
