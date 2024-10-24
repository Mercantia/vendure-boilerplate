export default {
  supportedLngs: ['en', 'es', 'pt', 'pt-BR'],
  fallbackLng: 'pt-BR',
  // Disabling suspense is recommended
  react: { useSuspense: false },
  backend: {
    loadPath: '../public/locales/{{lng}}/{{ns}}.json',
  },
};
