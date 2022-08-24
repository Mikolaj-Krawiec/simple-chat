export default function ({ store, redirect }) {
  if (!store.state.authUser) return redirect('/')
  else if (!store.state.authUser.emailVerified) {
    return redirect('/unverified')
  }
}
