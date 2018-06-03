module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'A0 Time Zone Migration',
      description: 'Utilities to help with migrations between timezone changes when they happen in the tzdb/zoneinfo/Olson database'
    }
  },
  base: '/a0-tzmigration/',
  themeConfig: {
    search: true,
    nav: [
      {
        text: 'Demo',
        link: '/demo/'
      },
      {
        text: 'API',
        items: [
          {
            text: 'Ruby gem',
            link: '/api/ruby/'
          },
          {
            text: 'JS npm',
            link: '/api/js/'
          }
        ]
      },
      {
        text: 'About the Repo',
        link: '/data/'
      }
    ],
    repo: 'a0/a0-tzmigration',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: 'Help us improve this page'
},
  ga: 'UA-97543933-4'
}
