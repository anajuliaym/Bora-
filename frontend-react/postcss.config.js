import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

// Vite processa cada arquivo CSS numa passada de PostCSS independente, então
// postcss-custom-media não veria o `@custom-media --bp-*` de tokens.css nos
// outros arquivos sem isso — postcss-global-data injeta esse contexto antes
// (por isso vem primeiro na lista, em vez de usar a forma { plugin: opts }
// que depende da ordem das chaves do objeto).
export default {
  plugins: [
    postcssGlobalData({ files: ['./src/styles/tokens.css'] }),
    postcssCustomMedia(),
  ],
};
