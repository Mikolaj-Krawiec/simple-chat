<template>
  <Chat :chatId="chatId"/>
</template>

<script>
export default {
  name: 'PrivateChatPage',
  middleware: 'auth-access',
  computed: {
    chatId () {
      return this.$route.params.chatId
    }
  }
}
</script>
