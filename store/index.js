export const state = () => {
  return {
    authUser: null,
    user: null,
  }
}

export const getters = {

}

export const mutations = {
  SET_AUTH_USER (state, { authUser }) {
    console.log('SET_AUTH_USER: ', authUser)
    state.authUser = {
      uid: authUser.uid,
      email: authUser.email
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
  RESET_STORE (state) {
    console.log('RESET_STORE')
    state.authUser = null
    state.user = null
  },
}

export const actions = {
  onAuthStateChangedAction (ctx, { authUser }) {
    if (authUser) {
      ctx.commit('SET_AUTH_USER', { authUser })
      ctx.dispatch('getUserInfo', authUser.uid)
    } else {
      ctx.commit('RESET_STORE')
    }
  },

  async getUserInfo (ctx, userId) {
    const ref = this.$fire.firestore.collection('users').doc(userId)
    const unsubscribeUser = ref.onSnapshot(async (snapshot) => {
      if(snapshot.exists) {
        try {
          const user = snapshot.data()
          user.id = userId
          if (user.avatar) {
            const avatar = await this.$storage.getUserAvatar(user.avatar)
            user.avatar = avatar
          } else if (user.googleAvatar) {
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
}
