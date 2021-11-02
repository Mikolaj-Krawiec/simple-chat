<template>
  <v-form ref="form" v-model="valid">
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
        Sign up with Google or with your email address.
      </p>
      <UtilsSignInWithGoogle @show-error="errorMessage = $event" @loading-change="loading = $event" />
      <UtilsOrSeparator />
      <v-row justify="start">
        <v-col class="text-left pt-1">
          <label
            class="lightGray--text"
            for="email_input"
          >
            {{ inviteEmail ? 'Email address' : "What's your email?" }}
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
        id="email_input"
        v-model="email"
        name="email"
        type="email"
        :rules="emailRules"
        color="primary"
        background-color="lightGray"
        solo
        flat
        outlined
        rounded
        dense
      />
      <v-row justify="start">
        <v-col class="text-left pt-1">
          <label
            class="lightGray--text"
            for="email_confirm_input"
          >
            Confirm your email
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
        id="email_confirm_input"
        v-model="emailConfirm"
        name="confirm-email"
        :rules="emailConfirmRules"
        type="email"
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
            for="password_input"
          >
            Create a password
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
        id="password_input"
        v-model="password"
        name="password"
        :rules="passwordRules"
        type="password"
        background-color="lightGray"
        solo
        flat
        outlined
        dense
        rounded
      />
      <v-btn
        color="primary"
        rounded
        large
        min-width="100%"
        dark
        class="sign_up_button mb-4 blue-button-box-shadow"
        data-cy="sign_up_button"
        @click="signUpWithEmail()"
      >
        <span class="lightGray--text">Sign up</span>
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
  name: 'UtilsSignUp',
  data () {
    return {
      loading: false,
      valid: false,
      email: '',
      emailConfirm: '',
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
    emailConfirmRules () {
      return [
        v => !!v || 'Email is required',
        v => v === this.email || 'Your email address differs'
      ]
    }
  },
  methods: {
    async signUpWithEmail () {
      const validForm = this.$refs.form.validate()
      if (validForm) {
        try {
          const response = await this.$fire.auth.createUserWithEmailAndPassword(
            this.email,
            this.password
          )
          const user = response.user
          const userRef = this.$fire.firestore.collection('users').doc(user.uid)
          await userRef.set({
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL
          })
          await this.$store.dispatch('getUserInfo', user.uid)
          await this.$router.push('/')
        } catch (e) {
          this.errorMessage = e.message
        }
      }
    }
  }
}
</script>

