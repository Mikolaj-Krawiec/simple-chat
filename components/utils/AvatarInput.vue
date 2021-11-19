<template>
  <v-badge
    overlap
    bottom
    avatar
    color="white"
    offset-x="20"
    offset-y="20"
    class="mb-4 border-radius d-flex justify-center align-center"
  >
    <template #badge class="d-flex justify-center align-center">
      <input
        id="file"
        ref="file"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileUpload($event)"
      >
      <v-avatar
        class="browseImageIcon"
        role="button"
        @click="browseImage"
      >
        <IconsCameraIris style="margin: 1px" :color="$vuetify.theme.themes.dark['darkGreen']"/>
      </v-avatar>

    </template>
    <v-avatar
      size="64"
      class="avatar"
    >
      <v-img
        v-if="!avatar.url && !initialAvatar"
        :src="require('@/assets/img/user_default.png')"
        alt="Avatar"
      />
      <v-img
        v-if="!avatar.url && initialAvatar"
        :src="initialAvatar"
        alt="Avatar"
      />
      <v-img
        v-if="avatar.url"
        :src="avatar.url"
        alt="Avatar"
      >
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-expand-transition>
            <v-btn v-show="uploading" fab small color="#a6e3bf" dark>
              <v-icon>mdi-upload</v-icon>
            </v-btn>
          </v-expand-transition>
        </v-row>
      </v-img>
    </v-avatar>
  </v-badge>
</template>

<script>
export default {
  name: 'UtilsAvatarInput',
  props: {
    avatar: {
      type: Object,
      default () {
        return {
          url: null,
          extension: null,
          file: null,
          type: null
        }
      }
    },
    initialAvatar: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      uploading: false,
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    browseImage () {
      this.$refs.file.click()
    },
    async handleFileUpload (event) {
      try {
        this.uploading = true
        const files = event.target.files
        if (!files.length) { return }
        const file = files[0]
        console.log('file: ', file)
        const storageRef = this.$fire.storage.ref()
        const fileExtension = file.name.split('.').pop()
        const filePath = `/users/${this.user.id}/avatar.${fileExtension}`
        const fileRef = storageRef.child(filePath)
        await fileRef.put(file)
        const fileUrl = await fileRef.getDownloadURL()
        const userRef = this.$fire.firestore.collection('users').doc(this.user.id)
        await userRef.set({ avatar: fileUrl }, { merge: true })
        this.uploading = false
      } catch (e) {
        this.uploading = false
        console.log(e)
      }
    },
  }
}
</script>

<style scoped>
.avatar {
  border: solid 3px white;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.13);
}
.browseImageIcon {
  cursor: pointer;
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.24);
}
.border-radius ::v-deep .v-badge__badge {
  border-radius: 16px;
}
</style>
