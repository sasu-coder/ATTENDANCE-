package com.university.attendsecure;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(NativeScan.class);
  }
}
