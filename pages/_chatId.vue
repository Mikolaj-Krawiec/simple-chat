<template>
  <Chat :chatId="chatId"/>
</template>

<script>
export default {
  middleware: 'auth-access',
  computed: {
    chatId () {
      return this.$route.params.chatId
    }
  }
}
</script>
