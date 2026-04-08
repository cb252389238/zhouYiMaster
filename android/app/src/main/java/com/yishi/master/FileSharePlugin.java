package com.yishi.master;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

@CapacitorPlugin(name = "FileShare")
public class FileSharePlugin extends Plugin {
    
    @PluginMethod
    public void shareFile(@NonNull PluginCall call) {
        String fileName = call.getString("fileName");
        String content = call.getString("content");
        
        if (fileName == null || content == null) {
            call.reject("Missing fileName or content");
            return;
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                values.put(MediaStore.Downloads.IS_PENDING, 1);
                
                Uri uri = getContext().getContentResolver().insert(
                    MediaStore.Downloads.EXTERNAL_CONTENT_URI, values
                );
                
                if (uri != null) {
                    try (OutputStream os = getContext().getContentResolver().openOutputStream(uri)) {
                        os.write(content.getBytes("UTF-8"));
                    }
                    
                    ContentValues updateValues = new ContentValues();
                    updateValues.put(MediaStore.Downloads.IS_PENDING, 0);
                    getContext().getContentResolver().update(uri, updateValues, null, null);
                    
                    String fullPath = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + "/" + fileName;
                    
                    JSObject result = new JSObject();
                    result.put("path", fullPath);
                    result.put("success", true);
                    call.resolve(result);
                    return;
                }
            } else {
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                File file = new File(downloadsDir, fileName);
                
                try (FileOutputStream fos = new FileOutputStream(file)) {
                    fos.write(content.getBytes("UTF-8"));
                }
                
                JSObject result = new JSObject();
                result.put("path", file.getAbsolutePath());
                result.put("success", true);
                call.resolve(result);
                return;
            }
            
            call.reject("Failed to save file");
        } catch (IOException e) {
            call.reject("Failed to create file: " + e.getMessage());
        }
    }
}
