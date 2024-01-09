/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTAnimatedNode.h>

@interface RCTColorAnimatedNode : RCTAnimatedNode

// @property (nonatomic, strong) UIColor *color;
@property (nonatomic, strong) NSDictionary<NSString *, id> *color;

@end
