<template>
  <div
    class="d-flex flex-column align-center"
  >
    <UtilsAvatarInput
      :avatar="avatar"
      :initial-avatar="initialAvatar"
      :uploading="uploading"
      class="mt-sm-1 mb-1"
    />
    <span v-if="user.name" class="text-subtitle-2 my-1">
      {{ user.name }}
    </span>
    <span v-if="user.email" class="text-caption my-1">
      {{ user.email }}
    </span>
    <UtilsSignOut class="mt-4" />
  </div>
</template>

<script>
export default {
  name: 'NavUserDetails',
  data () {
    return {
      menu: false,
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
  },
}
</script>
