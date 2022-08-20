<template>
  <v-row class="d-flex flex-column ma-0">
    <v-col class="d-flex flex-column-reverse" :class="{'pa-0': filteredUsers.length === 0}">
      <div v-for="user in filteredUsers" :key="user.id">
        <v-hover v-slot="{ hover }">
          <v-btn
            text
            block
            v-if="user.id !== authUser.uid"
            :class="{'hover': hover}"
            class="pa-0 d-flex align-center justify-start user"
            @click="startNewChat(user.id)"
          >
            <v-badge
              bordered
              overlap
              bottom
              dot
              color="light-green accent-4"
              offset-x="12"
              offset-y="12"
              light
              :value="false"
            >
              <UtilsUserAvatar
                :avatar="user.avatar"
                :alt="`Avatar-${user.email}`"
              />
            </v-badge>
            <span class="ml-2 text-capitalize text-body-2">
              {{ user.name || user.email }}
            </span>
          </v-btn>
        </v-hover>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'UtilsUsersList',
  computed: {
    user () {
      return this.$store.state.user
    },
    authUser () {
      return this.$store.state.authUser
    },
    chats () {
      return this.$store.state.chats
    },
    allUsers () {
      return this.$store.state.allUsers
    },
    filteredUsers () {
      return this.allUsers.filter(user => !this.chats.some(item => item.users.length === 2 && item.users.includes(user.id)))
    }
  },
  methods: {
    async startNewChat (userId) {
      if (userId === 'global') {
        await this.$router.push({path: '/'})
      } else {
        const chat = this.chats.find(item => item.users.includes(userId))
        if (chat) {
          console.log('go to existing chat:', chat.id)
          await this.$router.push({path: '/' + chat.id})
        } else {
          console.log('create new chat')
          const userRef = this.$fire.firestore.collection('users').doc(userId)
          const userDoc = await userRef.get()
          const userData = userDoc.data()
          const ownUserRef = this.$fire.firestore.collection('users').doc(this.authUser.uid)
          const chat = await this.$fire.firestore.collection('chats').add({
            name: [userData.name || userData.email, this.user.name || this.user.email],
            users: [userRef, ownUserRef]
          })
          console.log('go to chat:', chat.id)
          await this.$router.push({path: '/' + chat.id})
        }
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
