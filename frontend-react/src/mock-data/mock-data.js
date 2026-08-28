// Dados mockados portados de frontend/Bora App.dc.html (propriedades de classe
// do componente original: stickerList, filters, grads, basePosts, challenges,
// eventsData, gruposData, rankingData, chatsData, mensagensData, confetti).
// SUBSTITUIR EM PRODUÇÃO: tudo aqui é estático — o app não tem backend real,
// então feed/eventos/ranking/chats nunca mudam nem persistem entre sessões.

export const stickerList = Array.from(
  { length: 37 },
  (_, i) => '/assets/stickers/s' + String(i + 1).padStart(2, '0') + '.webp',
);

export const stickerDims = [
  [217, 174], [231, 199], [191, 212], [146, 214], [205, 209], [250, 134], [186, 153],
  [241, 138], [216, 176], [127, 221], [102, 234], [107, 104], [173, 194], [201, 290],
  [160, 165], [173, 229], [165, 218], [144, 192], [77, 77], [124, 215], [169, 201],
  [191, 123], [202, 232], [198, 235], [126, 229], [140, 142], [198, 152], [183, 216],
  [223, 167], [185, 165], [116, 132], [164, 219], [150, 239], [125, 332], [114, 116],
  [228, 149], [221, 187],
];

export function stickerBox(src, target) {
  const idx = stickerList.indexOf(src);
  const d = idx >= 0 ? stickerDims[idx] : [1, 1];
  const long = Math.max(d[0], d[1]);
  return { w: Math.round((target * d[0]) / long), h: Math.round((target * d[1]) / long) };
}

export const filters = [
  { n: 'Normal', css: 'none' },
  { n: 'D Clássico', css: 'saturate(1.35) contrast(1.15) brightness(1.03) sepia(0.08)' },
  { n: 'Retrô 80', css: 'sepia(0.42) saturate(1.3) contrast(1.08) brightness(1.05)' },
  { n: 'VHS', css: 'saturate(1.6) hue-rotate(-12deg) contrast(1.05) brightness(1.06)' },
  { n: 'Fuji', css: 'saturate(0.8) contrast(0.92) brightness(1.1) sepia(0.14)' },
  { n: 'P&B', css: 'grayscale(1) contrast(1.2) brightness(1.05)' },
];

export const grads = [
  'rgb(168,214,150)',
  'rgb(244,198,92)',
  'rgb(120,186,224)',
  'rgb(244,198,92)',
  'rgb(226,98,160)',
];

export const basePosts = [
  { u: '@thiago_rolê', lvl: 12, loc: 'Bar do Zé, Vila Madalena', time: '23:45', badge: 'Desafio diário', cap: 'Desafio de hojee', likes: 87, bg: 'url(/assets/photo1.jpg) center/cover', avatarBg: 4, initial: 'T' },
  { u: '@marina.sp', lvl: 8, loc: 'Parque Ibirapuera', time: '18:02', badge: 'Desafio semanal', cap: 'Yoga no parque com o grupo', likes: 34, bg: 0, avatarBg: 0, initial: 'M' },
  { u: '@lets.codar', lvl: 5, loc: 'Casa do Saber, Pinheiros', time: '20:15', badge: null, cap: 'Clube de leitura de agosto', likes: 21, bg: 1, avatarBg: 2, initial: 'L' },
];

export const challenges = {
  diario: [
    { t: 'Vá a um rolê que você nunca foi', d: 'Faça check-in com foto em um lugar novo hoje.', xp: 120, done: false },
    { t: 'Poste uma foto no rolê', d: 'Tire a foto quando estiver no local — a localização confirma.', xp: 80, done: true },
  ],
  semanal: [
    { t: 'Participe de 2 eventos de grupos diferentes', d: 'Vale qualquer categoria: música, esporte, leitura...', xp: 300, done: false },
    { t: 'Leve um amigo a um rolê', d: 'Convide alguém pelo chat e façam check-in juntos.', xp: 250, done: false },
    { t: 'Conheça 3 pessoas novas', d: 'Troque mensagens com 3 pessoas que conheceu em eventos.', xp: 200, done: true },
  ],
  mensal: [
    { t: 'Complete 15 desafios diários', d: 'Constância vale mais que intensidade. 9/15 até agora.', xp: 800, done: false },
    { t: 'Explore 4 bairros diferentes', d: 'Check-ins em Vila Madalena, Pinheiros... faltam 2.', xp: 600, done: false },
  ],
};

export const eventsData = [
  { t: 'Sarau do Zé — música ao vivo', g: 'Rolês da Vila', membros: '1,2k', cat: 'Música', when: 'Hoje • 20h', loc: 'Bar do Zé, Vila Madalena', dist: '1,2 km', going: 38, bg: 4, dateTag: 'hoje', distKm: 1.2, free: false, desc: 'Sarau aberto com músicos da região. Chega cedo pra pegar lugar — e o desafio diário vale check-in aqui. Entrada livre, consumação no bar.' },
  { t: 'Treino aberto no Minhocão', g: 'Corre SP', membros: '2,3k', cat: 'Esporte', when: 'Hoje • 7h', loc: 'Minhocão, Santa Cecília', dist: '0,8 km', going: 64, bg: 3, dateTag: 'hoje', distKm: 0.8, free: true, desc: 'Treino de corrida em grupo, todos os ritmos. Alongamento coletivo antes e café depois.' },
  { t: 'Yoga grátis no parque', g: 'Respira SP', membros: '860', cat: 'Yoga', when: 'Sáb, 23 ago • 9h', loc: 'Parque Ibirapuera', dist: '3,4 km', going: 52, bg: 0, dateTag: 'semana', distKm: 3.4, free: true, desc: 'Aula aberta de yoga para todos os níveis. Leve seu tapete. Encontro no gramado perto do portão 3.' },
  { t: 'Clube de leitura de agosto', g: 'Entre Páginas', membros: '430', cat: 'Leitura', when: 'Dom, 24 ago • 16h', loc: 'Casa do Saber, Pinheiros', dist: '2,1 km', going: 19, bg: 1, dateTag: 'semana', distKm: 2.1, free: false, desc: 'Discussão do livro do mês com café incluso. Vagas limitadas — confirme presença.' },
];

export const gruposData = [
  { n: 'Rolês da Vila', m: '1,2k', emoji: 'R', bg: 4 },
  { n: 'Respira SP', m: '860', emoji: 'R', bg: 0 },
  { n: 'Entre Páginas', m: '430', emoji: 'E', bg: 1 },
  { n: 'Corre SP', m: '2,3k', emoji: 'C', bg: 3 },
];

export const rankingData = [
  { pos: 1, n: '@dudinha', lvl: 15, xp: '4.820 XP', i: 'D', bg: 1, me: false },
  { pos: 2, n: '@lets.codar', lvl: 13, xp: '3.140 XP', i: 'L', bg: 0, me: false },
  { pos: 3, n: 'você (@thiago_rolê)', lvl: 12, xp: '2.450 XP', i: 'T', bg: 4, me: true },
  { pos: 4, n: '@marina.sp', lvl: 8, xp: '1.890 XP', i: 'M', bg: 0, me: false },
  { pos: 5, n: '@pedrones', lvl: 7, xp: '1.520 XP', i: 'P', bg: 2, me: false },
  { pos: 6, n: '@carol.vibes', lvl: 6, xp: '1.100 XP', i: 'C', bg: 3, me: false },
];

export const chatsData = [
  { n: '@marina.sp', msg: 'Bora no sarau sexta?', t: '14:02', unread: 2, i: 'M', bg: 0 },
  { n: 'Rolês da Vila', msg: 'Pedro: alguém vai chegar cedo?', t: '13:40', unread: 5, i: 'R', bg: 4 },
  { n: '@dudinha', msg: 'kkkk aquele desafio foi difícil', t: 'ontem', unread: 0, i: 'D', bg: 1 },
  { n: 'Respira SP', msg: 'Aula confirmada pro sábado ✓', t: 'ontem', unread: 0, i: 'R', bg: 3 },
];

export const mensagensData = [
  { txt: 'Oi! Vi que você aceitou o desafio de hoje', me: false },
  { txt: 'siiim, vou no Bar do Zé mais tarde', me: true },
  { txt: 'Bora no sarau sexta?', me: false },
  { txt: 'Bora! Te encontro lá às 20h', me: true },
];

export const polaroids = [
  { bg: 'url(/assets/photo1.jpg) center/cover', rot: '-3deg', loc: 'Bar do Zé', cap: 'Noite de karaokê com a galera', date: '14 ago', role: 'Rolê de sexta - Vila Madalena', badge: 'Desafio diário' },
  { bg: 0, rot: '2.5deg', loc: 'Ibirapuera', cap: 'Piquenique de domingo', date: '10 ago', role: 'Piquenique no parque', badge: null },
  { bg: 1, rot: '1.5deg', loc: 'Pinheiros', cap: 'Happy hour depois do trampo', date: '5 ago', role: 'Happy hour Pinheiros', badge: 'Desafio semanal' },
  { bg: 3, rot: '-2deg', loc: 'Vila Madalena', cap: 'Show de música ao vivo', date: '30 jul', role: 'Rolê de sábado', badge: null },
  { bg: 2, rot: '3deg', loc: 'Centro', cap: 'Feira de rua no centro', date: '22 jul', role: 'Feira do Bixiga', badge: 'Desafio diário' },
  { bg: 4, rot: '-1.5deg', loc: 'Augusta', cap: 'Bar novo na Augusta', date: '15 jul', role: 'Bar do Zé', badge: null },
];

export const confetti = [
  { x: '4%', c: 'rgb(255,0,127)', d: '0s', dur: '2.2s', w: '9px', h: '14px' },
  { x: '12%', c: 'rgb(255,216,1)', d: '0.5s', dur: '2.6s', w: '7px', h: '11px' },
  { x: '20%', c: 'rgb(52,199,255)', d: '0.2s', dur: '2s', w: '8px', h: '13px' },
  { x: '28%', c: 'rgb(174,224,175)', d: '0.9s', dur: '2.4s', w: '10px', h: '10px' },
  { x: '36%', c: 'rgb(255,107,107)', d: '0.35s', dur: '2.1s', w: '7px', h: '12px' },
  { x: '44%', c: 'rgb(255,216,1)', d: '1.1s', dur: '2.7s', w: '9px', h: '9px' },
  { x: '52%', c: 'rgb(255,0,127)', d: '0.15s', dur: '2.3s', w: '8px', h: '14px' },
  { x: '60%', c: 'rgb(52,199,255)', d: '0.7s', dur: '2s', w: '10px', h: '11px' },
  { x: '68%', c: 'rgb(174,224,175)', d: '0.05s', dur: '2.5s', w: '7px', h: '12px' },
  { x: '76%', c: 'rgb(255,107,107)', d: '0.85s', dur: '2.2s', w: '9px', h: '10px' },
  { x: '84%', c: 'rgb(255,216,1)', d: '0.4s', dur: '2.4s', w: '8px', h: '13px' },
  { x: '92%', c: 'rgb(255,0,127)', d: '1s', dur: '2.6s', w: '7px', h: '11px' },
  { x: '16%', c: 'rgb(112,97,163)', d: '1.4s', dur: '2.3s', w: '8px', h: '12px' },
  { x: '48%', c: 'rgb(112,97,163)', d: '1.6s', dur: '2.5s', w: '9px', h: '9px' },
  { x: '72%', c: 'rgb(255,255,255)', d: '1.3s', dur: '2.1s', w: '7px', h: '10px' },
  { x: '88%', c: 'rgb(52,199,255)', d: '1.7s', dur: '2.4s', w: '8px', h: '12px' },
];
