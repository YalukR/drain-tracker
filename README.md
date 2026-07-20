# drain-tracker

A free, open-source app to log surgical drain output after mastectomy or any procedure requiring drains.

![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)
![Non-profit](https://img.shields.io/badge/purpose-non--profit-green)
![Built with Angular](https://img.shields.io/badge/built%20with-Angular-red)
![Capacitor](https://img.shields.io/badge/packaged%20with-Capacitor-119EFF)

---

## Why this exists

After a mastectomy or similar surgery, patients need to monitor and record the output from their surgical drains every day — volume, color, date, time. My mom was doing this on paper, so I built her an app.

This project is born from love, and it's meant to stay free, forever.

---

## Features

- Log drain output by date, time, volume, and color
- View history and stats over time
- Export records as PDF
- Local storage — no account required, no data leaves your device
- Packaged as a native app with [Capacitor](https://capacitorjs.com/) (Android; iOS support planned)

---

## Platform

This is an Angular app packaged with **Capacitor** into a native mobile app — it's built and tested to run installed on your phone, not as a website.

It *can* run in a regular browser (`ng serve` / a static deploy) for quick testing, but browser mode isn't the intended experience: things like native file sharing, notifications, and local storage behave differently there, and some features may not work as expected. If you want the real experience, build and install the native app (see below).

---

## Getting started

### Prerequisites

- Node.js 18+
- Angular CLI
- For native builds: [Android Studio](https://developer.android.com/studio) (Android SDK) — and Xcode if/when iOS support lands

```bash
npm install -g @angular/cli
```

### Install & run in browser (for development only)

```bash
git clone https://github.com/YalukR/drain-tracker.git
cd drain-tracker
npm install
ng serve
```

Open your browser at `http://localhost:4200`. Remember: this is for quick iteration, not the intended way to use the app.

### Build & run the native Android app

```bash
ng build
npx cap sync android
npx cap open android
```

This opens the project in Android Studio, where you can run it on an emulator or a connected device.

---

## Built with

- [Angular](https://angular.io/)
- [Capacitor](https://capacitorjs.com/)
- [PrimeNG](https://primeng.org/) + [Tailwind CSS](https://tailwindcss.com/)

---

## Contributing

Contributions are welcome. This is an open-source, non-profit project — if you're a developer, designer, or healthcare professional who wants to help, feel free to open an issue or a pull request.

---

## License

GNU Affero General Public License v3.0 — see [LICENSE](./LICENSE) for details.

---

## Dedication

This app was made for my mom. For everyone going through recovery — you're not alone.

---

---

# drain-tracker (Español)

App gratuita y de código abierto para registrar el drenaje quirúrgico después de una mastectomía o cualquier cirugía que requiera drenajes.

---

## Por qué existe

Después de una mastectomía u otra cirugía similar, los pacientes necesitan registrar diariamente el drenaje: volumen, color, fecha y hora. Mi mamá lo hacía en papel, así que le hice una app.

Este proyecto nació del amor, y está pensado para ser gratuito, siempre.

---

## Funcionalidades

- Registrar drenaje por fecha, hora, volumen y color
- Ver historial y estadísticas
- Exportar registros en PDF
- Almacenamiento local — sin cuenta, sin datos en la nube
- Empaquetada como app nativa con [Capacitor](https://capacitorjs.com/) (Android; soporte para iOS planeado)

---

## Plataforma

Esta es una app de Angular empaquetada con **Capacitor** en una app nativa — está pensada y probada para correr instalada en tu teléfono, no como sitio web.

Sí *puede* correr en un navegador normal (`ng serve` o un deploy estático) para pruebas rápidas, pero el modo navegador no es la experiencia pensada: cosas como compartir archivos nativo, notificaciones y almacenamiento local se comportan distinto ahí, y algunas funciones pueden no comportarse como se espera. Si quieres la experiencia real, compila e instala la app nativa (ver abajo).

---

## Cómo usarlo

### Requisitos

- Node.js 18+
- Angular CLI
- Para builds nativos: [Android Studio](https://developer.android.com/studio) (Android SDK) — y Xcode si/cuando llegue soporte para iOS

```bash
npm install -g @angular/cli
```

### Instalación y ejecución en navegador (solo para desarrollo)

```bash
git clone https://github.com/YalukR/drain-tracker.git
cd drain-tracker
npm install
ng serve
```

Abre tu navegador en `http://localhost:4200`. Recuerda: esto es para iterar rápido, no la forma pensada de usar la app.

### Compilar y correr la app nativa de Android

```bash
ng build
npx cap sync android
npx cap open android
```

Esto abre el proyecto en Android Studio, donde puedes correrlo en un emulador o un dispositivo conectado.

---

## Construida con

- [Angular](https://angular.io/)
- [Capacitor](https://capacitorjs.com/)
- [PrimeNG](https://primeng.org/) + [Tailwind CSS](https://tailwindcss.com/)

---

## Contribuir

Las contribuciones son bienvenidas. Si eres desarrollador/a, diseñador/a o profesional de la salud y quieres ayudar, abre un issue o un pull request.

---

## Licencia

GNU Affero General Public License v3.0 — ver [LICENSE](./LICENSE) para más detalles.

---

## Dedicatoria

Esta app fue hecha para mi mamá. Para todos los que están en recuperación — no están solos.