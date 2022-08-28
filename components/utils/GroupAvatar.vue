<template>
  <div class="d-flex" :style="`max-width: ${size}px; height: ${size}px`">
    <UtilsUserAvatar
      class="mt-auto"
      :avatar="avatars[0]"
      :size="30"
    />
    <UtilsUserAvatar
      :avatar="avatars[1]"
      :size="30"
      style="transform: translateX(-50%)"
    />
  </div>
</template>

<script>
export default {
  name: 'UtilsGroupAvatar',
  props: {
    avatars: {
      type: Array,
      default: () => ([null])
    },
    size: {
      type: Number,
      default: 44
    }
  },
}
</script>
