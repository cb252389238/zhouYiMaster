package com.yishi.master;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 添加 JavaScript 接口
        bridge.getWebView().addJavascriptInterface(new FileSaverInterface(this), "AndroidFileSaver");
    }
    
    public static class FileSaverInterface {
        private final MainActivity activity;
        
        public FileSaverInterface(MainActivity activity) {
            this.activity = activity;
        }
        
        @JavascriptInterface
        public String saveToDownloads(String fileName, String content) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // Android 10+ 使用 MediaStore
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    values.put(MediaStore.Downloads.IS_PENDING, 1);
                    
                    Uri uri = activity.getContentResolver().insert(
                        MediaStore.Downloads.EXTERNAL_CONTENT_URI, values
                    );
                    
                    if (uri != null) {
                        try (OutputStream os = activity.getContentResolver().openOutputStream(uri)) {
                            os.write(content.getBytes("UTF-8"));
                        }
                        
                        ContentValues updateValues = new ContentValues();
                        updateValues.put(MediaStore.Downloads.IS_PENDING, 0);
                        activity.getContentResolver().update(uri, updateValues, null, null);
                        
                        return "success:" + Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + "/" + fileName;
                    }
                } else {
                    // Android 9 及以下
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    File file = new File(downloadsDir, fileName);
                    
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(content.getBytes("UTF-8"));
                    }
                    
                    return "success:" + file.getAbsolutePath();
                }
                
                return "error:Failed to save file";
            } catch (Exception e) {
                return "error:" + e.getMessage();
            }
        }
    }
}
