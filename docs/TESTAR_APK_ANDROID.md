# Testar APK Android

Este projeto continua sendo React Native com Expo, mas o widget sobreposto usa codigo nativo Android gerado por config plugin. Ele nao funciona no Expo Go.

## 1. Gerar projeto Android nativo

```bash
npm run prebuild:android
```

Isso cria a pasta `android/` e injeta:

- `EmergencyOverlayModule`
- `EmergencyOverlayPackage`
- `EmergencyOverlayService`
- permissao `SYSTEM_ALERT_WINDOW`
- permissao `CALL_PHONE`
- service `.EmergencyOverlayService` no Manifest

## 2. Rodar no celular/emulador

Com um aparelho Android conectado por USB ou emulador aberto:

```bash
npm run android:dev
```

## 3. Ativar permissao do widget

No app, toque em `EMERGENCIA`.

Na primeira vez, o app abre a tela de permissao do Android. Ative:

```text
Aparecer sobre outros apps
```

Volte para o BomCuidado e toque em `EMERGENCIA` novamente.

## 4. Testar o overlay

Depois de ativar o widget:

1. Saia do app pelo botao Home.
2. Abra outra tela/app.
3. O botao `SOS` deve ficar sobreposto.
4. Arraste o botao para reposicionar.
5. Toque no `SOS` para abrir a ligacao para o contato emergencial.

## 5. Gerar APK debug

Depois do prebuild:

```bash
npm run apk:debug
```

O APK fica em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 6. Instalar APK manualmente

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Observacoes

- O overlay usa `WindowManager` com `TYPE_APPLICATION_OVERLAY` no Android 8+.
- O clique no overlay usa `ACTION_DIAL`, entao abre a tela de ligacao com o numero preenchido.
- Chamada direta sem confirmacao exige fluxo adicional de permissao runtime `CALL_PHONE` e uso de `ACTION_CALL`.

## Erro Network request failed

Como a API esta em `http://144.22.199.87:8080/api`, o APK precisa permitir trafego HTTP. O `app.json` esta configurado com `android.usesCleartextTraffic = true` e o config plugin tambem injeta `android:usesCleartextTraffic="true"` no Manifest. A URL padrao do APK tambem aponta para esse host publico; para usar uma API local no emulador Android, gere o app com `EXPO_PUBLIC_USE_ANDROID_EMULATOR_LOCALHOST=true`.

Depois dessa mudanca, gere outro APK:

```bash
npm run prebuild:android:clean
npm run apk:debug
```

Se ainda falhar, teste no navegador do proprio celular:

```text
http://144.22.199.87:8080/api
```

Se o celular nao conseguir abrir esse endereco, o problema e rede/firewall/backend fora do ar, nao o app.
