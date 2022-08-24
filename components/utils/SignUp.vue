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
          >
            What's your name?
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
        v-model="name"
        name="name"
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
          >
            What's your email?
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
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
          >
            Confirm your email
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
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
          >
            Create a password
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
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
      <v-row justify="start">
        <v-col class="text-left pt-1">
          <label
            class="lightGray--text"
          >
            Confirm your password
          </label>
        </v-col>
      </v-row>
      <v-text-field
        light
        v-model="passwordConfirm"
        name="confirm-password"
        :rules="passwordConfirmRules"
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
        :disabled="!valid"
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
      name: '',
      email: '',
      emailConfirm: '',
      password: '',
      passwordConfirm: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+/.test(v) || 'Email must be valid'
      ],
      emailConfirmRules: [
        v => !!v || 'Email is required',
        v => v === this.email || 'Your email address differs'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        (v) => v.length >= 8 || "Password must be more than 8 characters",
        (v) => /^(?=.*[a-z])/.test(v) || "Password must contain a lowercase letter.",
        (v) => /^(?=.*[A-Z])/.test(v) || "Password must contain an uppercase letter.",
        (v) => /^(?=.*\d)/.test(v) || "Password must contain a number",
        v => /^(?=.*[^\d^\w])/.test(v) || "Password must contain a symbol."
      ],
      passwordConfirmRules: [
        v => !!v || 'Password is required',
        v => v === this.password || 'Your password differs',
      ],
      errorMessage: ''
    }
  },
  computed: {
    authUser () {
      return this.$store.state.authUser
    }
  },
  watch: {
    authUser (authUser) {
      if (authUser) this.$router.push('/')
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
          let emailSent = false
          if (user != null) {
            await user.sendEmailVerification()
            emailSent = true
          }
          const userRef = this.$fire.firestore.collection('users').doc(user.uid)
          await userRef.set({
            name: this.name || user.displayName,
            email: user.email,
            avatar: user.photoURL,
            emailSent
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

