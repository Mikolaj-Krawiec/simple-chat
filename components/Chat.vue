<template>
  <div>
    <v-row class="ma-0 reverse">
<!--        v-on:scroll.passive="onScroll"-->
      <v-col
        class="pa-0 d-flex flex-column scroll" ref="container"
      >
        <v-btn
          v-if="!allOldMessagesLoaded"
          color="green"
          dark
          small
          fab
          class="mb-2 align-self-center"
          @click="loadOldMessages"
          :loading="loadingOldMessages"
        >
          <v-icon>mdi-reload</v-icon>
        </v-btn>
        <template v-for="(item, i) in messages">
          <v-card
            :key="item.id"
            :id="`m-${item.id}`"
            :color="item.uid === user.id ? 'gray' : 'green'"
            class="mb-2 lightGray--text rounded-xl"
            :class="{'ml-auto': item.uid === user.id, 'mr-auto': item.uid !== user.id}"
            max-width="500"
          >
            <v-card-text class="py-2 px-4">
              {{ item.message }}
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>
    <v-row class="ma-0 align-center">
      <v-text-field
        class="mr-5"
        v-model="newMessage"
      />
      <v-btn
        color="green"
        @click="sendMessage"
      >
        Send
      </v-btn>
      <v-btn
        color="green"
        @click="scrollTo()"
      >
        Scroll
      </v-btn>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  data() {
    return {
      loadingOldMessages: false,
      allOldMessagesLoaded: false,
      messages: [],
      newMessage:'',
      unsubscribe: () => {},
    }
  },
  computed: {
    user () {
      return this.$store.state.user || {id: 'Anonymous', name: 'Anonymous'}
    }
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
    onScroll() {
      // console.log('Top: ', this.$refs.container.scrollTop, 'Height: ', this.$refs.container.scrollHeight, this.$refs.container.clientHeight)
      if (this.$refs.container.scrollTop <= 0) {
        console.log('top')
        // this.loadOldMessages()
      }
    },
    async loadOldMessages() {
      const limit = 5
      this.loadingOldMessages = true
      const firstMessage = this.messages[0]
      const globalChatMessagesRef = this.$fire.firestore.collection('chats').doc('global')
          .collection('messages').where('timestamp', '<', firstMessage.timestamp)
      const olderMessagesRaw = await globalChatMessagesRef.orderBy('timestamp', 'desc').limit(limit).get()
      if(olderMessagesRaw.docs.length < limit) {
        this.allOldMessagesLoaded = true
      }
      const olderMessages = []
      olderMessagesRaw.forEach(snapshot => {
        const doc = snapshot.data()
        doc.id = snapshot.id
        olderMessages.unshift(doc)
      })
      await this.messages.unshift(...olderMessages)

      this.scrollTo(0, `#m-${firstMessage.id}`)
      this.loadingOldMessages = false
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
            userName: this.user.name,
            timestamp: this.$fireModule.firestore.Timestamp.now()})
          this.newMessage = ''
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
}
</script>

<style scoped>
.scroll {
  max-height: 200px;
  overflow-y: scroll
}
</style>
