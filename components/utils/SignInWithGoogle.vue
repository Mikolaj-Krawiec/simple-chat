<template>
  <v-btn
    class="google_signin my-1"
    min-width="100%"
    color="#2d7ff3"
    outlined
    @click="signIn"
    :loading="loading"
  >
    <v-img
      alt="GoogleLogo"
      :src="require('@/assets/img/GoogleLogo.svg')"
      width="20"
      height="20"
      class="mx-2"
      contain
    />
    {{ text }}
  </v-btn>
</template>

<script>
export default {
  name: 'UtilsSignInWithGoogle',
  props: {
    text: {
      type: String,
      default: 'Sign in with Google'
    }
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    async signIn () {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      try {
        this.$emit('loading-change', true)
        this.loading = true
        const response = await this.$fire.auth.signInWithPopup(provider)
        const user = response.user
        const userRef = this.$fire.firestore.collection('users').doc(user.uid)
        const userDoc = await userRef.get()
        if (userDoc.exists) {
          await this.$router.push('/')
        } else {
          console.log('saving user to firestore: ', user)
          await userRef.set({
            name: user.displayName,
            email: user.email,
            googleAvatar: user.photoURL
          }, { merge: true })
          console.log('saved user to firestore')
          await this.$router.push('/')
        }
        this.loading = false
      } catch (e) {
        this.loading = false
        this.$emit('loading-change', false)
        this.$emit('show-error', e.message)
      }
    }
  }
}
</script>

<style scoped>
.google_signin {
  border-radius: 2px;
  border: solid 2px #2d7ff3;
  background-color: white;
}
.google_signin ::v-deep .v-btn__content {
  flex: 0 0 auto;
  text-transform: none;
  font-size: 0.875rem;
}
</style>
