<template>
  <div>
    <span>{{ chat.name }}</span>
    <v-row class="ma-0 reverse" style="position: relative">
      <v-col
        v-on:scroll.passive="onScroll"
        class="pa-0 d-flex flex-column scroll" ref="container"
      >
        <v-btn
          v-if="!allOldMessagesLoaded"
          color="lightGreen"
          dark
          small
          fab
          class="mb-0 align-self-center"
          @click="loadOldMessages"
          :loading="loadingMessages"
        >
          <v-icon>mdi-reload</v-icon>
        </v-btn>
        <div v-else class="caption align-self-center gray--text" style="margin: 10px 0;">
          No older messages.
        </div>
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
            {{ chatMemberName(item.uid) }}
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
                <span>{{ item.message + ' : ' + item.timestamp.toDate() + ' : ' + item.id }}</span>
              </div>
              <div v-if="!isOwnMessage(item)" class="d-flex align-end">
                <UtilsUserAvatar
                  class="mr-2"
                  v-if="i === messages.length-1 || (i + 1 < messages.length && messages[i + 1].uid !== item.uid)"
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
        @keydown.enter="sendMessage"
      >
        <v-icon class="pl-1">mdi-send</v-icon>
      </v-btn>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  props: {
    chatId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      init: true,
      chatMembers: [],
      // messages: [],
      newMessage: '',
      unsubscribeChat: () => {},
      scrollBtn: false,
    }
  },
  computed: {
    allOldMessagesLoaded () {
      return this.chat.allOldMessagesLoaded
    },
    loadingMessages () {
      return this.chat.loadingMessages
    },
    messages () {
      return this.chat.messages
    },
    authUser () {
      return this.$store.state.authUser
    },
    user () {
      return this.$store.state.user || {id: 'Anonymous', name: 'Anonymous'}
    },
    chat () {
      const chat = this.$store.state.chats.find(item => item.id === this.chatId)
      if(chat) return chat
      else return {id: this.chatId, name: 'loading...', users: [], messages: [], usersLastSeenMessages: []}
    },
    allUsers () {
      return this.$store.state.allUsers
    }
  },
  watch: {
    messages(newVal, oldVal) {
      if (newVal.length > 1 && newVal.length !== oldVal.length) {
        const newMessage = newVal[newVal.length - 1] !== oldVal[oldVal.length - 1]
        const container = this.$refs.container
        if (container && newMessage) {
          console.log('new message:', newVal[newVal.length - 1])
          const scrollBottom = container.scrollHeight - container.clientHeight - container.scrollTop
          if (scrollBottom < 40 || this.isOwnMessage(newVal[newVal.length - 1])) {
            // new message is not yet in the DOM
            setTimeout(() => {this.scrollTo()}, 10);
          }
        } else if (container) {
          console.log('old message')
          setTimeout(() => {this.scrollTo(oldVal[0].id)}, 10);
        }
      }
      // if (this.$refs.container.scrollTop === this.$refs.container.scrollHeight) {
      //   this.scrollTo()
      // }
    },
    path () {
      console.log('new path', this.path)
      this.init = true
    }
  },
  created() {
    window.addEventListener('keypress', this.onKeyPress);
  },
  async beforeDestroy() {
    await this.unsubscribeChat()
    window.removeEventListener('keypress', this.onKeyPress);
  },
  async mounted() {
    console.log('MOUNTED FOR:', this.chatId)
    await this.scrollTo()
  },
  methods: {
    onKeyPress(e) {
      if (e.key === 'Enter') this.sendMessage()
    },
    chatMemberName (uid) {
      if (uid === this.user.id) return 'You'
      if (uid === 'Anonymous') return 'Anonymous'
      if (this.authUser) {
        const user = this.allUsers.find(item => item.id === uid)
        return user && user.name
      } else {
        const chatMember = this.chatMembers.find(item => item.uid === uid)
        return chatMember && chatMember.name
      }
    },
    chatMemberAvatar (uid) {
      if (uid === 'Anonymous') return undefined
      if (this.authUser) {
        const user = this.allUsers.find(item => item.id === uid)
        if (user) return user.avatar
        else return undefined
      } else {
        const chatMember = this.chatMembers.find(item => item.uid === uid)
        if (chatMember) return chatMember.avatar
        else return undefined
      }
    },
    // async addChatMember (uid) {
    //   if (!this.chatMembers.some(item => item.uid === uid)) {
    //     console.log('addChatMember: ', uid)
    //     if(uid === 'Anonymous') {
    //       this.updateChatMembers({uid, avatar: null, name: 'Anonymous'})
    //     } else {
    //       const user = {uid, avatar: null, name: 'loading...'}
    //       this.updateChatMembers(user)
    //       const chatMember = await this.$fire.firestore.collection('users').doc(uid).get()
    //       const chatMemberData = chatMember.data()
    //       const updatedUser = {
    //         uid,
    //         avatar: chatMemberData && chatMemberData.avatar,
    //         name: chatMemberData.name
    //       }
    //       this.updateChatMembers(updatedUser)
    //     }
    //   }
    // },
    // updateChatMembers (member) {
    //   const members = this.chatMembers.filter(item => item.uid !== member.uid)
    //   members.push(member)
    //   this.chatMembers = members
    // },
    isOwnMessage (message) {
      return message.uid === this.user.id
    },
    onScroll() {
      const container = this.$refs.container
      const scrollBottom = container.scrollHeight - container.clientHeight - container.scrollTop
      this.scrollBtn = scrollBottom > 200
    },
    loadOldMessages () {
      this.$store.dispatch('loadOldMessages', this.chatId)
    },
    async scrollTo (id=null) {
      console.log('scrollTo')
      if(this.messages.length > 0) {
        const duration = id ? 0 : 600
        const message = id ? this.messages.find(item => item.id === id) : this.messages[this.messages.length - 1]
        id = id || message.id
        if (this.messages.length > 2) {
          const container = this.$refs.container
          if (container) {
            const options = {
              duration: duration,
              offset: 60,
              easing: 'easeInOutCubic',
              container
            }
            const target = `m-${id}`
            const messageEl =  document.getElementById(target)
            if (messageEl) {
              await this.$vuetify.goTo('#' + target, options)
              console.log('successfully go to:', '#' + target)
              await this.markMessageAsSeen(message)
            } else console.log('message with id:', target, 'NOT found')
          } else console.log('container NOT found')
        } else {
          await this.markMessageAsSeen(message)
        }
      }
    },
    async markMessageAsSeen (message) {
      // New message are not supported on public chat
      if (this.chatId !== 'public') {
        const chatRef = this.$fire.firestore.collection('chats').doc(this.chatId)
        const usersLastSeenMessages = {...this.chat.usersLastSeenMessages}
        usersLastSeenMessages[this.user.id] = {messageId: message.id, timestamp: message.timestamp}
        await chatRef.set({usersLastSeenMessages: usersLastSeenMessages}, {merge: true})
        const messageIndex = this.messages.findIndex(item => item.id === message.id)
        const unseenMessages = this.messages.length - 1 - messageIndex
        this.$store.commit('UPDATE_CHAT', {...this.chat, newMessages: unseenMessages})
      }
    },
    async sendMessage () {
      if (this.newMessage) {
        try {
          const chatRef = this.$fire.firestore.collection('chats').doc(this.chatId)
            .collection('messages')
          await chatRef.add({
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
        const messageRef = this.$fire.firestore.collection('chats').doc(this.chatId)
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
