# Plan de Implementación: Conversión de EnglishPan a PWA (Progressive Web App)

Convertir la aplicación web EnglishPan en una Aplicación Web Progresiva (PWA) instalable en Android, iOS y escritorio, con soporte de Service Worker mediante `vite-plugin-pwa`, manifiesto de aplicación web personalizado, botón de instalación en la barra superior y alerta de actualización de versión.

## User Review Required

> [!IMPORTANT]
> **Generación de Iconos de la PWA**: Para completar la experiencia PWA e instalabilidad en iOS y Android, se requieren los siguientes assets en la carpeta `public/`:
> 1. `pwa-192x192.png` (192x192 px)
> 2. `pwa-512x512.png` (512x512 px)
> 3. `apple-touch-icon.png` (180x180 px)
> 4. `pwa-maskable-512x512.png` (512x512 px con padding de seguridad)
> 
> En este plan incluiremos la generación de archivos PNG con el logo/estilo de EnglishPan en `public/` para que la app sea válida e instalable desde el inicio.

## Open Questions

> [!NOTE]
> ¿Tienes alguna preferencia sobre el diseño o color del icono de la PWA para EnglishPan (por ejemplo, basadas en el esquema oscuro actual `#0f172a` y azul)?

## Proposed Changes

### Dependencias y Configuración de Vite

#### [MODIFY] [package.json](file:///e:/Work/Antigravity/EnglishPan/package.json)
- Instalar la dependencia de desarrollo `vite-plugin-pwa`.

#### [MODIFY] [vite.config.ts](file:///e:/Work/Antigravity/EnglishPan/vite.config.ts)
- Importar e integrar el plugin `VitePWA`.
- Configurar el manifest web con el nombre `EnglishPAN - Aprende Inglés`, colores de tema `#0f172a`, modo `standalone`, orientación `portrait` e iconos requeridos.
- Configurar opciones de Workbox para el almacenamiento en caché de assets.

---

### Metadatos HTML y Tipos TypeScript

#### [MODIFY] [index.html](file:///e:/Work/Antigravity/EnglishPan/index.html)
- Agregar metadatos PWA e iOS (`theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, y enlace a `apple-touch-icon.png`).

#### [NEW] [src/pwa.d.ts](file:///e:/Work/Antigravity/EnglishPan/src/pwa.d.ts)
- Añadir la directiva `/// <reference types="vite-plugin-pwa/client" />` para que TypeScript reconozca los módulos virtuales del Service Worker.

---

### Componentes de la PWA e Interfaz de Usuario

#### [NEW] [src/hooks/usePWAInstall.ts](file:///e:/Work/Antigravity/EnglishPan/src/hooks/usePWAInstall.ts)
- Custom Hook para capturar el evento `beforeinstallprompt`, exponer el estado de instalabilidad y la función `promptInstall()` para ejecutar la instalación cuando el usuario haga click en el botón.

#### [NEW] [src/components/PWABadge.tsx](file:///e:/Work/Antigravity/EnglishPan/src/components/PWABadge.tsx)
- Componente modal/toast para notificar al usuario cuando hay una nueva versión lista y permitir actualizar la app al instante.

#### [MODIFY] [src/App.tsx](file:///e:/Work/Antigravity/EnglishPan/src/App.tsx)
- Integrar `<PWABadge />`.
- Agregar en la barra superior (junto al botón de cerrar sesión) el botón de **"Instalar App"** con icono `Download` / `Smartphone` de `lucide-react`, controlado por `usePWAInstall`.

---

### Assets e Iconografía PWA

#### [NEW] [public/pwa-192x192.png](file:///e:/Work/Antigravity/EnglishPan/public/pwa-192x192.png)
#### [NEW] [public/pwa-512x512.png](file:///e:/Work/Antigravity/EnglishPan/public/pwa-512x512.png)
#### [NEW] [public/apple-touch-icon.png](file:///e:/Work/Antigravity/EnglishPan/public/apple-touch-icon.png)
#### [NEW] [public/pwa-maskable-512x512.png](file:///e:/Work/Antigravity/EnglishPan/public/pwa-maskable-512x512.png)
- Generación de los iconos de EnglishPan en formato PNG con fondo `#0f172a` y estética acorde a la aplicación.

---

### Documentación de Especificación

#### [MODIFY] [spec/Feature PWA.md](file:///e:/Work/Antigravity/EnglishPan/spec/Feature%20PWA.md)
- Archivo corregido y refinado con la lista de verificación actualizada y entendible para el proyecto.

## Verification Plan

### Automated Tests & Build Verification
- Ejecutar `npm run build` para verificar que la compilación con TypeScript y VitePWA se realice sin errores.
- Verificar la generación de los archivos `dist/sw.js` y `dist/manifest.webmanifest`.

### Manual Verification
- Ejecutar `npm run preview` y abrir en el navegador.
- Inspeccionar en Chrome DevTools (`Application -> Manifest` y `Application -> Service Workers`) que el manifest sea válido y el Service Worker se registre adecuadamente.
- Probar el botón de instalación PWA en la barra de herramientas y la respuesta del prompt de instalación.
