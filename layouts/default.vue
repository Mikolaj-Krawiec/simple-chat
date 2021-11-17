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
  data () {
    return {
    }
  }
}
</script>

<style scoped lang="scss">
.v-application {
  background-color: var(--v-background-base);
}
</style>
