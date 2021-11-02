<template>
  <v-card
    v-if="user"
    flat
    color="darkGreen"
    dark
    class="rounded-lg"
    min-width="200"
  >
      <div
        class="d-flex flex-column py-4 px-5 px-sm-2"
        :class="{'align-start': mobile, 'align-center': !mobile}"
      >
        <v-icon v-if="mobile" class="align-self-end" @click="close">
          mdi-close
        </v-icon>
        <UtilsAvatarInput
          :avatar="avatar"
          :initial-avatar="initialAvatar"
          :uploading="uploading"
          class="mt-sm-1 mb-1"
          @updateAvatar="updateAvatar"
          @handleError="updateErrorMessage"
        />
        <span v-if="user.name" class="text-subtitle-2 my-1">
          {{ user.name }}
        </span>
        <span v-if="user.email" class="text-caption my-1">
          {{ user.email }}
        </span>
        <v-divider v-if="mobile" color="white" class="line mt-4" />
        <UtilsSignOut class="mt-4 mb-1" />
      </div>
  </v-card>
</template>

<script>
export default {
  name: 'NavUserDetails',
  props: {
    mobile: {
      type: Boolean,
      default: false
    }
  },
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
  methods: {
    async updateAvatar (avatar) {
      this.avatar = { ...avatar }
      if (this.avatar.file) {
        this.uploading = true
        const avatarPath = `images/users/${this.user.id}/avatar.${this.avatar.extension}`
        try {
          const signedUrl = await this.$storage.addUserAvatar(avatarPath, this.user.id)
          await this.$storage.uploadImage(signedUrl, this.avatar)
          await this.$fire.firestore.collection('users').doc(this.user.id)
            .set({
              avatar: avatarPath
            }, { merge: true })
          await this.$store.dispatch('getUserInfo', this.user.id)
        } catch (error) {
          console.error(error)
        }
        this.uploading = false
      }
    },
    updateErrorMessage (message) {
      this.errorMessage = message
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.line {
  opacity: 0.2;
  width: 100%;
}
</style>
