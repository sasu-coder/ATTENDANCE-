package com.university.attendsecure;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.util.Size;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.barcode.Barcode;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceDetection;
import com.google.mlkit.vision.face.FaceDetector;
import com.google.mlkit.vision.face.FaceDetectorOptions;

import java.nio.ByteBuffer;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "NativeScan")
public class NativeScan extends Plugin {
  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  private ExecutorService cameraExecutor;
  private ProcessCameraProvider cameraProvider;
  private ImageAnalysis imageAnalysis;
  private BarcodeScanner barcodeScanner;
  private FaceDetector faceDetector;

  private boolean qrActive = false;
  private boolean faceActive = false;
  private long qrStartMs = 0L;
  private long faceStartMs = 0L;

  @PluginMethod
  public void startQrScan(PluginCall call) {
    getBridge().executeOnMainThread(() -> {
      if (getActivity() == null) { call.reject("No activity"); return; }
      if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
        call.reject("Camera permission not granted");
        return;
      }
      emitQrStatus("scanning", 10);
      qrStartMs = System.currentTimeMillis();
      startCameraForQR(call);
    });
  }

  @PluginMethod
  public void stopQrScan(PluginCall call) {
    stopCamera();
    emitQrStatus("idle", 0);
    call.resolve();
  }

  @PluginMethod
  public void startFaceScan(PluginCall call) {
    getBridge().executeOnMainThread(() -> {
      if (getActivity() == null) { call.reject("No activity"); return; }
      if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
        call.reject("Camera permission not granted");
        return;
      }
      emitFaceStatus("scanning", 10);
      faceStartMs = System.currentTimeMillis();
      startCameraForFace(call);
    });
  }

  @PluginMethod
  public void stopFaceScan(PluginCall call) {
    stopCamera();
    emitFaceStatus("idle", 0);
    call.resolve();
  }

  private void stopCamera() {
    qrActive = false;
    faceActive = false;
    if (imageAnalysis != null) {
      imageAnalysis.clearAnalyzer();
      imageAnalysis = null;
    }
    if (cameraProvider != null) {
      cameraProvider.unbindAll();
      cameraProvider = null;
    }
    if (barcodeScanner != null) {
      barcodeScanner.close();
      barcodeScanner = null;
    }
    if (faceDetector != null) {
      faceDetector.close();
      faceDetector = null;
    }
    if (cameraExecutor != null) {
      cameraExecutor.shutdown();
      cameraExecutor = null;
    }
  }

  private void emitQrStatus(String phase, int progress) {
    JSObject js = new JSObject();
    js.put("phase", phase);
    js.put("progress", progress);
    notifyListeners("qrStatus", js);
  }

  private void emitFaceStatus(String phase, int progress) {
    JSObject js = new JSObject();
    js.put("phase", phase);
    js.put("progress", progress);
    notifyListeners("faceStatus", js);
  }

  private void emitQrDetected(String text) {
    JSObject det = new JSObject();
    det.put("text", text);
    notifyListeners("qrDetected", det);
  }

  private void emitFaceDetected(boolean stable) {
    JSObject det = new JSObject();
    det.put("stable", stable);
    notifyListeners("faceDetected", det);
  }

  private void startCameraForQR(PluginCall call) {
    qrActive = true;
    faceActive = false;
    try {
      if (cameraExecutor == null) cameraExecutor = Executors.newSingleThreadExecutor();
      ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(getContext());
      cameraProviderFuture.addListener(() -> {
        try {
          cameraProvider = cameraProviderFuture.get();
          bindQrUseCase();
          call.resolve();
        } catch (Exception ex) {
          call.reject("Failed to start camera: " + ex.getMessage());
        }
      }, ContextCompat.getMainExecutor(getContext()));
    } catch (Exception e) {
      call.reject("Camera init error: " + e.getMessage());
    }
  }

  private void bindQrUseCase() {
    if (cameraProvider == null) return;
    cameraProvider.unbindAll();

    CameraSelector selector = new CameraSelector.Builder()
      .requireLensFacing(CameraSelector.LENS_FACING_BACK)
      .build();

    imageAnalysis = new ImageAnalysis.Builder()
      .setTargetResolution(new Size(1280, 720))
      .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
      .build();

    BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
      .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
      .build();
    barcodeScanner = BarcodeScanning.getClient(options);

    imageAnalysis.setAnalyzer(cameraExecutor, new ImageAnalysis.Analyzer() {
      @Override
      @SuppressLint("UnsafeOptInUsageError")
      public void analyze(@NonNull ImageProxy image) {
        try {
          if (!qrActive) { image.close(); return; }
          if (image.getImage() == null) { image.close(); return; }
          InputImage input = InputImage.fromMediaImage(image.getImage(), image.getImageInfo().getRotationDegrees());
          barcodeScanner.process(input)
            .addOnSuccessListener(barcodes -> {
              long elapsed = System.currentTimeMillis() - qrStartMs;
              int prog = (int) Math.min(70, elapsed / 15); // approx smooth progress
              emitQrStatus("scanning", Math.max(10, prog));
              if (barcodes != null && !barcodes.isEmpty()) {
                Barcode b = barcodes.get(0);
                String raw = b.getRawValue();
                if (raw != null && elapsed > 1200) {
                  // Pause analysis while verifying
                  qrActive = false;
                  emitQrStatus("verifying", 85);
                  mainHandler.postDelayed(() -> {
                    emitQrStatus("success", 100);
                    emitQrDetected(raw);
                  }, 800);
                }
              }
            })
            .addOnFailureListener(_e -> { /* ignore */ })
            .addOnCompleteListener(_t -> image.close());
        } catch (Exception ex) {
          image.close();
        }
      }
    });

    cameraProvider.bindToLifecycle((LifecycleOwner) getActivity(), selector, imageAnalysis);
  }

  private void startCameraForFace(PluginCall call) {
    faceActive = true;
    qrActive = false;
    try {
      if (cameraExecutor == null) cameraExecutor = Executors.newSingleThreadExecutor();
      ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(getContext());
      cameraProviderFuture.addListener(() -> {
        try {
          cameraProvider = cameraProviderFuture.get();
          bindFaceUseCase();
          call.resolve();
        } catch (Exception ex) {
          call.reject("Failed to start camera: " + ex.getMessage());
        }
      }, ContextCompat.getMainExecutor(getContext()));
    } catch (Exception e) {
      call.reject("Camera init error: " + e.getMessage());
    }
  }

  private void bindFaceUseCase() {
    if (cameraProvider == null) return;
    cameraProvider.unbindAll();

    CameraSelector selector = new CameraSelector.Builder()
      .requireLensFacing(CameraSelector.LENS_FACING_FRONT)
      .build();

    imageAnalysis = new ImageAnalysis.Builder()
      .setTargetResolution(new Size(1280, 720))
      .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
      .build();

    FaceDetectorOptions opts = new FaceDetectorOptions.Builder()
      .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
      .setContourMode(FaceDetectorOptions.CONTOUR_MODE_NONE)
      .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_NONE)
      .build();
    faceDetector = FaceDetection.getClient(opts);

    imageAnalysis.setAnalyzer(cameraExecutor, new ImageAnalysis.Analyzer() {
      int stableFrames = 0;
      @Override
      @SuppressLint("UnsafeOptInUsageError")
      public void analyze(@NonNull ImageProxy image) {
        try {
          if (!faceActive) { image.close(); return; }
          if (image.getImage() == null) { image.close(); return; }
          InputImage input = InputImage.fromMediaImage(image.getImage(), image.getImageInfo().getRotationDegrees());
          faceDetector.process(input)
            .addOnSuccessListener(faces -> {
              long elapsed = System.currentTimeMillis() - faceStartMs;
              int prog = (int) Math.min(70, elapsed / 20);
              emitFaceStatus("scanning", Math.max(10, prog));
              boolean any = faces != null && !faces.isEmpty();
              if (any) { stableFrames++; } else { stableFrames = Math.max(0, stableFrames - 1); }
              boolean enoughTime = elapsed > 1500;
              if (stableFrames >= 5 && enoughTime) {
                faceActive = false;
                emitFaceDetected(true);
                emitFaceStatus("verifying", 85);
                mainHandler.postDelayed(() -> emitFaceStatus("success", 100), 800);
              }
            })
            .addOnFailureListener(_e -> { /* ignore */ })
            .addOnCompleteListener(_t -> image.close());
        } catch (Exception ex) {
          image.close();
        }
      }
    });

    cameraProvider.bindToLifecycle((LifecycleOwner) getActivity(), selector, imageAnalysis);
  }
}
