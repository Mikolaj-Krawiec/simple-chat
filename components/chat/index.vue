<template>
  <div>
    <v-row class="ma-0 reverse" style="position: relative">
      <v-col
        v-on:scroll.passive="onScroll"
        class="pa-0 d-flex flex-column scroll" ref="container"
      >
        <v-fade-transition>
          <v-btn
            v-if="!allOldMessagesLoaded"
            color="lightGreen"
            dark
            small
            fab
            class="mb-2 align-self-center"
            @click="loadOldMessages"
            :loading="loadingMessages"
          >
            <v-icon>mdi-reload</v-icon>
          </v-btn>
        </v-fade-transition>
        <v-fade-transition>
          <v-btn
            v-if="scrollBtn"
            fab
            small
            color="lightGreen"
            @click="scrollTo()"
            class="scroll-btn align-self-center"
          >
            <v-icon>
              mdi-arrow-down-thin
            </v-icon>
          </v-btn>
        </v-fade-transition>
        <template v-for="(item, i) in messages">
          <span
              v-if="i > 0 && messages[i - 1].uid !== item.uid || i === 0"
              class="ml-10 caption gray--text"
              :class="{'ml-auto mr-5': isOwnMessage(item)}"
            >
            {{ chatMemberName(item.uid)}}
          </span>
          <v-hover v-slot="{ hover }">
            <div
              :key="item.id"
              style="margin: 1px 0 1px 0"
              class="d-flex"
              :class="{'ml-auto mr-4': isOwnMessage(item), 'mr-auto flex-row-reverse': !isOwnMessage(item)}"
            >
              <v-btn
                v-if="authUser && hover && isOwnMessage(item) && !item.deleted"
                icon
                @click="deleteMessage(item)"
                class="mr-2"
                color="gray"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <div
                :id="`m-${item.id}`"
                class="message rounded-xl flex-grow-0"
                :class="{
                  'lightGray--text py-2 px-4': !item.deleted,
                  'ownMessage': isOwnMessage(item),
                  'deletedMessage py-1 px-2': item.deleted
                }"
              >
                <span>{{ item.message }}</span>
              </div>
              <div v-if="!isOwnMessage(item)">
                <UtilsUserAvatar
                  class="mr-2"
                  v-if="i > 0 && messages[i - 1].uid !== item.uid || i === 0"
                  :size="30"
                  :avatar="chatMemberAvatar(item.uid)"
                />
                <div v-else style="width:38px"/>
              </div>
            </div>
          </v-hover>
        </template>
      </v-col>
    </v-row>
    <v-row class="ma-0 align-center">
      <v-text-field
        class="mr-5"
        v-model="newMessage"
      />
      <v-btn
        fab
        small
        elevation="0"
        color="lightGreen"
        @click="sendMessage"
      >
        <v-icon class="pl-1">mdi-send</v-icon>
      </v-btn>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  data() {
    return {
      loadingMessages: false,
      allOldMessagesLoaded: false,
      messages: [],
      newMessage:'',
      unsubscribe: () => {},
      chatMembers: [],
      scrollBtn: false,
    }
  },
  computed: {
    authUser () {
      return this.$store.state.authUser
    },
    user () {
      return this.$store.state.user || {id: 'Anonymous', name: 'Anonymous'}
    },
  },
  watch: {
    messages() {
      if(this.$refs.container.scrollTop === this.$refs.container.scrollHeight) {
        this.scrollTo()
      }
    },
  },
  async beforeDestroy() {
    await this.unsubscribe()
  },
  async mounted() {
    const globalChatRef =  this.$fire.firestore.collection('chats').doc('global')
    const globalChatDoc = await globalChatRef.get()
    // TODO: remove after testing
    if(!globalChatDoc.exists) {
      await globalChatRef.set({name: 'Global Chat'},)
    }
    const globalChatMessagesRef = this.$fire.firestore.collection('chats').doc('global')
          .collection('messages')
    this.unsubscribe = globalChatMessagesRef.orderBy('timestamp', 'desc').limit(5).onSnapshot((snapshot) => {
      if(!snapshot.empty) {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const doc = change.doc.data()
            await this.addChatMember(doc.uid)
            console.log(doc.message)
            doc.id = change.doc.id
            if(this.messages.length && doc.timestamp < this.messages[0].timestamp) this.messages.unshift(doc)
            else if(this.messages.length > 1) {
              const container = this.$refs.container
              const scrollBottom = container.scrollHeight - container.clientHeight - container.scrollTop
              await this.messages.push(doc)
              if(scrollBottom < 40) {
                this.scrollTo()
              }
            } else this.messages.push(doc)
          }
          if (change.type === "modified") {
            console.log("Modified message: ", change.doc.data());
            const newMessage = change.doc.data()
            const oldMessage = this.messages.find((item) => item.id === change.doc.id)
            oldMessage.message = newMessage.message
            oldMessage.edited = true
            if (newMessage.deleted) oldMessage.deleted = true
          }
          // if (change.type === "removed") {
          //   console.log("Removed message: ", change.doc.data());
          //   this.messages = this.messages.filter((item) => item.id !== change.doc.id)
          // }
        });
      }
    })
  },
  methods: {
    chatMemberName (uid) {
      if (uid === this.user.id) return 'You'
      const chatMember = this.chatMembers.find(item => item.uid === uid)
      return chatMember && chatMember.name
    },
    chatMemberAvatar (uid) {
      const chatMember = this.chatMembers.find(item => item.uid === uid)
      if (chatMember) return chatMember.avatar
      else return undefined
    },
    async addChatMember (uid) {
      if (!this.chatMembers.some(item => item.uid === uid)) {
        console.log('addChatMember: ', uid)
        if(uid === 'Anonymous') {
          this.chatMembers.push({uid, avatar: null, name: 'Anonymous'})
        } else {
          const user = {uid, avatar: null, name: 'loading...'}
          this.chatMembers.push(user)
          const chatMember = await this.$fire.firestore.collection('users').doc(uid).get()
          const chatMemberData = chatMember.data()
          user.avatar = chatMemberData && chatMemberData.avatar
          user.name = chatMemberData.name
        }
      }
    },
    isOwnMessage (message) {
      return message.uid === this.user.id
    },
    onScroll() {
      // console.log('Top: ', this.$refs.container.scrollTop, 'Height: ', this.$refs.container.scrollHeight, this.$refs.container.clientHeight)
      const container = this.$refs.container
      const scrollBottom = container.scrollHeight - container.clientHeight - container.scrollTop
      this.scrollBtn = scrollBottom > 200
    },
    async loadMessages () {

    },
    async loadOldMessages () {
      if (this.messages.length) {
        const limit = 5
        this.loadingMessages = true
        const firstMessage = this.messages[0]
        const globalChatMessagesRef = this.$fire.firestore.collection('chats').doc('global')
            .collection('messages').where('timestamp', '<', firstMessage.timestamp)
        const olderMessagesRaw = await globalChatMessagesRef.orderBy('timestamp', 'desc').limit(limit).get()
        if(olderMessagesRaw.docs.length < limit) {
          this.allOldMessagesLoaded = true
        }
        const olderMessages = []
        for (const snapshot of olderMessagesRaw.docs) {
          const doc = snapshot.data()
          doc.id = snapshot.id
          await this.addChatMember(doc.uid)
          olderMessages.unshift(doc)
        }
        await this.messages.unshift(...olderMessages)

        this.scrollTo(0, `#m-${firstMessage.id}`)
        this.loadingMessages = false
      } else {
        this.allOldMessagesLoaded = true
      }
    },
    scrollTo(duration=600, target=null) {
      const container = this.$refs.container
      const options = {
        duration: duration,
        offset: 48,
        easing: 'easeInOutCubic',
        container
      }
      if (!target) target = `#m-${this.messages[this.messages.length - 1].id}`
      this.$vuetify.goTo(target, options)
    },
    async sendMessage () {
      if (this.newMessage) {
        try {
          const globalChatRef = this.$fire.firestore.collection('chats').doc('global')
            .collection('messages')
          await globalChatRef.add({
            message: this.newMessage,
            uid: this.user.id,
            timestamp: this.$fireModule.firestore.Timestamp.now()})
          this.newMessage = ''
        } catch (e) {
          console.log(e)
        }
      }
    },
    async deleteMessage (item) {
      if (this.authUser) {
        const messageRef = this.$fire.firestore.collection('chats').doc('global')
        .collection('messages').doc(item.id)
        await messageRef.set({message: 'unsent a message', deleted: true }, { merge: true })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.message {
  max-width: 500px;
  background-color: var(--v-green-base);
  border-color: var(--v-green-base);
  color: var(--v-green-base);
}
.ownMessage {
  background-color: var(--v-gray-base);
  border-color: var(--v-gray-base);
  color: var(--v-gray-base);
}
.deletedMessage {
  border-width: 1px;
  border-style: solid;
  background-color: transparent;
}
.scroll {
  max-height: 200px;
  overflow-y: scroll
}
.scroll-btn{
  position: absolute;
  bottom: 0;
}
</style>
