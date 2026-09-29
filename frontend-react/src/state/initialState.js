export const initialState = {
  screen: 'login',
  showNavLabels: true,

  liked: {},
  joined: {},
  goingMap: { 0: true, 2: true },
  saved: false,

  chatThread: null,
  posted: false,
  backFrom: 'feed',

  challengeTab: 'diario',
  filterIdx: 0,

  printing: false,
  postedFilter: 'none',

  xpShow: false,
  xpVal: 0,

  albumSpread: 0,
  albumSel: null,
  albumTab: 'stickers',
  albumItems: null,
  currentAlbumId: 'default',

  capturedPhoto: null,
  camDenied: false,
  camError: null,
  camCaption: '',
  camModelReady: false,

  albumTextDraft: '',
  albumTextFont: 'poppins',

  // Campos criados dinamicamente via setState no app original — declarados
  // aqui explicitamente para servir de documentação viva do shape do state.
  viewingProfile: null,
  prevNavScreen: null,
  eventIdx: null,
  photoZoom: false,
  postedCaption: '',
  polaroidView: null,
  albumReadOnly: false,
  roAlbumData: null,
  roAlbumName: null,
  roleWhen: 'todos',
  roleDist: null,
  roleFree: false,
  roleCats: null,

  // Conta e fotos no Supabase (null/0 = modo protótipo, ver api-supabase.js)
  usuario: null,
  fotosVersao: 0,
  fotoEnviadaId: null,
  fotoErro: null,
};
