export function appReducer(state, action) {
  switch (action.type) {
    case 'GO':
      return { ...state, screen: action.screen, ...action.extra };

    case 'TOGGLE_LIKE':
      return { ...state, liked: { ...state.liked, [action.postId]: !state.liked[action.postId] } };

    case 'TOGGLE_JOIN':
      return { ...state, joined: { ...state.joined, [action.groupId]: !state.joined[action.groupId] } };

    case 'SET_ALBUM_ITEMS':
      return { ...state, albumItems: action.items };

    // Fallback deliberado — cobre o restante das transições simples do app
    // original (ex.: setState({ printing: true })) sem precisar de uma
    // action nomeada para cada campo.
    case 'MERGE':
      return { ...state, ...action.payload };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
