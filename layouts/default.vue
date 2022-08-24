<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row justify="center" class="pt-0 py-sm-8">
          <v-col
            cols="12"
            sm="auto"
          >
            <v-card
              class="pa-5 rounded-xl"
              color="darkGreen"
              min-width="296"
            >
              <Nav/>
            </v-card>
            <v-card
              v-if="authUser"
              class="mt-5 pa-2 rounded-xl d-flex flex-column-reverse justify-center"
              color="darkGreen"
              min-width="296"
            >
              <UtilsUsersList v-if="allUsers.length > 1"/>
              <UtilsChatsList/>
            </v-card>
          </v-col>
          <v-col>
            <v-card
              class="pa-5 rounded-xl"
              color="darkGreen"
            >
              <Nuxt />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  computed: {
    authUser () {
      return this.$store.state.authUser
    },
    allUsers () {
      return this.$store.state.allUsers
    }
  }
}
</script>

<style scoped lang="scss">
.v-application {
  background-color: var(--v-background-base);
}
</style>
