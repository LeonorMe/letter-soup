# Letter Soup 🍲

Multi-platform word search puzzle game.

## Project Structure

- `web/`: React PWA implementation (Vite + Vanilla CSS).
- `android/`: Native Android implementation (Kotlin Multi-module).
    - `:core`: Shared gameplay logic and engine.
    - `:app-xml`: Classic Android Views UI.
    - `:app-compose`: Modern Jetpack Compose UI.

## Getting Started

### Web
1. Navigate to `web/`
2. Run `npm install`
3. Run `npm run dev`

### Android
1. Open the `android/` directory in Android Studio.
2. The IDE will automatically sync Gradle and download dependencies.
3. Choose either the `app-xml` or `app-compose` run configuration to deploy to an emulator or device.

## Core Features (Android)
- **Shared Engine**: Both Android apps use the same `:core` logic for grid generation and word validation.
- **Compose Exclusives**: The Compose version includes smooth animations and a more responsive grid.
- **XML Stability**: The XML version provides a rock-solid classic implementation using RecyclerView.
