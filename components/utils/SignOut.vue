<template>
  <v-btn
    plain
    small
    @click="signOut"
  >
    <span>Sign Out</span>
  </v-btn>
</template>

<script>
export default {
  name: 'UtilsSignOut',
  methods: {
    async signOut () {
      await this.$fire.auth.signOut()
      await this.$router.push('/')
    }
  }
}
</script>
