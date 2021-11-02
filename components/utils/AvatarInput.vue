<template>
  <v-badge
    overlap
    bottom
    avatar
    color="white"
    offset-x="20"
    offset-y="20"
    class="mb-4 border-radius"
  >
    <template #badge>
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
        <v-img
          :src="cameraIcon"
          alt="camera icon"
          height="12px"
          width="14px"
          contain
        />
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
import cameraIcon from '@/assets/img/camera-icon.svg'
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
    uploading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      cameraIcon
    }
  },
  methods: {
    browseImage () {
      this.$refs.file.click()
    },
    handleFileUpload (event) {
      const files = event.target.files
      if (!files.length) { return }
      this.createImage(files[0])
    },
    createImage (file) {
      if (file.size > 5120000) {
        const errorMessage = 'Max size of the avatar: 5MB'
        this.$emit('handleError', errorMessage)
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          const image = new Image()
          image.src = e.target.result
          image.onload = () => {
            if (image.height > 1024 || image.width > 1024) {
              const errorMessage = 'Max dimensions of the avatar: 1024px x 1024px'
              this.$emit('handleError', errorMessage)
            } else {
              const avatar = {
                file,
                url: e.target.result,
                type: file.type,
                extension: file.type.split('/')[1]
              }
              this.$emit('updateAvatar', avatar)
            }
          }
        }
        reader.readAsDataURL(file)
      }
    }
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
