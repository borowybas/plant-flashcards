import { Injectable, effect, signal } from '@angular/core';

export type Lang = 'pl' | 'en';

const PL = {
  'tabs.cards': 'Karty',
  'tabs.learn': 'Nauka',
  'tabs.settings': 'Ustawienia',

  'common.cancel': 'Anuluj',
  'common.save': 'Zapisz',
  'common.delete': 'Usuń',
  'common.polishName': 'Nazwa polska',
  'common.latinName': 'Nazwa łacińska',
  'common.familyPl': 'Rodzina (polska)',
  'common.familyLa': 'Rodzina (łacińska)',
  'common.removePhoto': 'Usuń zdjęcie',

  'cards.title': 'Karty',
  'cards.bulk': 'Wiele',
  'cards.bulkAria': 'Dodaj wiele kart ze zdjęć',
  'cards.search': 'Szukaj (nazwa lub rodzina)',
  'cards.all': 'Wszystkie',
  'cards.folderOptions': 'Opcje folderu',
  'cards.newFolder': 'Nowy folder',
  'cards.folderChip': 'Folder',
  'cards.empty.title': 'Brak kart',
  'cards.empty.text': 'Dodaj pierwszą roślinę przyciskiem + albo dodaj od razu wiele zdjęć przyciskiem „Wiele”.',
  'cards.notFound': 'Nic nie znaleziono dla „{q}”.',
  'cards.folderEmpty': 'Folder jest pusty. Dodaj nową kartę przyciskiem + albo wybierz istniejące karty.',
  'cards.photos': '{n} zdj.',
  'cards.add': 'Dodaj kartę',
  'cards.deleteConfirm': 'Usunąć kartę?',
  'cards.rename': 'Zmień nazwę',
  'cards.deleteFolder': 'Usuń folder',

  'assign.title': 'Wybierz karty',
  'assign.selectAll': 'Zaznacz wszystkie',
  'assign.selectNone': 'Odznacz',
  'assign.selected': 'Wybrano: {n}',

  'folders.new': 'Nowy folder',
  'folders.rename': 'Zmień nazwę folderu',
  'folders.placeholder': 'np. Egzamin - drzewa',
  'folders.deleteConfirm': 'Usunąć folder „{name}”?',
  'folders.deleteNote': 'Karty z tego folderu nie zostaną usunięte.',

  'edit.titleNew': 'Nowa karta',
  'edit.titleEdit': 'Edytuj kartę',
  'edit.delete': 'Usuń kartę',
  'edit.polishPlaceholder': 'np. Klon zwyczajny',
  'edit.latinPlaceholder': 'np. Acer platanoides',
  'edit.familyPlPlaceholder': 'np. Mydleńcowate',
  'edit.familyLaPlaceholder': 'np. Sapindaceae',
  'edit.folders': 'Foldery',
  'edit.photos': 'Zdjęcia',
  'edit.addPhoto': 'Dodaj',
  'edit.photosHint': 'Możesz wybrać kilka zdjęć naraz. W trybie nauki pokazywane jest losowe zdjęcie z karty.',
  'edit.namesRequired': 'Uzupełnij nazwę polską i łacińską.',
  'edit.imageError': 'Nie można wczytać obrazu: {name}',

  'bulk.title': 'Dodaj wiele',
  'bulk.pick': 'Wybierz zdjęcia',
  'bulk.folders': 'Dodaj do folderów',
  'bulk.hint':
    'Każde zdjęcie tworzy osobną kartę. Wpisz nazwy i zapisz - karty bez obu nazw zostaną na liście. Kolejne zdjęcia do karty dodasz później w jej edycji.',
  'bulk.familyPlOptional': 'Rodzina polska (opcjonalnie)',
  'bulk.familyLaOptional': 'Rodzina łacińska (opcjonalnie)',
  'bulk.saveN': 'Zapisz {done} z {total}',
  'bulk.saved': 'Zapisano: {cards}.',
  'bulk.left': 'Pozostało {n} bez nazw.',

  'learn.title': 'Nauka',
  'learn.mode': 'Tryb nauki',
  'learn.mode.name': 'Nazwa + zdjęcie → druga nazwa',
  'learn.mode.nameDesc': 'Na przodzie zdjęcie i wybrana nazwa, po odwróceniu nazwa w drugim języku.',
  'learn.mode.image': 'Zdjęcie → obie nazwy',
  'learn.mode.imageDesc': 'Na przodzie tylko zdjęcie, po odwróceniu nazwa polska i łacińska.',
  'learn.mode.family': 'Obie nazwy → rodzina',
  'learn.mode.familyDesc': 'Na przodzie nazwa polska i łacińska, po odwróceniu nazwa rodziny – polska i łacińska.',
  'learn.front': 'Nazwa na przodzie karty',
  'learn.front.pl': 'Polska',
  'learn.front.la': 'Łacińska',
  'learn.scope': 'Zakres',
  'learn.scope.some': 'Tylko karty z zaznaczonych folderów.',
  'learn.scope.all': 'Nie zaznaczono folderu - wszystkie karty.',
  'learn.shuffle': 'Losowa kolejność',
  'learn.start': 'Start ({cards})',
  'learn.none.image': 'Brak kart ze zdjęciem w wybranym zakresie.',
  'learn.none.family': 'Brak kart z wpisaną rodziną w wybranym zakresie. Uzupełnij ją w edycji karty.',
  'learn.none.name': 'Brak kart w wybranym zakresie.',

  'study.left': 'Pozostało: {n} / {total}',
  'study.end': 'Koniec',
  'study.tapToFlip': 'Dotknij, aby odwrócić',
  'study.promptFamily': 'Do jakiej rodziny należy ta roślina?',
  'study.dontKnow': 'Nie wiem',
  'study.know': 'Wiem',
  'study.done': 'Gotowe!',
  'study.firstTry': 'Za pierwszym razem:',
  'study.toRepeat': 'Do powtórki:',
  'study.repeatMissed': 'Powtórz trudne ({n})',
  'study.restart': 'Wszystkie od nowa',
  'study.finish': 'Zakończ',

  'settings.title': 'Ustawienia',
  'settings.language': 'Język aplikacji',
  'settings.languageHint': 'Zmienia tylko teksty aplikacji - karty zostają tak, jak je wpisano.',
  'settings.theme': 'Kolor motywu',
  'settings.themeHint': 'Pierwsze kółko to kolor domyślny, ostatnie – dowolny kolor z palety.',
  'settings.themeDefault': 'Kolor domyślny',
  'settings.themeCustom': 'Własny kolor',
  'settings.backup': 'Kopia zapasowa',
  'settings.backupHint':
    'Karty są zapisane tylko na tym telefonie. Eksportuj je do jednego pliku (np. na Dysk Google lub do Pobranych), a w razie potrzeby przywróć importem - także na innym telefonie.',
  'settings.export': 'Eksportuj kopię',
  'settings.exportDesc': '{cards}, {folders}',
  'settings.import': 'Importuj kopię',
  'settings.importDesc': 'Dodaje karty z pliku. Nic nie jest usuwane.',
  'settings.support': 'Wsparcie',
  'settings.coffee': 'Postaw mi kawę',
  'settings.coffeeDesc': 'Jeśli aplikacja Ci pomaga, możesz wesprzeć jej rozwój.',
  'settings.exportDone': 'Kopia zapisana.',
  'settings.exportFailed': 'Nie udało się wyeksportować kopii.',
  'settings.importConfirm': 'Zaimportować kopię?',
  'settings.importSummary':
    'Plik zawiera: {cards}, {folders}. Karty o tym samym identyfikatorze zostaną nadpisane, pozostałe dodane. Nic nie zostanie usunięte.',
  'settings.importButton': 'Importuj',
  'settings.importDone': 'Zaimportowano: {cards}.',
  'settings.importInvalid': 'To nie jest plik kopii zapasowej tej aplikacji.',
  'settings.importTooLarge': 'Plik jest za duży (limit {mb} MB).',
  'settings.about': 'O aplikacji',
  'settings.version': 'Wersja {version}',
  'settings.privacyTitle': 'Prywatność',
  'settings.privacyText':
    'Aplikacja nie zbiera ani nie wysyła żadnych danych. Karty, zdjęcia i ustawienia są zapisane wyłącznie na tym urządzeniu. Nie ma kont, reklam ani analityki. Dane opuszczają telefon tylko wtedy, gdy sam wyeksportujesz kopię zapasową.',
  'settings.licensesTitle': 'Licencje open source',
  'settings.licensesText': 'Aplikacja korzysta z bibliotek open source, udostępnionych na poniższych licencjach:',
  'settings.folders1': '1 folder',
  'settings.foldersFew': '{n} foldery',
  'settings.foldersMany': '{n} folderów',
};

export type I18nKey = keyof typeof PL;

const EN: Record<I18nKey, string> = {
  'tabs.cards': 'Cards',
  'tabs.learn': 'Learn',
  'tabs.settings': 'Settings',

  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.polishName': 'Polish name',
  'common.latinName': 'Latin name',
  'common.familyPl': 'Family (Polish)',
  'common.familyLa': 'Family (Latin)',
  'common.removePhoto': 'Remove photo',

  'cards.title': 'Cards',
  'cards.bulk': 'Bulk',
  'cards.bulkAria': 'Add many cards from photos',
  'cards.search': 'Search (name or family)',
  'cards.all': 'All',
  'cards.folderOptions': 'Folder options',
  'cards.newFolder': 'New folder',
  'cards.folderChip': 'Folder',
  'cards.empty.title': 'No cards yet',
  'cards.empty.text': 'Add your first plant with the + button, or add many photos at once with “Bulk”.',
  'cards.notFound': 'Nothing found for “{q}”.',
  'cards.folderEmpty': 'This folder is empty. Add a new card with + or choose existing cards.',
  'cards.photos': '{n} photos',
  'cards.add': 'Add card',
  'cards.deleteConfirm': 'Delete card?',
  'cards.rename': 'Rename',
  'cards.deleteFolder': 'Delete folder',

  'assign.title': 'Choose cards',
  'assign.selectAll': 'Select all',
  'assign.selectNone': 'Clear',
  'assign.selected': 'Selected: {n}',

  'folders.new': 'New folder',
  'folders.rename': 'Rename folder',
  'folders.placeholder': 'e.g. Exam - trees',
  'folders.deleteConfirm': 'Delete folder “{name}”?',
  'folders.deleteNote': 'Cards in this folder will not be deleted.',

  'edit.titleNew': 'New card',
  'edit.titleEdit': 'Edit card',
  'edit.delete': 'Delete card',
  'edit.polishPlaceholder': 'e.g. Klon zwyczajny',
  'edit.latinPlaceholder': 'e.g. Acer platanoides',
  'edit.familyPlPlaceholder': 'e.g. Mydleńcowate',
  'edit.familyLaPlaceholder': 'e.g. Sapindaceae',
  'edit.folders': 'Folders',
  'edit.photos': 'Photos',
  'edit.addPhoto': 'Add',
  'edit.photosHint': 'You can pick several photos at once. Study mode shows a random photo of the card.',
  'edit.namesRequired': 'Fill in both the Polish and the Latin name.',
  'edit.imageError': 'Could not load image: {name}',

  'bulk.title': 'Add many',
  'bulk.pick': 'Pick photos',
  'bulk.folders': 'Add to folders',
  'bulk.hint':
    'Each photo becomes a separate card. Type the names and save - cards without both names stay on the list. You can add more photos to a card later in its editor.',
  'bulk.familyPlOptional': 'Polish family (optional)',
  'bulk.familyLaOptional': 'Latin family (optional)',
  'bulk.saveN': 'Save {done} of {total}',
  'bulk.saved': 'Saved: {cards}.',
  'bulk.left': '{n} left without names.',

  'learn.title': 'Learn',
  'learn.mode': 'Study mode',
  'learn.mode.name': 'Name + photo → other name',
  'learn.mode.nameDesc': 'The front shows the photo and the chosen name; flip it to see the name in the other language.',
  'learn.mode.image': 'Photo → both names',
  'learn.mode.imageDesc': 'The front shows only the photo; flip it to see the Polish and Latin names.',
  'learn.mode.family': 'Both names → family',
  'learn.mode.familyDesc': 'The front shows the Polish and Latin names; flip it to see the family in Polish and Latin.',
  'learn.front': 'Name on the front',
  'learn.front.pl': 'Polish',
  'learn.front.la': 'Latin',
  'learn.scope': 'Scope',
  'learn.scope.some': 'Only cards from the selected folders.',
  'learn.scope.all': 'No folder selected - all cards.',
  'learn.shuffle': 'Random order',
  'learn.start': 'Start ({cards})',
  'learn.none.image': 'No cards with a photo in the selected scope.',
  'learn.none.family': 'No cards with a family in the selected scope. Add it in the card editor.',
  'learn.none.name': 'No cards in the selected scope.',

  'study.left': 'Left: {n} / {total}',
  'study.end': 'Finished',
  'study.tapToFlip': 'Tap to flip',
  'study.promptFamily': 'Which family does this plant belong to?',
  'study.dontKnow': "Don't know",
  'study.know': 'Know it',
  'study.done': 'Done!',
  'study.firstTry': 'On the first try:',
  'study.toRepeat': 'To repeat:',
  'study.repeatMissed': 'Repeat missed ({n})',
  'study.restart': 'All again',
  'study.finish': 'Finish',

  'settings.title': 'Settings',
  'settings.language': 'App language',
  'settings.languageHint': 'Changes only the app texts - your cards stay as you entered them.',
  'settings.theme': 'Theme color',
  'settings.themeHint': 'The first circle is the default color, the last one lets you pick any color.',
  'settings.themeDefault': 'Default color',
  'settings.themeCustom': 'Custom color',
  'settings.backup': 'Backup',
  'settings.backupHint':
    'Cards are stored only on this phone. Export them to a single file (e.g. to Google Drive or Downloads) and restore with import when needed - also on another phone.',
  'settings.export': 'Export backup',
  'settings.exportDesc': '{cards}, {folders}',
  'settings.import': 'Import backup',
  'settings.importDesc': 'Adds cards from the file. Nothing is deleted.',
  'settings.support': 'Support',
  'settings.coffee': 'Buy me a coffee',
  'settings.coffeeDesc': 'If the app helps you, you can support its development.',
  'settings.exportDone': 'Backup saved.',
  'settings.exportFailed': 'Could not export the backup.',
  'settings.importConfirm': 'Import backup?',
  'settings.importSummary':
    'The file contains: {cards}, {folders}. Cards with the same id will be overwritten, the rest added. Nothing will be deleted.',
  'settings.importButton': 'Import',
  'settings.importDone': 'Imported: {cards}.',
  'settings.importInvalid': 'This is not a backup file of this app.',
  'settings.importTooLarge': 'The file is too large (limit {mb} MB).',
  'settings.about': 'About',
  'settings.version': 'Version {version}',
  'settings.privacyTitle': 'Privacy',
  'settings.privacyText':
    'The app does not collect or send any data. Cards, photos and settings are stored only on this device. There are no accounts, ads or analytics. Data leaves the phone only when you export a backup yourself.',
  'settings.licensesTitle': 'Open-source licenses',
  'settings.licensesText': 'This app uses open-source libraries, available under the following licenses:',
  'settings.folders1': '1 folder',
  'settings.foldersFew': '{n} folders',
  'settings.foldersMany': '{n} folders',
};

const DICTIONARIES: Record<Lang, Record<I18nKey, string>> = { pl: PL, en: EN };
const LANG_KEY = 'app-lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'pl' || saved === 'en') return saved;
  } catch {
    // storage unavailable - fall through to the device language
  }
  return navigator.language?.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

/** Polish has three plural forms: 1 / 2-4 (except 12-14) / everything else. */
function pluralPl(n: number): 'one' | 'few' | 'many' {
  if (n === 1) return 'one';
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'few' : 'many';
}

/**
 * Interface translations (PL/EN). Card contents are never translated.
 * `t()` reads the `lang` signal, so templates calling it re-render when the language changes.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<Lang>(initialLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      document.documentElement.lang = lang;
      try {
        localStorage.setItem(LANG_KEY, lang);
      } catch {
        // not critical - the language just won't be remembered
      }
    });
  }

  readonly t = (key: I18nKey, params?: Record<string, string | number>): string => {
    let text = DICTIONARIES[this.lang()][key];
    for (const [name, value] of Object.entries(params ?? {})) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  };

  /** "1 karta / 3 karty / 5 kart" or "1 card / 3 cards". */
  readonly cards = (n: number): string => {
    if (this.lang() === 'en') return `${n} ${n === 1 ? 'card' : 'cards'}`;
    return `${n} ${{ one: 'karta', few: 'karty', many: 'kart' }[pluralPl(n)]}`;
  };

  readonly folders = (n: number): string => {
    const form = this.lang() === 'en' ? (n === 1 ? 'one' : 'many') : pluralPl(n);
    const key = ({ one: 'settings.folders1', few: 'settings.foldersFew', many: 'settings.foldersMany' } as const)[form];
    return this.t(key, { n });
  };
}
