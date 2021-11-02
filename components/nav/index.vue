<template>
  <div>
    <div
      v-if="!user"
      class="d-flex flex-column justify-center"
    >
      <div class="d-flex justify-center">
        <v-btn
          text
          small
          plain
          nuxt
          to="/sign_up"
        >
          create account
        </v-btn>
        or
        <v-btn
          small
          plain
          nuxt
          to="/sign_in"
        >
          sign in
        </v-btn>
      </div>
      <v-divider/>
      <v-expand-transition>
        <v-btn
          v-if="this.$route.path !== '/'"
          small
          plain
          nuxt
          to="/"
        >
          Go back to chat
        </v-btn>
      </v-expand-transition>
    </div>
    <NavUserInfo/>
  </div>
</template>

<script>
export default {
  name: 'Nav',
  data() {
    return {}
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  }
}
</script>
