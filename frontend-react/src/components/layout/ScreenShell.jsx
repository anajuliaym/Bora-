import styles from './ScreenShell.module.css';

/**
 * Wrapper padrão de tela: ocupa `inset:0` dentro do app-shell e roda a
 * animação de entrada `screenIn` (portada de Bora App.dc.html). Cada tela
 * pode sobrepor `className`/`style` para casos com background diferente
 * (ex: Login com imagem, Cadastro com blobs coloridos).
 */
export default function ScreenShell({ children, className, style, overflow = 'auto' }) {
  return (
    <div
      className={[styles.screen, className].filter(Boolean).join(' ')}
      style={{ overflow, ...style }}
    >
      {children}
    </div>
  );
}
