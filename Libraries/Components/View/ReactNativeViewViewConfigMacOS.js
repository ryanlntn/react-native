/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// TODO(macOS ISS#2323203)

'use strict';

const ReactNativeViewViewConfigMacOS = {
  uiViewClassName: 'RCTView',
  directEventTypes: {
    topDoubleClick: {
      registrationName: 'onDoubleClick',
    },
    topDragEnter: {
      registrationName: 'onDragEnter',
    },
    topDragLeave: {
      registrationName: 'onDragLeave',
    },
    topDrop: {
      registrationName: 'onDrop',
    },
    topMouseEnter: {
      registrationName: 'onMouseEnter',
    },
    topMouseLeave: {
      registrationName: 'onMouseLeave',
    },
  },
  validAttributes: {
    acceptsFirstMouse: true,
    acceptsKeyboardFocus: true,
    accessibilityTraits: true,
    cursor: true,
    draggedTypes: true,
    enableFocusRing: true,
    onBlur: true,
    onClick: true,
    onDoubleClick: true,
    onDragEnter: true,
    onDragLeave: true,
    onDrop: true,
    onFocus: true,
    onKeyDown: true,
    onKeyUp: true,
    onMouseEnter: true,
    onMouseLeave: true,
    tooltip: true,
    validKeysDown: true,
    validKeysUp: true,
  },
};

module.exports = ReactNativeViewViewConfigMacOS;
