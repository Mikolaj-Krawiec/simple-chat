<template>
  <div>
    <div v-if="queryParams.mode === 'verifyEmail'">
      <p class="headline font-weight-bold">Email is being verified</p>
      <v-progress-circular v-if="verifyingEmail" indeterminate/>
    </div>
    <div v-else class="text-body-2 lightGray--text">
      <p class="headline font-weight-bold">Verify your e-mail</p>
      <p>Rlease check your mailbox.
      <br/>We’ve sent you a message to verify your e-mail on adress:</p>
      <p class="font-weight-bold">{{ user.email }}</p>
      <p>Didn’t receive an e-mail?</p>
      <v-btn
        color="primary"
        rounded
        large
        min-width="100%"
        dark
        class="sign_in_button my-2 blue-button-box-shadow"
        data-cy="sign_in_button"
        @click="sendVerificationEmail"
        :loading="sendingEmail"
      >
        resend
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'unverified',
  data () {
    return {
      sendingEmail: false,
      verifyingEmail: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    queryParams () {
      return this.$route.query
    },
    authUser () {
      return this.$store.state.authUser
    }
  },
  watch: {
    authUser (authUser) {
      if (authUser.emailVerified) this.$router.push('/')
    }
  },
  async mounted() {
    if (this.queryParams.mode === 'verifyEmail' && this.queryParams.oobCode) {
      this.verifyingEmail = true
      try {
        await this.$fire.auth.applyActionCode(this.queryParams.oobCode)
        await this.$fire.auth.currentUser.reload()
        this.$store.commit('SET_AUTH_USER', {authUser: this.$fire.auth.currentUser})
      } catch (e) {
        console.log('error:', e.message)
      }
      this.verifyingEmail = false
    }
  },
  methods: {
    async sendVerificationEmail () {
      this.sendingEmail = true
      try {
        const user = this.$fire.auth.currentUser
        console.log('user:', user)
        if (user != null) {
          await user.sendEmailVerification()
          const userRef = this.$fire.firestore.collection('users').doc(user.uid)
          await userRef.set({ email_sent: true }, { merge: true })
        }
      } catch (e) {
        console.log(e.message)
      }
      this.sendingEmail = false
    }
  }
}
</script>
