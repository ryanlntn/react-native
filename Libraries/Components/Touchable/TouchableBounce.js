/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import Pressability, {
  type PressabilityConfig,
} from '../../Pressability/Pressability';
import {PressabilityDebugView} from '../../Pressability/PressabilityDebug';
import type {ViewStyleProp} from '../../StyleSheet/StyleSheet';
import TVTouchable from './TVTouchable';
import typeof TouchableWithoutFeedback from './TouchableWithoutFeedback';
import {Animated, Platform} from 'react-native';
import * as React from 'react';

type Props = $ReadOnly<{|
  ...React.ElementConfig<TouchableWithoutFeedback>,

  onPressAnimationComplete?: ?() => void,
  onPressWithCompletion?: ?(callback: () => void) => void,
  releaseBounciness?: ?number,
  releaseVelocity?: ?number,
  style?: ?ViewStyleProp,

  hostRef: React.Ref<typeof Animated.View>,
|}>;

type State = $ReadOnly<{|
  pressability: Pressability,
  scale: Animated.Value,
|}>;

class TouchableBounce extends React.Component<Props, State> {
  _tvTouchable: ?TVTouchable;

  state: State = {
    pressability: new Pressability(this._createPressabilityConfig()),
    scale: new Animated.Value(1),
  };

  _createPressabilityConfig(): PressabilityConfig {
    return {
      cancelable: !this.props.rejectResponderTermination,
      disabled: this.props.disabled,
      hitSlop: this.props.hitSlop,
      delayLongPress: this.props.delayLongPress,
      delayPressIn: this.props.delayPressIn,
      delayPressOut: this.props.delayPressOut,
      minPressDuration: 0,
      pressRectOffset: this.props.pressRetentionOffset,
      android_disableSound: this.props.touchSoundDisabled,
      onBlur: event => {
        if (Platform.isTV) {
          this._bounceTo(1, 0.4, 0);
        }
        if (this.props.onBlur != null) {
          this.props.onBlur(event);
        }
      },
      onFocus: event => {
        if (Platform.isTV) {
          this._bounceTo(0.93, 0.1, 0);
        }
        if (this.props.onFocus != null) {
          this.props.onFocus(event);
        }
      },
      onLongPress: event => {
        if (this.props.onLongPress != null) {
          this.props.onLongPress(event);
        }
      },
      onPress: event => {
        const {onPressAnimationComplete, onPressWithCompletion} = this.props;
        const releaseBounciness = this.props.releaseBounciness ?? 10;
        const releaseVelocity = this.props.releaseVelocity ?? 10;

        if (onPressWithCompletion != null) {
          onPressWithCompletion(() => {
            this.state.scale.setValue(0.93);
            this._bounceTo(
              1,
              releaseVelocity,
              releaseBounciness,
              onPressAnimationComplete,
            );
          });
          return;
        }

        this._bounceTo(
          1,
          releaseVelocity,
          releaseBounciness,
          onPressAnimationComplete,
        );
        if (this.props.onPress != null) {
          this.props.onPress(event);
        }
      },
      onPressIn: event => {
        this._bounceTo(0.93, 0.1, 0);
        if (this.props.onPressIn != null) {
          this.props.onPressIn(event);
        }
      },
      onPressOut: event => {
        this._bounceTo(1, 0.4, 0);
        if (this.props.onPressOut != null) {
          this.props.onPressOut(event);
        }
      },
    };
  }

  _bounceTo(
    toValue: number,
    velocity: number,
    bounciness: number,
    callback?: ?() => void,
  ) {
    Animated.spring(this.state.scale, {
      toValue,
      velocity,
      bounciness,
      useNativeDriver: true,
    }).start(callback);
  }

  render(): React.Node {
    // BACKWARD-COMPATIBILITY: Focus and blur events were never supported before
    // adopting `Pressability`, so preserve that behavior.
    const {
      onBlur,
      onFocus,
      onMouseEnter, // [TODO(macOS/win ISS#2323203)
      onMouseLeave, // ]TODO(macOS/win ISS#2323203)
      ...eventHandlersWithoutBlurAndFocus
    } = this.state.pressability.getEventHandlers();

    return (
      <Animated.View
        style={[{transform: [{scale: this.state.scale}]}, this.props.style]}
        accessible={this.props.accessible !== false}
        accessibilityLabel={this.props.accessibilityLabel}
        accessibilityHint={this.props.accessibilityHint}
        accessibilityRole={this.props.accessibilityRole}
        accessibilityState={this.props.accessibilityState}
        accessibilityActions={this.props.accessibilityActions}
        onAccessibilityAction={this.props.onAccessibilityAction}
        accessibilityValue={this.props.accessibilityValue}
        importantForAccessibility={this.props.importantForAccessibility}
        accessibilityLiveRegion={this.props.accessibilityLiveRegion}
        accessibilityViewIsModal={this.props.accessibilityViewIsModal}
        accessibilityElementsHidden={this.props.accessibilityElementsHidden}
        acceptsFirstMouse={
          this.props.acceptsFirstMouse !== false && !this.props.disabled
        } // TODO(macOS ISS#2323203)
        enableFocusRing={
          (this.props.enableFocusRing === undefined ||
            this.props.enableFocusRing === true) &&
          !this.props.disabled
        } // TODO(macOS/win ISS#2323203)
        nativeID={this.props.nativeID}
        testID={this.props.testID}
        hitSlop={this.props.hitSlop}
        // [macOS #656 We need to reconcile between focusable and acceptsKeyboardFocus
        // (e.g. if one is explicitly disabled, we shouldn't implicitly enable the
        // other on the underlying view). Prefer passing acceptsKeyboardFocus if
        // passed explicitly to preserve original behavior, and trigger view warnings.
        {...(this.props.acceptsKeyboardFocus !== undefined
          ? {
              acceptsKeyboardFocus:
                this.props.acceptsKeyboardFocus === true &&
                !this.props.disabled,
            }
          : {
              focusable:
                this.props.focusable !== false &&
                this.props.onPress !== undefined &&
                !this.props.disabled,
            })}
        // macOS]
        cursor={this.props.cursor}
        tooltip={this.props.tooltip} // TODO(macOS/win ISS#2323203)
        onMouseEnter={this.props.onMouseEnter} // [TODO(macOS ISS#2323203)
        onMouseLeave={this.props.onMouseLeave}
        onDragEnter={this.props.onDragEnter}
        onDragLeave={this.props.onDragLeave}
        onDrop={this.props.onDrop}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        draggedTypes={this.props.draggedTypes} // ]TODO(macOS ISS#2323203)
        ref={this.props.hostRef}
        {...eventHandlersWithoutBlurAndFocus}>
        {this.props.children}
        {__DEV__ ? (
          <PressabilityDebugView color="orange" hitSlop={this.props.hitSlop} />
        ) : null}
      </Animated.View>
    );
  }

  componentDidMount(): void {
    if (Platform.isTV) {
      this._tvTouchable = new TVTouchable(this, {
        getDisabled: () => this.props.disabled === true,
        onBlur: event => {
          if (this.props.onBlur != null) {
            this.props.onBlur(event);
          }
        },
        onFocus: event => {
          if (this.props.onFocus != null) {
            this.props.onFocus(event);
          }
        },
        onPress: event => {
          if (this.props.onPress != null) {
            this.props.onPress(event);
          }
        },
      });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.state.pressability.configure(this._createPressabilityConfig());
  }

  componentWillUnmount(): void {
    if (Platform.isTV) {
      if (this._tvTouchable != null) {
        this._tvTouchable.destroy();
      }
    }
    this.state.pressability.reset();
  }
}

module.exports = (React.forwardRef((props, hostRef) => (
  <TouchableBounce {...props} hostRef={hostRef} />
)): React.ComponentType<$ReadOnly<$Diff<Props, {|hostRef: mixed|}>>>);
