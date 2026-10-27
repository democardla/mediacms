module.exports = {
  locales: ['en', 'zh-Hans'],
  extract: {
    input: ['src/static/js/**/*.{js,jsx,ts,tsx}'],
    output: 'src/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'media',
    primaryLanguage: 'en',
    extractFromComments: false,
  },
};
