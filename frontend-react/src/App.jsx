import { useReducer } from 'react';
import { initialState } from './state/initialState.js';
import { appReducer } from './state/appReducer.js';
import { useXpCounter } from './hooks/useXpCounter.js';
import BottomNav from './components/layout/BottomNav.jsx';
import PolaroidModal from './components/shared/PolaroidModal.jsx';
import XpShow from './components/shared/XpShow.jsx';
import Login from './components/screens/Login/Login.jsx';
import Cadastro from './components/screens/Cadastro/Cadastro.jsx';
import Feed from './components/screens/Feed/Feed.jsx';
import Agenda from './components/screens/Agenda/Agenda.jsx';
import Desafios from './components/screens/Desafios/Desafios.jsx';
import Mapa from './components/screens/Mapa/Mapa.jsx';
import Descobrir from './components/screens/Descobrir/Descobrir.jsx';
import Evento from './components/screens/Evento/Evento.jsx';
import Perfil from './components/screens/Perfil/Perfil.jsx';
import Ranking from './components/screens/Ranking/Ranking.jsx';
import Chat from './components/screens/Chat/Chat.jsx';
import Camera from './components/screens/Camera/Camera.jsx';
import Album from './components/screens/Album/Album.jsx';

function Placeholder({ name }) {
  return <div style={{ padding: 24 }}>Tela: {name}</div>;
}

const SCREENS = {
  login: Login,
  cadastro: Cadastro,
  feed: Feed,
  agenda: Agenda,
  desafios: Desafios,
  camera: Camera,
  mapa: Mapa,
  descobrir: Descobrir,
  evento: Evento,
  perfil: Perfil,
  ranking: Ranking,
  chat: Chat,
  album: Album,
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const go = (screen, extra) => {
    // goFeed no original sempre limpa chatThread — replicado aqui pra não
    // precisar lembrar disso em cada ponto de navegação pro feed.
    const merged = screen === 'feed' ? { chatThread: null, ...extra } : extra;
    dispatch({ type: 'GO', screen, extra: merged });
  };

  const { start: startXp } = useXpCounter(dispatch);
  const Screen = SCREENS[state.screen] || Placeholder;

  return (
    <div className="app-shell">
      <Screen state={state} dispatch={dispatch} go={go} name={state.screen} startXp={startXp} />
      <BottomNav state={state} go={go} />

      {state.polaroidView != null && (
        <PolaroidModal
          index={state.polaroidView}
          onClose={() => dispatch({ type: 'MERGE', payload: { polaroidView: null } })}
        />
      )}
      {state.xpShow && (
        <XpShow
          xpVal={state.xpVal}
          onClose={() => dispatch({ type: 'MERGE', payload: { xpShow: false } })}
        />
      )}
    </div>
  );
}
