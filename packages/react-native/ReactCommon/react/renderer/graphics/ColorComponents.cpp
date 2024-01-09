#include "ColorComponents.h"

namespace facebook::react {

static ColorSpace defaultColorSpace = ColorSpace::sRGB;

ColorSpace getDefaultColorSpace() {
  return defaultColorSpace;
}

void setDefaultColorSpace(ColorSpace newColorSpace) {
  defaultColorSpace = newColorSpace;
}

} // namespace facebook::react