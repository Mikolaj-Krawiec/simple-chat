<template>
  <v-menu
    v-model="menu"
    offset-x
    right
    rounded="lg"
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <div
        class="text-left"
        v-bind="attrs"
        v-on="on"
      >
        <v-row v-if="user">
          <v-col cols="auto" class="pr-0">
            <UtilsUserAvatar :avatar="user.avatar" />
          </v-col>
          <v-col
            class="d-flex flex-column justify-center custom--text text--blue text-body-2"
          >
            <span
              v-if="user.name"
              class="user-name"
            >
              {{ user.name }}
            </span>
            <span
              v-if="!user.name && user.email"
              data-cy="user-name"
            >
              {{ user.email }}
            </span>
          </v-col>
        </v-row>
      </div>
    </template>
    <NavUserDetails @close="menu = false" />
  </v-menu>
</template>

<script>
export default {
  name: 'NavUserInfo',
  data () {
    return {
      menu: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  }
}
</script>

<style scoped>
.user-name {
  word-break: normal;
}
</style>
