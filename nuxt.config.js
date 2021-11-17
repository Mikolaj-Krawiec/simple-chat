import colors from 'vuetify/es5/util/colors'
import { firebaseConfig } from './settings'

const isDev = process.env.NODE_ENV === 'development'
const useEmulators = true // manually change if emulators needed

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - simple-chat',
    title: 'simple-chat',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/firebase'],

  firebase: {
    config: firebaseConfig,
    services: {
      auth: {
        persistence: 'local',
        initialize: {
          onAuthStateChangedAction: 'onAuthStateChangedAction'
        },
        emulatorPort: isDev && useEmulators ? 9099 : undefined,
        disableEmulatorWarnings: true
      },
      firestore: {
        memoryOnly: false,
        enablePersistence: true,
        emulatorPort: isDev && useEmulators ? 8080 : undefined,
        settings: {
          experimentalForceLongPolling: isDev && useEmulators,
          host: isDev && useEmulators ? 'localhost:8080' : undefined,
          ssl: isDev && useEmulators ? false : undefined
        }
      },
      storage: {
        emulatorPort: isDev && useEmulators ? 9199 : undefined // It doesn't work yet.
      },
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      options: {
        customProperties: true
      },
      dark: true,
      themes: {
        light: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        },
        dark: {
          background: '#2F3E46',
          darkGray: '#2F3E46',
          gray: '#354F52',
          darkGreen: '#52796F',
          green: '#6B917E',
          lightGreen: '#84A98C',
          cream: '#A7BEA9',
          lightGray: '#CAD2C5',

          primary: '#354F52',
          accent: '#84A98C',
          secondary: '#52796F',
          info: '#38E4AE',
          warning: '#7BD389',
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
