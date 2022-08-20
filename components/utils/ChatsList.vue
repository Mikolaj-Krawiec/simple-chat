<template>
  <v-row class="d-flex flex-column ma-0">
    <v-col class="d-flex flex-column-reverse">
      <div v-for="chat in chats" :key="chat.id">
        <v-hover v-slot="{ hover }">
          <v-btn
            text
            block
            :class="{'hover': hover}"
            class="pa-0 d-flex align-center justify-start user"
            @click="goToChat(chat)"
          >
<!--              color="light-green accent-4"-->
            <v-badge
              bordered
              overlap
              bottom
              offset-x="15"
              offset-y="15"
              light
              :value="chat.newMessages"
              :content="chat.newMessages"
            >
              <UtilsUserAvatar
                :alt="`Avatar-${chat.name}`"
              />
            </v-badge>
            <span class="ml-2 text-capitalize text-body-2">
              {{ chat.name }}
            </span>
          </v-btn>
        </v-hover>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'UtilsChatsList',
  computed: {
    chats () {
      return this.$store.state.chats
    }
  },
  methods: {
    async goToChat (chat) {
      console.log('chat:', chat)
      if (chat.id === 'public') {
        this.$store.commit('SET_ACTIVE_CHAT', 'public')
        await this.$router.push({path: '/'})
      } else {
        this.$store.commit('SET_ACTIVE_CHAT', chat.id)
        await this.$router.push({path: '/' + chat.id})
      }
    }
  }
}
</script>

<style scoped>
.user{
  max-height: 28px;
}
.user ::v-deep .v-btn__content{
  max-height: 28px;
}
.hover{
  z-index: 1000;
}
</style>
