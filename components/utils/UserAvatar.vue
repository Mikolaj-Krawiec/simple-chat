<template>
  <v-avatar
    :size="size"
    class="avatar"
    :class="{'avatar_item': group}"
  >
    <img v-if="avatar" :src="avatar" alt="Avatar">
    <img v-else :src="require('@/assets/img/user_default.png')" alt="Avatar">
  </v-avatar>
</template>

<script>
export default {
  name: 'UtilsUserAvatar',
  props: {
    avatar: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: 'Avatar'
    },
    size: {
      type: Number,
      default: 44
    },
    group: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.avatar {
  border: solid 3px white;
}
.avatar_item {
  border: solid 2px white;
}
.avatar_item:not(:first-child) {
  margin-left: -10px;
}
.avatar_item img {
  transform: scale(-1, 1);
}
</style>
