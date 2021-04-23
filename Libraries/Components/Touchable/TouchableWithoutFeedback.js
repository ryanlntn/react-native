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
import TVTouchable from './TVTouchable';
import type {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  AccessibilityRole,
  AccessibilityState,
  AccessibilityValue,
} from '../../Components/View/ViewAccessibility';
import type {EdgeInsetsProp} from '../../StyleSheet/EdgeInsetsPropType';
import type {
  BlurEvent,
  FocusEvent,
  KeyEvent,
  LayoutEvent,
  PressEvent,
  MouseEvent, // TODO(macOS ISS#2323203)
} from '../../Types/CoreEventTypes';

// [TODO(macOS ISS#2323203)
const {DraggedTypes} = require('../View/DraggedType');
import type {DraggedTypesType} from '../View/DraggedType';
// ]TODO(macOS ISS#2323203)

import Platform from '../../Utilities/Platform';
import View from '../../Components/View/View';
import * as React from 'react';

type Props = $ReadOnly<{|
  accessibilityActions?: ?$ReadOnlyArray<AccessibilityActionInfo>,
  accessibilityElementsHidden?: ?boolean,
  accessibilityHint?: ?Stringish,
  accessibilityIgnoresInvertColors?: ?boolean,
  accessibilityLabel?: ?Stringish,
  accessibilityLiveRegion?: ?('none' | 'polite' | 'assertive'),
  accessibilityRole?: ?AccessibilityRole,
  accessibilityState?: ?AccessibilityState,
  accessibilityValue?: ?AccessibilityValue,
  accessibilityViewIsModal?: ?boolean,
  accessible?: ?boolean,
  children?: ?React.Node,
  cursor?: ?(
    | 'alias'
    | 'auto'
    | 'col-resize'
    | 'context-menu'
    | 'copy'
    | 'crosshair'
    | 'default'
    | 'disappearing-item'
    | 'e-resize'
    | 'grab'
    | 'grabbing'
    | 'n-resize'
    | 'no-drop'
    | 'not-allowed'
    | 'pointer'
    | 'row-resize'
    | 's-resize'
    | 'text'
    | 'vertical-text'
    | 'w-resize'
  ),
  delayLongPress?: ?number,
  delayPressIn?: ?number,
  delayPressOut?: ?number,
  disabled?: ?boolean,
  focusable?: ?boolean,
  hitSlop?: ?EdgeInsetsProp,
  importantForAccessibility?: ?('auto' | 'yes' | 'no' | 'no-hide-descendants'),
  nativeID?: ?string,
  onAccessibilityAction?: ?(event: AccessibilityActionEvent) => mixed,
  onBlur?: ?(event: BlurEvent) => mixed,
  onFocus?: ?(event: FocusEvent) => mixed,
  onKeyDown?: ?(event: KeyEvent) => mixed,
  onKeyUp?: ?(event: KeyEvent) => mixed,
  validKeysDown?: ?Array<string>,
  validKeysUp?: ?Array<string>,
  onLayout?: ?(event: LayoutEvent) => mixed,
  onLongPress?: ?(event: PressEvent) => mixed,
  onPress?: ?(event: PressEvent) => mixed,
  onPressIn?: ?(event: PressEvent) => mixed,
  onPressOut?: ?(event: PressEvent) => mixed,
  acceptsFirstMouse?: ?boolean, // [TODO(macOS ISS#2323203)
  acceptsKeyboardFocus?: ?boolean,
  enableFocusRing?: ?boolean,
  tooltip?: ?string,
  onMouseEnter?: (event: MouseEvent) => void,
  onMouseLeave?: (event: MouseEvent) => void,
  onDragEnter?: (event: MouseEvent) => void,
  onDragLeave?: (event: MouseEvent) => void,
  onDrop?: (event: MouseEvent) => void,
  draggedTypes?: ?DraggedTypesType, // ]TODO(macOS ISS#2323203)
  pressRetentionOffset?: ?EdgeInsetsProp,
  rejectResponderTermination?: ?boolean,
  testID?: ?string,
  touchSoundDisabled?: ?boolean,
|}>;

type State = $ReadOnly<{|
  pressability: Pressability,
|}>;

const PASSTHROUGH_PROPS = [
  'accessibilityActions',
  'accessibilityElementsHidden',
  'accessibilityHint',
  'accessibilityIgnoresInvertColors',
  'accessibilityLabel',
  'accessibilityLiveRegion',
  'accessibilityRole',
  'accessibilityState',
  'accessibilityValue',
  'accessibilityViewIsModal',
  'hitSlop',
  'importantForAccessibility',
  'nativeID',
  'onAccessibilityAction',
  'onBlur',
  'onFocus',
  'onKeyDown',
  'onKeyUp',
  'validKeysDown',
  'validKeysUp',
  'onLayout',
  'onMouseEnter', // [TODO(macOS ISS#2323203)
  'onMouseLeave',
  'onDragEnter',
  'onDragLeave',
  'onDrop',
  'draggedTypes',
  'tooltip', // ]TODO(macOS ISS#2323203)
  'testID',
];

class TouchableWithoutFeedback extends React.Component<Props, State> {
  _tvTouchable: ?TVTouchable;

  state: State = {
    pressability: new Pressability(createPressabilityConfig(this.props)),
  };

  render(): React.Node {
    const element = React.Children.only(this.props.children);
    const children = [element.props.children];
    if (__DEV__) {
      if (element.type === View) {
        children.push(
          <PressabilityDebugView color="red" hitSlop={this.props.hitSlop} />,
        );
      }
    }

    // BACKWARD-COMPATIBILITY: Focus and blur events were never supported before
    // adopting `Pressability`, so preserve that behavior.
    const {
      onBlur,
      onFocus,
      onMouseEnter, // [TODO(macOS/win ISS#2323203)
      onMouseLeave, // ]TODO(macOS/win ISS#2323203)
      ...eventHandlersWithoutBlurAndFocus
    } = this.state.pressability.getEventHandlers();

    const elementProps: {[string]: mixed, ...} = {
      ...eventHandlersWithoutBlurAndFocus,
      accessible: this.props.accessible !== false,
      acceptsFirstMouse:
        this.props.acceptsFirstMouse !== false && !this.props.disabled, // [TODO(macOS ISS#2323203)
      // [macOS #656 We need to reconcile between focusable and acceptsKeyboardFocus
      // (e.g. if one is explicitly disabled, we shouldn't implicitly enable the
      // other on the underlying view). Prefer passing acceptsKeyboardFocus if
      // passed explicitly to preserve original behavior, and trigger view warnings.
      ...(this.props.acceptsKeyboardFocus !== undefined
        ? {
            acceptsKeyboardFocus:
              this.props.acceptsKeyboardFocus === true && !this.props.disabled,
          }
        : {
            focusable:
              this.props.focusable !== false &&
              this.props.onPress !== undefined,
          }),
      // macOS]
      enableFocusRing:
        this.props.enableFocusRing !== false && !this.props.disabled, // ]TODO(macOS ISS#2323203)
    };
    for (const prop of PASSTHROUGH_PROPS) {
      if (this.props[prop] !== undefined) {
        elementProps[prop] = this.props[prop];
      }
    }

    return React.cloneElement(element, elementProps, ...children);
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

  componentDidUpdate(): void {
    this.state.pressability.configure(createPressabilityConfig(this.props));
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

function createPressabilityConfig(props: Props): PressabilityConfig {
  return {
    cancelable: !props.rejectResponderTermination,
    disabled: props.disabled,
    hitSlop: props.hitSlop,
    delayLongPress: props.delayLongPress,
    delayPressIn: props.delayPressIn,
    delayPressOut: props.delayPressOut,
    minPressDuration: 0,
    pressRectOffset: props.pressRetentionOffset,
    android_disableSound: props.touchSoundDisabled,
    onBlur: props.onBlur,
    onFocus: props.onFocus,
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
    validKeysDown: props.validKeysDown,
    validKeysUp: props.validKeysUp,
    onLongPress: props.onLongPress,
    onPress: props.onPress,
    onPressIn: props.onPressIn,
    onPressOut: props.onPressOut,
  };
}

module.exports = TouchableWithoutFeedback;
