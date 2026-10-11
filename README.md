<p align="center">
  <img src="assets/logo.png" alt="App icon" width="120" />
</p>

<h1 align="center">Rośliny - fiszki</h1>

<p align="center">
  Offline flashcards for learning plants: Polish name, Latin name, family and photos.<br />
  Made for studying gardening and horticulture subjects.
</p>

---

## Features

- **Cards with photos**: each card has a Polish name, a Latin name, an optional plant family (Polish and Latin) and one or more photos.
  Photos come from the camera or the gallery and are downscaled automatically (max 1280 px).
- **Bulk add**: pick many photos at once, and each one becomes a card where you just type the names.
- **Folders**: group cards (e.g. per exam or topic). A card can be in several folders. Inside a folder, _Choose cards_
  opens a checklist for adding or removing many existing cards at once.
- **Three study modes** with flip cards:

  | Mode                      | Front                            | Back                  |
  | ------------------------- | -------------------------------- | --------------------- |
  | Name + photo → other name | photo + Polish **or** Latin name | the other name        |
  | Photo → both names        | photo                            | Polish and Latin name |
  | Both names → family       | Polish and Latin name            | Polish and Latin family |

  Tap to flip, then **swipe right** if you know it or **swipe left** if you don't (on a computer: ← / → keys, space to flip).
  Unknown cards come back until you know them all, and you can then repeat only the missed ones.
  Practise all cards or only selected folders, in random or fixed order.

- **Backup**: export everything (cards, folders, photos) to a single file and import it back, also on another phone.
- **Polish / English interface**. Card contents are never translated.
- **Theme color**: pick one of the presets or any color; text contrast adjusts automatically.
- **Works fully offline.** No account, no ads, no tracking.

## Install (Android)

1. Download `app-release.apk` from the [Releases](../../releases) page on your phone.
2. Open it and allow installing apps from that source when Android asks.

Newer versions install over the old one and keep your cards.

## Privacy

The app collects and sends **no data**. Cards, photos and settings are stored only on the device (IndexedDB inside
the app). Data leaves the phone only when you export a backup yourself.

## Tech stack

[Ionic 9](https://ionicframework.com/) · [Angular 22](https://angular.dev/) (standalone components, signals) ·
[Capacitor 8](https://capacitorjs.com/) (Android) · IndexedDB for storage

```
src/app/
  cards/        card list, search, folder filter
  card-edit/    create / edit a card
  bulk-add/     add many cards from photos
  learn/        study-mode selection
  study/        flip-card session
  settings/     language, backup, about
  services/     storage (IndexedDB), backup, translations, folder dialogs, image resizing
  shared/       folder chip picker
assets/         app icon source (used by @capacitor/assets to generate the Android icons)
android/        native Android project (Capacitor)
```

## Development

Requirements:

- **Node.js ≥ 22.22.3 or ≥ 24.15** (required by Angular 22)
- For Android builds: the **Android SDK** and a **JDK 17+** to run Gradle. Some Capacitor plugins need exactly JDK 21;
  if it isn't installed, Gradle downloads it automatically (foojay toolchain resolver in `android/settings.gradle`).

```bash
npm install
npm start            # dev server at http://localhost:4200
```

## Building the Android app

```bash
npm run build                     # build the web app into www/
npx cap sync android              # copy it into the Android project
cd android
./gradlew assembleRelease         # → android/app/build/outputs/apk/release/app-release.apk
```

`./gradlew assembleDebug` builds a debug APK instead, signed with the local debug key.
To install straight onto a phone connected over USB (with USB debugging on), run `npx cap run android`.

### Release signing

Release APKs are signed with a private key that is **not** part of the repository.
Copy `android/keystore.properties.example` to `android/keystore.properties` and follow the instructions in it.
Without that file, `assembleRelease` produces an unsigned APK that Android won't install.

> Keep the keystore and its passwords backed up. Android installs an update over an existing app only if it is
> signed with the same key. A lost key means users must uninstall (after exporting a backup) and reinstall.

### Versioning

The version is set once in `package.json` (`"version": "1.2.3"`). The Android build reads it and derives the
`versionCode` (1.2.3 → 10203), and the app shows it in _Settings → About_. Bump it before every release.

### App icon

The icon source is `assets/logo.png`. To regenerate the Android icons and splash screens after changing it:

```bash
npx @capacitor/assets generate --android --iconBackgroundColor "#ffaec9" --splashBackgroundColor "#ffaec9"
```

## Backup file format

Exported backups are JSON:

```json
{ "app": "plant-flashcards", "format": 1, "exportedAt": "…", "folders": [], "cards": [] }
```

Photos are embedded as JPEG data URLs. Import validates every field, accepts files up to 200 MB and merges by id:
existing cards with the same id are overwritten, and nothing is deleted. Temporary export files are removed from the
app's cache on the next export and on app start.

## Third-party licenses

The app is built with open-source libraries (Angular, Ionic, Ionicons, Capacitor: MIT; RxJS: Apache-2.0;
tslib: 0BSD). They are also listed in _Settings → About_.
