/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <react/renderer/graphics/ColorComponents.h>
#include <cmath>

namespace facebook::react {

struct Color {
  int32_t value;
  ColorSpace colorSpace;

  bool operator==(const Color& otherColor) const {
    return colorSpace == otherColor.colorSpace && value == otherColor.value;
  }

  bool operator!=(const Color& otherColor) const {
    return colorSpace != otherColor.colorSpace || value != otherColor.value;
  }
};

namespace HostPlatformColor {
static const facebook::react::Color UndefinedColor =
    std::numeric_limits<facebook::react::Color>::max();
}

inline Color hostPlatformColorFromComponents(ColorComponents components) {
  float ratio = 255;
  return Color{
      ((int)round(components.alpha * ratio) & 0xff) << 24 |
          ((int)round(components.red * ratio) & 0xff) << 16 |
          ((int)round(components.green * ratio) & 0xff) << 8 |
          ((int)round(components.blue * ratio) & 0xff),
      components.colorSpace};
}

inline ColorComponents colorComponentsFromHostPlatformColor(Color color) {
  float ratio = 255;
  return ColorComponents{
      (float)((color.value >> 16) & 0xff) / ratio,
      (float)((color.value >> 8) & 0xff) / ratio,
      (float)((color.value >> 0) & 0xff) / ratio,
      (float)((color.value >> 24) & 0xff) / ratio,
      color.colorSpace};
}

} // namespace facebook::react

namespace std {
template <>
struct std::hash<facebook::react::Color> {
  size_t operator()(const facebook::react::Color& color) const {
    size_t h = color.value;

    int colorSpaces[] = {0, 1};
    for (auto s : colorSpaces) {
      h ^= hash<decltype(s)>{}(s);
    }

    return h;
  };
};
} // namespace std
