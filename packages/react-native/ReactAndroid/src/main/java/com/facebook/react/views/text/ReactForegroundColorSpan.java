/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.views.text;

import android.graphics.Color;
import android.os.Parcel;
import android.text.style.ForegroundColorSpan;
import android.text.TextPaint;

/*
 * Wraps {@link ForegroundColorSpan} as a {@link ReactSpan}.
 */
public class ReactForegroundColorSpan extends ForegroundColorSpan implements ReactSpan {
  public ReactForegroundColorSpan(int color) {
    super(color);
  }

  public ReactForegroundColorSpan(long color) {
    super(Color.toArgb(color));
    TextPaint tp = new TextPaint();
    tp.setColor(color);
    this.updateDrawState(tp);
  }

  public ReactForegroundColorSpan(Parcel colorParcel) {
    super(colorParcel);
  }
}
