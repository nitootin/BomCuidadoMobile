const { withAndroidManifest, withDangerousMod, withMainApplication } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MODULE_FILES = {
  'EmergencyOverlayModule.java': `package __PACKAGE_NAME__;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class EmergencyOverlayModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public EmergencyOverlayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "EmergencyOverlay";
    }

    @ReactMethod
    public void canDrawOverlays(Promise promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            promise.resolve(true);
            return;
        }

        promise.resolve(Settings.canDrawOverlays(reactContext));
    }

    @ReactMethod
    public void openOverlaySettings() {
        Intent intent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            intent = new Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactContext.getPackageName())
            );
        } else {
            intent = new Intent(Settings.ACTION_SETTINGS);
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void startOverlay(String phoneNumber, Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
            promise.reject("MISSING_OVERLAY_PERMISSION", "Permissao para aparecer sobre outros apps nao concedida.");
            return;
        }

        Intent intent = new Intent(reactContext, EmergencyOverlayService.class);
        intent.putExtra(EmergencyOverlayService.EXTRA_PHONE_NUMBER, phoneNumber);
        reactContext.startService(intent);
        promise.resolve(true);
    }

    @ReactMethod
    public void stopOverlay(Promise promise) {
        Intent intent = new Intent(reactContext, EmergencyOverlayService.class);
        reactContext.stopService(intent);
        promise.resolve(true);
    }
}
`,
  'EmergencyOverlayPackage.java': `package __PACKAGE_NAME__;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EmergencyOverlayPackage implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new EmergencyOverlayModule(reactContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
`,
  'EmergencyOverlayService.java': `package __PACKAGE_NAME__;

import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

public class EmergencyOverlayService extends Service {
    public static final String EXTRA_PHONE_NUMBER = "phoneNumber";

    private WindowManager windowManager;
    private TextView emergencyButton;
    private WindowManager.LayoutParams layoutParams;
    private String phoneNumber = "";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getStringExtra(EXTRA_PHONE_NUMBER) != null) {
            phoneNumber = intent.getStringExtra(EXTRA_PHONE_NUMBER);
        }

        if (!canDrawOverlays()) {
            stopSelf();
            return START_NOT_STICKY;
        }

        showOverlay();
        return START_STICKY;
    }

    private boolean canDrawOverlays() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this);
    }

    private void showOverlay() {
        if (emergencyButton != null) return;

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        emergencyButton = new TextView(this);
        emergencyButton.setText("SOS");
        emergencyButton.setTextColor(Color.WHITE);
        emergencyButton.setTextSize(16);
        emergencyButton.setTypeface(Typeface.DEFAULT_BOLD);
        emergencyButton.setGravity(Gravity.CENTER);
        emergencyButton.setBackgroundColor(Color.rgb(211, 47, 47));
        emergencyButton.setElevation(dp(8));
        emergencyButton.setContentDescription("Botao de emergencia BomCuidado");

        int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;

        layoutParams = new WindowManager.LayoutParams(
                dp(72),
                dp(72),
                overlayType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );
        layoutParams.gravity = Gravity.TOP | Gravity.START;
        layoutParams.x = dp(18);
        layoutParams.y = dp(140);

        emergencyButton.setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;
            private boolean moved;

            @Override
            public boolean onTouch(View view, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = layoutParams.x;
                        initialY = layoutParams.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        moved = false;
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int deltaX = Math.round(event.getRawX() - initialTouchX);
                        int deltaY = Math.round(event.getRawY() - initialTouchY);
                        if (Math.abs(deltaX) > dp(4) || Math.abs(deltaY) > dp(4)) {
                            moved = true;
                        }
                        layoutParams.x = initialX + deltaX;
                        layoutParams.y = initialY + deltaY;
                        windowManager.updateViewLayout(emergencyButton, layoutParams);
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (!moved) {
                            view.performClick();
                        }
                        return true;
                    default:
                        return false;
                }
            }
        });

        emergencyButton.setOnClickListener(view -> callEmergencyContact());
        windowManager.addView(emergencyButton, layoutParams);
    }

    private void callEmergencyContact() {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) return;

        Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + phoneNumber));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (windowManager != null && emergencyButton != null) {
            windowManager.removeView(emergencyButton);
            emergencyButton = null;
        }
    }
}
`
};

function addManifestPermission(androidManifest, permission) {
  const manifest = androidManifest.manifest;
  const existing = manifest['uses-permission'] || [];
  const hasPermission = existing.some((item) => item.$?.['android:name'] === permission);

  if (!hasPermission) {
    existing.push({ $: { 'android:name': permission } });
    manifest['uses-permission'] = existing;
  }
}

function enableCleartextTraffic(androidManifest) {
  const application = androidManifest.manifest.application?.[0];
  if (!application) return;

  application.$ = application.$ || {};
  application.$['android:usesCleartextTraffic'] = 'true';
}

function addOverlayService(androidManifest) {
  const application = androidManifest.manifest.application?.[0];
  if (!application) return;

  const services = application.service || [];
  const hasService = services.some((service) => service.$?.['android:name'] === '.EmergencyOverlayService');

  if (!hasService) {
    services.push({
      $: {
        'android:name': '.EmergencyOverlayService',
        'android:exported': 'false'
      }
    });
    application.service = services;
  }
}

function addPackageToMainApplication(contents, packageName) {
  const packageConstructor = `new ${packageName}.EmergencyOverlayPackage()`;
  const kotlinPackageConstructor = `${packageName}.EmergencyOverlayPackage()`;

  if (contents.includes('EmergencyOverlayPackage')) return contents;

  if (contents.includes('PackageList(this).packages.apply {')) {
    return contents.replace(
      'PackageList(this).packages.apply {',
      `PackageList(this).packages.apply {\n              add(${kotlinPackageConstructor})`
    );
  }

  if (contents.includes('val packages = PackageList(this).packages')) {
    return contents.replace(
      /(val packages = PackageList\(this\)\.packages\s*)/,
      `$1\n            packages.add(${kotlinPackageConstructor})`
    );
  }

  if (contents.includes('new PackageList(this).getPackages()')) {
    return contents.replace(
      /(List<ReactPackage> packages = new PackageList\(this\)\.getPackages\(\);\s*)/,
      `$1\n            packages.add(${packageConstructor});`
    );
  }

  return contents;
}

function writeNativeFiles(projectRoot, packageName) {
  const javaRoot = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java');
  const packagePath = path.join(javaRoot, ...packageName.split('.'));
  fs.mkdirSync(packagePath, { recursive: true });

  for (const [fileName, template] of Object.entries(MODULE_FILES)) {
    fs.writeFileSync(path.join(packagePath, fileName), template.replaceAll('__PACKAGE_NAME__', packageName));
  }
}

module.exports = function withEmergencyOverlay(config) {
  config = withAndroidManifest(config, (config) => {
    addManifestPermission(config.modResults, 'android.permission.SYSTEM_ALERT_WINDOW');
    addManifestPermission(config.modResults, 'android.permission.CALL_PHONE');
    enableCleartextTraffic(config.modResults);
    addOverlayService(config.modResults);
    return config;
  });

  config = withMainApplication(config, (config) => {
    const packageName = config.android?.package;
    if (!packageName) return config;

    config.modResults.contents = addPackageToMainApplication(config.modResults.contents, packageName);
    return config;
  });

  config = withDangerousMod(config, ['android', async (config) => {
    const packageName = config.android?.package;
    if (!packageName) return config;

    writeNativeFiles(config.modRequest.projectRoot, packageName);
    return config;
  }]);

  return config;
};
