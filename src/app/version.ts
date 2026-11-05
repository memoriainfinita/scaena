/** Version of the app, from package.json at build time. */
export const appVersion = (): string => (typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev');
