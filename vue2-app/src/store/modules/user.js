export default {
  namespaced: true,
  state: { role: 'user' },
  mutations: {
    setRole(state, role) { state.role = role }
  }
}


