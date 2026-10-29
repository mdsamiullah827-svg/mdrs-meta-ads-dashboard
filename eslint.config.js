import globals from 'globals';
export default [{ files: ['src/**/*.{js,jsx}'], languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } }, rules: { 'no-undef': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error' } }];
