import { version } from '../../package.json';

/** Static information shown in Settings → About. The version comes from package.json. */
export const APP_INFO = {
  name: 'Rośliny - fiszki',
  version,
  copyright: '© 2026',
  coffeeUrl: 'https://buycoffee.to/basik',
  /** Open-source libraries bundled in the app, with their licenses. */
  licenses: [
    { name: 'Angular', license: 'MIT' },
    { name: 'Ionic Framework', license: 'MIT' },
    { name: 'Ionicons', license: 'MIT' },
    { name: 'Capacitor', license: 'MIT' },
    { name: 'RxJS', license: 'Apache-2.0' },
    { name: 'tslib', license: '0BSD' },
  ],
};
