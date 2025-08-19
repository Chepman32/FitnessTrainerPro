#pragma once
// Shim header to satisfy RNReanimated's include <rnworklets/rnworklets.h>
// Provides compatibility aliases and then forwards to worklets-core header.
#import <Foundation/Foundation.h>

// RNReanimated 4 expects `NativeWorkletsModuleSpec`, while
// react-native-worklets-core exposes `NativeWorkletsSpec`.
// Create a protocol alias so the compiler can resolve the symbol.
@protocol NativeWorkletsSpec;
@protocol NativeWorkletsModuleSpec <NativeWorkletsSpec>
@end

#import <react-native-worklets-core/Worklets.h>
