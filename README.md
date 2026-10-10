# Rośliny - fiszki

Offline flashcards for learning plants: Polish name, Latin name and photos.
Ionic 9 + Angular 22 + Capacitor 8. All data lives on the device (IndexedDB), with no backend and no account.

## Features

- **Karty**: list with search, create, edit and delete (swipe left or use the trash icon in edit).
  A card can have several photos; in study mode one is picked at random.
- **Foldery**: the chip row under the search bar filters the list by folder; _+ Folder_ creates one, and ⋮ renames or deletes
  the selected folder (its cards are kept). A card can be in several folders. Assign them in the card editor or once for all cards in bulk add.
  New cards added while a folder is open go into it automatically.
- **Wiele** (bulk add): pick many photos at once, and each becomes a card. Type the names and save.
- **Nauka**:
  - _Nazwa + zdjęcie → druga nazwa_: the front shows a photo plus the Polish **or** Latin name (you choose); tap to flip to the other name.
  - _Zdjęcie → obie nazwy_: the front shows the photo only; tap to flip to both names.
  - _Obie nazwy → rodzina_: the front shows the Polish and Latin names; tap to flip to the plant family.
    Only cards with the (optional) _Rodzina_ field filled in are used.
  - _Zakres_: pick folders to practise only their cards (none selected means all cards).
  - After flipping, mark _Wiem_ / _Nie wiem_. Unknown cards come back at the end of the session.
    The summary lets you repeat only the missed ones.
- **Ustawienia / Settings**:
  - App language (Polski / English). This affects only the interface, never the card contents.
  - **Backup**: _Export_ writes all cards, folders and photos to one `fiszki-backup-YYYY-MM-DD.json` file and opens
    Android's share sheet (save to Google Drive, Files/Downloads, e-mail…). _Import_ reads such a file and merges it:
    cards with the same id are overwritten, others are added, and nothing is deleted.
  - Buy me a coffee link (buycoffee.to/basik).

Photos are downscaled to max 1280 px (JPEG) before saving, so storage stays small.

## Requirements

- **Node.js ≥ 22.22.3 or ≥ 24.15** (Angular 22 requirement)
- JDK 17+ to run Gradle, plus the Android SDK. Some Capacitor plugins need exactly JDK 21; if it isn't installed,
  Gradle downloads it automatically (foojay toolchain resolver in `android/settings.gradle`).

## Develop in the browser

```bash
npm install
npm start          # http://localhost:4200
```

## Build and install on the phone

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK ends up at `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to the phone
(USB, Google Drive, e-mail…) and open it. Android will ask to allow installing from that source.

Alternatively, connect the phone with USB debugging enabled and run `npx cap run android`,
or open the `android` folder in Android Studio and press Run.

## Updates and data

App id: `pl.plantflashcards`. Cards are stored only on the phone.

- **Updating**: install the newer APK over the old one, and the data is kept. Database changes are migrated on first launch.
  This only works with the same app id and the same signing key (`~/.android/debug.keystore` on the build PC), so back up that file.
- **Data is lost** when the app is uninstalled, its storage is cleared, or a differently signed APK forces a reinstall.
  The safety net is **Settings → Export backup**, and **Import backup** restores it (also on a new phone).
