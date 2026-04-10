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
import java.io.FileInputStream;

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
                String mimeType = "application/octet-stream";
                if (fileName.endsWith(".json")) {
                    mimeType = "application/json";
                } else if (fileName.endsWith(".db")) {
                    mimeType = "application/x-sqlite3";
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // Android 10+ 使用 MediaStore
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
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

        @JavascriptInterface
        public String saveBase64ToDownloads(String fileName, String base64Content) {
            try {
                String mimeType = "application/octet-stream";
                if (fileName.endsWith(".json")) {
                    mimeType = "application/json";
                } else if (fileName.endsWith(".db")) {
                    mimeType = "application/x-sqlite3";
                }

                byte[] decodedBytes = android.util.Base64.decode(base64Content, android.util.Base64.DEFAULT);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
                    values.put(MediaStore.Downloads.IS_PENDING, 1);

                    Uri uri = activity.getContentResolver().insert(
                        MediaStore.Downloads.EXTERNAL_CONTENT_URI, values
                    );

                    if (uri != null) {
                        try (OutputStream os = activity.getContentResolver().openOutputStream(uri)) {
                            os.write(decodedBytes);
                        }

                        ContentValues updateValues = new ContentValues();
                        updateValues.put(MediaStore.Downloads.IS_PENDING, 0);
                        activity.getContentResolver().update(uri, updateValues, null, null);

                        return "success:" + Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + "/" + fileName;
                    }
                } else {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    File file = new File(downloadsDir, fileName);

                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(decodedBytes);
                    }

                    return "success:" + file.getAbsolutePath();
                }

                return "error:Failed to save file";
            } catch (Exception e) {
                return "error:" + e.getMessage();
            }
        }

        @JavascriptInterface
        public String getDatabasesPath() {
            return "/data/data/com.yishi.master/databases/";
        }

        @JavascriptInterface
        public String exportDbAsBase64(String dbName) {
            try {
                File dbDir = new File(activity.getFilesDir().getParentFile(), "databases");
                File dbFile = new File(dbDir, dbName + "SQLite.db");
                if (!dbFile.exists()) {
                    return "error:Database file not found: " + dbFile.getAbsolutePath();
                }
                FileInputStream fis = new FileInputStream(dbFile);
                byte[] bytes = new byte[(int) dbFile.length()];
                fis.read(bytes);
                fis.close();
                return android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP);
            } catch (Exception e) {
                return "error:" + e.getMessage();
            }
        }

        @JavascriptInterface
        public String writeDbFromBase64(String dbName, String base64Content) {
            try {
                byte[] decodedBytes = android.util.Base64.decode(base64Content, android.util.Base64.DEFAULT);
                File dbDir = new File(activity.getFilesDir().getParentFile(), "databases");
                if (!dbDir.exists()) {
                    dbDir.mkdirs();
                }
                File destFile = new File(dbDir, dbName + "SQLite.db");
                FileOutputStream fos = new FileOutputStream(destFile);
                fos.write(decodedBytes);
                fos.flush();
                fos.close();
                return "success:" + destFile.getAbsolutePath();
            } catch (Exception e) {
                return "error:" + e.getMessage();
            }
        }

        @JavascriptInterface
        public String importSqliteDb(String srcFileName, String destDbName) {
            try {
                File srcFile = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), srcFileName);
                if (!srcFile.exists()) {
                    return "error:Source file not found: " + srcFile.getAbsolutePath();
                }

                String destPath = "/data/data/com.yishi.master/databases/" + destDbName + "SQLite.db";
                File destFile = new File(destPath);
                File destDir = destFile.getParentFile();
                if (!destDir.exists()) {
                    destDir.mkdirs();
                }

                java.nio.file.Files.copy(srcFile.toPath(), destFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                return "success:" + destPath;
            } catch (Exception e) {
                return "error:" + e.getMessage();
            }
        }
    }
}
