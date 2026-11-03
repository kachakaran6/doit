package com.samyukt.doit.overlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileOutputStream

class ImagePickerActivity : Activity() {

    companion object {
        const val REQUEST_PICK_IMAGE = 1003
        var pendingPromise: Promise? = null

        fun pickImage(context: Context, promise: Promise) {
            pendingPromise = promise
            val intent = Intent(context, ImagePickerActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }
        try {
            @Suppress("DEPRECATION")
            startActivityForResult(Intent.createChooser(intent, "Select Image"), REQUEST_PICK_IMAGE)
        } catch (e: Exception) {
            pendingPromise?.reject("PICK_INTENT_FAILED", e.message)
            pendingPromise = null
            finish()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_PICK_IMAGE) {
            val uri: Uri? = data?.data
            if (resultCode == RESULT_OK && uri != null) {
                try {
                    val inputStream = contentResolver.openInputStream(uri)
                    val outFile = File(cacheDir, "picked_img_${System.currentTimeMillis()}.jpg")
                    val outputStream = FileOutputStream(outFile)
                    inputStream?.copyTo(outputStream)
                    inputStream?.close()
                    outputStream.close()

                    val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                    BitmapFactory.decodeFile(outFile.absolutePath, options)

                    val map = Arguments.createMap().apply {
                        putString("uri", "file://${outFile.absolutePath}")
                        putInt("width", options.outWidth)
                        putInt("height", options.outHeight)
                        putInt("sizeBytes", outFile.length().toInt())
                        putString("name", outFile.name)
                        putString("mimeType", "image/jpeg")
                    }
                    pendingPromise?.resolve(map)
                } catch (e: Exception) {
                    pendingPromise?.reject("PICK_FAILED", e.message)
                }
            } else {
                pendingPromise?.reject("PICK_CANCELLED", "User cancelled image selection")
            }
            pendingPromise = null
            finish()
        }
    }
}

