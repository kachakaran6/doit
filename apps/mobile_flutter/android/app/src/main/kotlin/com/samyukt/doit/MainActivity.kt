package com.samyukt.doit

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import com.samyukt.doit.overlay.FlutterOverlayBridge
import com.samyukt.doit.overlay.BubbleService

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        FlutterOverlayBridge.registerWith(flutterEngine, applicationContext)
    }

    override fun onResume() {
        super.onResume()
        BubbleService.setAppInForeground(true)
    }

    override fun onPause() {
        super.onPause()
        BubbleService.setAppInForeground(false)
    }
}
