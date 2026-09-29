// Cor de cada categoria do grafo (rótulo `Nome [Categoria]` do grafo.txt).
export const CAT_COLORS = {
  'Ar Livre': 'rgb(76, 175, 110)',
  Bar: 'rgb(226, 98, 160)',
  Cultura: 'rgb(112, 97, 163)',
  Educação: 'rgb(38, 166, 154)',
  Esporte: 'rgb(51, 132, 170)',
  Games: 'rgb(92, 107, 192)',
  Gastronomia: 'rgb(240, 160, 50)',
  Geral: 'rgb(120, 134, 150)',
  Lazer: 'rgb(255, 120, 80)',
  Leitura: 'rgb(141, 110, 99)',
  Música: 'rgb(255, 0, 127)',
  Yoga: 'rgb(150, 190, 90)',
};

export const corDe = (categoria) => CAT_COLORS[categoria] || CAT_COLORS.Geral;

export const CAT_ICONS = {
  'Ar Livre': '🌳', Bar: '🍺', Cultura: '🎭', Educação: '🎓', Esporte: '⚽', Games: '🎮',
  Gastronomia: '🍔', Geral: '📍', Lazer: '🎡', Leitura: '📚', Música: '🎵', Yoga: '🧘',
};
