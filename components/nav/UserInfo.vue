<template>
  <div v-if="user">
    <v-btn
      absolute
      top
      right
      icon
      @click="expand=!expand"
      class="mt-2"
    >
      <v-icon :class="{'mdi-rotate-180': expand}">mdi-chevron-down</v-icon>
    </v-btn>
    <v-expand-transition>
      <div
        v-if="!expand"
        class="text-left"
      >
        <v-row>
          <v-col cols="auto" class="pr-0">
            <UtilsUserAvatar :avatar="user.avatar" />
          </v-col>
          <v-col
            class="d-flex flex-column justify-center custom--text text--blue text-body-2"
          >
            <span>
              {{ user.name || user.email }}
            </span>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
    <v-expand-transition>
      <NavUserDetails v-if="expand"/>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: 'NavUserInfo',
  data () {
    return {
      expand: false,
      avatar: {
        url: null,
        extension: null,
        file: null,
        type: null
      },
      errorMessage: '',
      uploading: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    initialAvatar () {
      if (this.user) {
        return this.user.avatar
      } else {
        return ''
      }
    }
  }
}
</script>
