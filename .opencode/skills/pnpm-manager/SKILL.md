# pnpm-manager

Trigger: `pnpm manager`, `pnpmconfig`, `pnpm config`, `auto-start pnpm`, `pnpm custom commands`

PNPM Manager VSCode eklentisi için `pnpmconfig.json` yapılandırma dosyasını oluşturma, düzenleme ve doğrulama.

## Yapılandırma Şeması

```json
{
  "autoStart": {
    "enabled": true,
    "scripts": ["dev", "dev && test"]
  },
  "customCommands": [
    {
      "name": "Full Build",
      "command": "build && test && lint",
      "description": "Complete build process with tests and linting",
      "autoStart": true
    }
  ],
  "settings": {
    "showNotifications": true,
    "autoInstallOnOpen": false
  }
}
```

## TypeScript Interface

```typescript
interface PnpmConfig {
  autoStart?: {
    enabled: boolean;           // Otomatik başlatma aktif mi
    scripts: string[];          // VSCode açıldığında çalışacak scriptler
  };
  customCommands?: Array<{
    name: string;               // Menüde görünen isim
    command: string;            // pnpm komutu (&& destekler)
    description?: string;       // Açıklama (opsiyonel)
    autoStart?: boolean;        // Başlangıçta çalışsın mı
  }>;
  settings?: {
    showNotifications?: boolean;   // Bildirim göster (varsayılan: true)
    autoInstallOnOpen?: boolean;   // Açılışta pnpm install çalıştır (varsayılan: false)
  };
}
```

## Davranış Kuralları

1. **package.json oku**: Kullanıcının `package.json` dosyasındaki `scripts` alanını tara, mevcut scriptleri öğren.
2. **Öneriler**: Auto-start için `dev`, `watch`, `build` gibi yaygın scriptleri öner.
3. **Minimal yapılandırma**: Sadece kullanıcının istediği alanları ekle, varsayılan değerleri yazma.
4. **Geçerlilik**: JSON geçerli olmalı, tüm anahtarlar camelCase.
5. **Dosya yolu**: Her zaman `{projeKökü}/pnpmconfig.json`.
6. **PNPM özel**: Komutlar otomatik olarak `pnpm` öneki ile çalışır, npm/yarn desteklenmez.

## Hızlı Örnekler

**Sadece auto-start:**
```json
{
  "autoStart": {
    "enabled": true,
    "scripts": ["dev"]
  }
}
```

**Tam yapılandırma:**
```json
{
  "autoStart": {
    "enabled": true,
    "scripts": ["dev", "test"]
  },
  "customCommands": [
    {
      "name": "CI Check",
      "command": "build && test && lint",
      "description": "Tam CI pipeline kontrolü"
    }
  ],
  "settings": {
    "showNotifications": false,
    "autoInstallOnOpen": true
  }
}
```
