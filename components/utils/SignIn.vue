<template>
  <v-form v-model="valid">
    <h2 class="title">
      {{ loading ? 'Signing up to Simple Chat' : 'Sign up to Simple Chat' }}
    </h2>
    <v-progress-circular
      v-show="loading"
      class="ma-16"
      indeterminate
      color="primary"
      size="40"
    />
    <div v-show="!loading">
      <p class="text-body-2 lightGray--text">
        Continue with the Google account or email address you use to sign in.
      </p>
      <UtilsSignInWithGoogle
        text="Continue with Google"
        @show-error="errorMessage = $event"
        @loading-change="loading = $event"
      />
      <UtilsOrSeparator />
      <v-row justify="start">
        <v-col class="text-left pt-1">
          <label
            class="lightGray--text"
            for="email_input"
          >
            Email address
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
        id="email_input"
        v-model="email"
        name="email-address"
        type="email"
        :rules="emailRules"
        color="primary"
        background-color="lightGray"
        solo
        flat
        outlined
        dense
        rounded
      />
      <v-row justify="start">
        <v-col class="text-left pt-1">
          <label
            class="lightGray--text"
          >
            Password
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
        v-model="password"
        name="password"
        :rules="passwordRules"
        type="password"
        color="primary"
        background-color="lightGray"
        solo
        flat
        outlined
        dense
        rounded
      />
      <p class="custom--text text--blue text-button text-left mt-0">
        <nuxt-link
          to="/sign_in"
          router
          exact
          class="text-decoration-none lightGray--text"
        >
          FORGOT YOUR PASSWORD?
        </nuxt-link>
      </p>
      <v-btn
        color="primary"
        rounded
        large
        min-width="100%"
        dark
        class="sign_in_button mb-4 mt-1 blue-button-box-shadow"
        data-cy="sign_in_button"
        :disabled="!valid"
        @click="signInWithEmail"
      >
        <span class="lightGray--text">Login</span>
        <v-spacer />
        <v-icon small color="lightGray">
          mdi-arrow-right
        </v-icon>
      </v-btn>
    </div>
  </v-form>
</template>

<script>
export default {
  name: 'UtilsSignIn',
  data () {
    return {
      loading: false,
      valid: false,
      email: '',
      password: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required'
      ],
      errorMessage: ''
    }
  },
  computed: {
    authUser () {
      return this.$store.state.authUser
    },
    user () {
      return this.$store.state.user
    },
  },
  watch: {
    authUser (authUser) {
      if (authUser) this.$router.push('/')
    }
  },
  methods: {
    async signInWithEmail () {
      try {
        await this.$fire.auth.signInWithEmailAndPassword(
          this.email,
          this.password
        )
      } catch (e) {
        this.errorMessage = e.message
      }
    }
  }
}
</script>

