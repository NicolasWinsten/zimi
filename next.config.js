module.exports = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Suppress Google Fonts download warnings
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}
