import { MESSAGE_LIMIT } from '../settings'

let unsubscribeUser = () => {}
let unsubscribeChats = () => {}
let unsubscribeAllUsers = () => {}
const chatMessages = []
// let uid = null

// window.onbeforeunload = function() {
//   if (uid) {
//     const userRef = this.$fire.firestore.collection('users').doc(uid)
//     userRef.set({online: true}, {merge: false})
//   }
// }

export const state = () => {
  return {
    authUser: null,
    user: null,
    chats: [],
    allUsers: [],
    activeChat: 'public'
  }
}

export const getters = {

}

export const mutations = {
  SET_AUTH_USER (state, { authUser }) {
    console.log('SET_AUTH_USER: ', authUser)
    state.authUser = {
      uid: authUser.uid,
      email: authUser.email,
      emailVerified: authUser.emailVerified
    }
  },
  SET_USER (state, { user }) {
    console.log('SET_USER: ', user)
    state.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }
  },
  SET_ACTIVE_CHAT (state, chatId) {
    state.activeChat = chatId
  },
  UPDATE_ALL_USERS (state, user) {
    console.log('UPDATE_ALL_USERS: ', user)
    const allUsers = state.allUsers.filter(item => item.id !== user.id)
    allUsers.push(user)
    state.allUsers = allUsers
  },
  UPDATE_CHAT (state, chat) {
    console.log('UPDATE_CHAT: ', chat)
    const chats = state.chats.filter(item => item.id !== chat.id)
    chats.push(chat)
    state.chats = chats
  },
  RESET_STORE (state) {
    console.log('RESET_STORE')
    state.authUser = null
    state.user = null
    state.chats = []
    state.allUsers = []
  },
}

export const actions = {
  async onAuthStateChangedAction (ctx, { authUser }) {
    unsubscribeUser()
    unsubscribeChats()
    for (const chat of chatMessages) {
      chat.unsubscribeChatMessages()
    }
    if (authUser) {
      // uid = authUser.uid
      // const userRef = this.$fire.firestore.collection('users').doc(authUser.uid)
      // userRef.set({online: true}, {merge: true})
      ctx.commit('SET_AUTH_USER', { authUser })
      ctx.dispatch('getUserInfo', authUser.uid)
      await ctx.dispatch('getAllUsers')
      ctx.dispatch('getUserChats', authUser.uid)
    } else {
      // uid = null
      // const userRef = this.$fire.firestore.collection('users').doc(authUser.uid)
      // userRef.set({online: true}, {merge: false})
      ctx.commit('RESET_STORE')
      ctx.dispatch('getAllUsers')
    }
    ctx.dispatch('getPublicChat')
  },

  async getUserInfo (ctx, userId) {
    const ref = this.$fire.firestore.collection('users').doc(userId)
    unsubscribeUser = ref.onSnapshot(async (snapshot) => {
      if(snapshot.exists) {
        try {
          const user = snapshot.data()
          user.id = userId
          if (!user.avatar && user.googleAvatar) {
            user.avatar = user.googleAvatar
          }
          ctx.commit('SET_USER', { user })
        } catch (e) {
          console.log(e)
        }
      }
    }, (err) => {
      console.log(`Encountered error: ${err}`)
    })
  },

  getAllUsers (ctx) {
    const usersRef = this.$fire.firestore.collection('users')
    unsubscribeAllUsers = usersRef.onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const user = change.doc.data()
            user.id = change.doc.id
            console.log('user: ', user)
            ctx.commit('UPDATE_ALL_USERS', user)
          }
        }, (err) => {
          console.log('users onSnapshot error:', err)
        })
      }
    })
  },

  async getPublicChat (ctx) {
    const publicChatRef = this.$fire.firestore.collection('chats').doc('public')
    let publicChatDoc = await publicChatRef.get()
    if(!publicChatDoc.exists) {
      await publicChatRef.set({name: 'Public Chat'})
      publicChatDoc = await publicChatRef.get()
    }
    const chatData = publicChatDoc.data()
    const chat = {
      id: publicChatDoc.id,
      name: chatData.name,
      users: [],
      newMessages: 0,
      messages: [],
      avatars: [null]
    }
    ctx.commit('UPDATE_CHAT', chat)
    ctx.dispatch('getChatMessages', 'public')
  },

  async getUserChats (ctx, userId) {
    const ownUserRef = this.$fire.firestore.collection('users').doc(userId)
    const chatsRef = this.$fire.firestore.collection('chats')
      .where('users', 'array-contains', ownUserRef)
    unsubscribeChats = chatsRef.onSnapshot((snapshot) => {
      if(!snapshot.empty) {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data()

            const users = data.users.map(item => item.id)
            const name = []
            if (change.doc.id === 'public') name.push('Public Chat')
            else {
              for (const userId of users) {
                if (userId !== ctx.state.user.id) {
                  const user = ctx.state.allUsers.find(user => user.id === userId)
                  if (user) name.push(user.name || user.email)
                }
              }
            }

            const avatars = []
            if (change.doc.id === 'public') avatars.push(null)
            else {
              for (const userId of users) {
                if (userId !== ctx.state.user.id) {
                  const user = ctx.state.allUsers.find(user => user.id === userId)
                  if (user) avatars.push(user.avatar || user.googleAvatar)
                }
              }
            }

            const chat = {
              id: change.doc.id,
              name: name.join(', '),
              users,
              avatars,
              usersLastSeenMessages: data.usersLastSeenMessages,
              newMessages: 0,
              messages: [],
              allOldMessagesLoaded: false,
              loadingMessages: false
            }
            ctx.commit('UPDATE_CHAT', chat)
            ctx.dispatch('getChatMessages', change.doc.id)
          } else if (change.type === "modified") {
            console.log('chat has been modified')
          }
        })
      }
    }, (err) => {
      console.log('chats onSnapshot error:', err)
    })
  },

  async getChatMessages (ctx, chatId) {
    let init = true

    const messagesRef = this.$fire.firestore.collection('chats').doc(chatId)
      .collection('messages')
    const unsubscribeChatMessages = messagesRef.orderBy('timestamp', 'desc').limit(MESSAGE_LIMIT)
      .onSnapshot((snapshot) => {
      if(!snapshot.empty) {
        if (init && snapshot.docChanges().length < MESSAGE_LIMIT) {
          console.log('messages loaded:', snapshot.docChanges().length)
          init = false
          const chat = ctx.state.chats.find(item => item.id === chatId)
          ctx.commit('UPDATE_CHAT', {...chat, allOldMessagesLoaded: true})
        }
        snapshot.docChanges().forEach(async (change) => {
          const chat = ctx.state.chats.find(item => item.id === chatId)

          if (change.type === "added") {
            const msgData = change.doc.data()
            msgData.id = change.doc.id
            console.log('new message:', msgData)
            let newMessages = chat.newMessages
            // New message badge information
            if (chatId !== 'public') {
              const lastSeenMessage = chat.usersLastSeenMessages[ctx.state.user.id]
              if (msgData.id !== lastSeenMessage.id &&
              msgData.timestamp > lastSeenMessage.timestamp &&
              (!ctx.state.authUser || msgData.uid !== ctx.state.authUser.uid)) {
                newMessages += 1
              }
            }
            if (chat.messages.length && msgData.timestamp < chat.messages[0].timestamp) {
              const messages = chat.messages.slice()
              messages.unshift(msgData)
              ctx.commit('UPDATE_CHAT', {...chat, messages, newMessages})
            }
            else if (chat.messages.length > 1) {
              const messages = chat.messages.slice()
              messages.push(msgData)
              ctx.commit('UPDATE_CHAT', {...chat, messages, newMessages})
            } else {
              const messages = chat.messages.slice()
              messages.push(msgData)
              ctx.commit('UPDATE_CHAT', {...chat, messages, newMessages})
            }
          } else if (change.type === "modified") {
            console.log("Modified message: ", change.doc.data());
            const newMessage = change.doc.data()
            newMessage.id = change.doc.id
            const index = chat.messages.findIndex((item) => item.id === change.doc.id)
            const messages = chat.messages.slice()
            newMessage.edited = true
            messages[index] = newMessage
            ctx.commit('UPDATE_CHAT', {...chat, messages})
          }
          if (change.type === "removed") {
            console.log("Removed message: ", change.doc.data());
          }
        })
      }
    })
    chatMessages.push({id: chatId, unsubscribeChatMessages})
  },

  async loadOldMessages (ctx, chatId) {
    console.log('loadOldMessages')
    const chat = ctx.state.chats.find(item => item.id === chatId)
    if (chat && chat.messages.length) {
      let allOldMessagesLoaded = false
      ctx.commit('UPDATE_CHAT', {...chat, loadingMessages: true})
      const firstMessage = chat.messages[0]
      const chatMessagesRef = this.$fire.firestore.collection('chats').doc(chatId)
          .collection('messages').where('timestamp', '<', firstMessage.timestamp)
      const olderMessagesRaw = await chatMessagesRef.orderBy('timestamp', 'desc').limit(MESSAGE_LIMIT).get()
      if(olderMessagesRaw.docs.length < MESSAGE_LIMIT) {
        allOldMessagesLoaded = true
      }
      const olderMessages = []
      for (const snapshot of olderMessagesRaw.docs) {
        const doc = snapshot.data()
        doc.id = snapshot.id
        doc.watched = false
        olderMessages.unshift(doc)
      }
      const messages = chat.messages.slice()
      messages.unshift(...olderMessages)
      ctx.commit('UPDATE_CHAT', {...chat, messages, loadingMessages: false, allOldMessagesLoaded})
    } else {
      ctx.commit('UPDATE_CHAT', {...chat, allOldMessagesLoaded: true})
    }
  }
}
