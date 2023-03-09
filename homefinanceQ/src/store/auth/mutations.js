export function SET_USER(state, isAuthenticated) {
  state.isAuthenticated = true;
}

export function LOG_OUT(state, isAuthenticated) {
  state.isAuthenticated = null;
}
