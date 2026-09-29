import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Grafo {

    // Tipo do Grafo (0 a 7), conforme definido no enunciado do projeto
    private int tipo;

    // Vetor de objetos Endereco: um Endereco por vértice (região ou local)
    private ArrayList<Endereco> vertices;

    // Matriz de adjacência: matriz[i][j] = peso da aresta i->j, ou +Infinito se não existe
    private double[][] matriz;

    private static final double SEM_ARESTA = Double.POSITIVE_INFINITY;

    public Grafo() {
        this.tipo = 0;
        this.vertices = new ArrayList<>();
        this.matriz = new double[0][0];
    }

    // ---------------------------------------------------------------------
    // Helpers sobre o Tipo do Grafo
    // ---------------------------------------------------------------------

    public boolean isDirecionado() {
        return tipo >= 4;
    }

    public boolean temPesoVertice() {
        return tipo == 1 || tipo == 3 || tipo == 5 || tipo == 7;
    }

    public boolean temPesoAresta() {
        return tipo == 2 || tipo == 3 || tipo == 6 || tipo == 7;
    }

    public int getTipo() {
        return tipo;
    }

    public void setTipo(int tipo) {
        this.tipo = tipo;
    }

    public int numVertices() {
        return vertices.size();
    }

    public ArrayList<Endereco> getVertices() {
        return vertices;
    }

    /**
     * Conta o número de arestas atualmente presentes na matriz (m), respeitando
     * se o grafo é direcionado (conta cada entrada != SEM_ARESTA) ou não
     * direcionado (conta cada par {i,j} uma única vez, pois a matriz é
     * simétrica nesse caso).
     */
    public int numArestas() {
        int n = numVertices();
        int count = 0;
        for (int i = 0; i < n; i++) {
            int jIni = isDirecionado() ? 0 : i; // não direcionado: evita contar (i,j) e (j,i) duas vezes
            for (int j = jIni; j < n; j++) {
                if (i == j) continue;
                if (matriz[i][j] != SEM_ARESTA) count++;
            }
        }
        return count;
    }

    // ---------------------------------------------------------------------
    // a) Ler dados do arquivo grafo.txt
    // ---------------------------------------------------------------------

    private static final Pattern PADRAO_VERTICE =
            Pattern.compile("^(\\d+)\\s+\"(.*)\"\\s+(\\S+)\\s*$");

    public void lerArquivo(String caminho) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(caminho))) {
            tipo = Integer.parseInt(br.readLine().trim());

            int n = Integer.parseInt(br.readLine().trim());
            ArrayList<Endereco> novosVertices = new ArrayList<>(n);
            for (int i = 0; i < n; i++) {
                String linha = br.readLine();
                Matcher m = PADRAO_VERTICE.matcher(linha);
                if (!m.matches()) {
                    throw new IOException("Linha de vértice em formato inválido: " + linha);
                }
                int idNoArquivo = Integer.parseInt(m.group(1));
                if (idNoArquivo != i) {
                    throw new IOException("Id do vértice fora de ordem na linha " + (i + 1)
                            + ": esperado " + i + ", encontrado " + idNoArquivo
                            + " (o id deve coincidir com a posição no vetor).");
                }
                String rotulo = m.group(2);
                double peso = Double.parseDouble(m.group(3));
                novosVertices.add(new Endereco(rotulo, peso)); // id = posição i no vetor, não é guardado no objeto
            }

            int mArestas = Integer.parseInt(br.readLine().trim());
            double[][] novaMatriz = criarMatrizVazia(n);
            for (int i = 0; i < mArestas; i++) {
                String linha = br.readLine();
                if (linha == null || linha.trim().isEmpty()) continue;
                String[] partes = linha.trim().split("\\s+");
                int origem = Integer.parseInt(partes[0]);
                int destino = Integer.parseInt(partes[1]);
                double peso = (partes.length >= 3) ? Double.parseDouble(partes[2]) : 0.0;

                novaMatriz[origem][destino] = peso;
                if (!isDirecionado()) {
                    novaMatriz[destino][origem] = peso;
                }
            }

            this.vertices = novosVertices;
            this.matriz = novaMatriz;
        }
    }

    private double[][] criarMatrizVazia(int n) {
        double[][] m = new double[n][n];
        for (double[] linha : m) {
            java.util.Arrays.fill(linha, SEM_ARESTA);
        }
        return m;
    }

    // ---------------------------------------------------------------------
    // b) Gravar dados no arquivo grafo.txt (mesmo formato da leitura)
    // ---------------------------------------------------------------------

    public void gravarArquivo(String caminho) throws IOException {
        try (FileWriter fw = new FileWriter(caminho)) {
            fw.write(tipo + "\n");
            fw.write(numVertices() + "\n");
            for (int i = 0; i < numVertices(); i++) {
                fw.write(vertices.get(i).toLinhaArquivo(i) + "\n");
            }

            List<String> linhasArestas = new ArrayList<>();
            int n = numVertices();
            for (int i = 0; i < n; i++) {
                int jIni = isDirecionado() ? 0 : i;
                for (int j = jIni; j < n; j++) {
                    if (i == j) continue;
                    if (matriz[i][j] != SEM_ARESTA) {
                        linhasArestas.add(i + " " + j + " " + Endereco.formatarPeso(matriz[i][j]));
                    }
                }
            }

            fw.write(linhasArestas.size() + "\n");
            for (String linha : linhasArestas) {
                fw.write(linha + "\n");
            }
        }
    }

    // ---------------------------------------------------------------------
    // c) Inserir vértice
    // ---------------------------------------------------------------------

    /** Insere um vértice a partir apenas do rótulo completo (endereço é derivado automaticamente). */
    public int inserirVertice(String rotulo, double peso) {
        return inserirVerticeInterno(new Endereco(rotulo, peso));
    }

    /** Insere um vértice informando endereço (nome/apelido) e rótulo completo separadamente. */
    public int inserirVertice(String endereco, String rotulo, double peso) {
        return inserirVerticeInterno(new Endereco(endereco, rotulo, peso));
    }

    private int inserirVerticeInterno(Endereco novoEndereco) {
        int n = numVertices(); // tamanho antigo = id que o novo vértice vai receber
        vertices.add(novoEndereco); // fica na posição n do vetor => seu "id" passa a ser n

        double[][] novaMatriz = criarMatrizVazia(n + 1);
        for (int i = 0; i < n; i++) {
            System.arraycopy(matriz[i], 0, novaMatriz[i], 0, n);
        }
        matriz = novaMatriz;
        return n;
    }

    // ---------------------------------------------------------------------
    // d) Inserir aresta
    // ---------------------------------------------------------------------

    public boolean inserirAresta(int origem, int destino, double peso) {
        if (!verticeValido(origem) || !verticeValido(destino) || origem == destino) return false;
        matriz[origem][destino] = peso;
        if (!isDirecionado()) {
            matriz[destino][origem] = peso;
        }
        return true;
    }

    // ---------------------------------------------------------------------
    // e) Remover vértice (e todas as arestas ligadas a ele)
    // ---------------------------------------------------------------------

    public boolean removerVertice(int id) {
        if (!verticeValido(id)) return false;

        vertices.remove(id);
        // Não é preciso reindexar nada nos objetos Endereco: como eles não guardam
        // id próprio, os vértices que vinham depois automaticamente "viram" o id
        // anterior menos 1, só por terem deslizado uma posição no ArrayList.

        int n = matriz.length;
        double[][] novaMatriz = criarMatrizVazia(n - 1);
        for (int i = 0, ni = 0; i < n; i++) {
            if (i == id) continue;
            for (int j = 0, nj = 0; j < n; j++) {
                if (j == id) continue;
                novaMatriz[ni][nj] = matriz[i][j];
                nj++;
            }
            ni++;
        }
        matriz = novaMatriz;
        return true;
    }

    // ---------------------------------------------------------------------
    // f) Remover aresta
    // ---------------------------------------------------------------------

    public boolean removerAresta(int origem, int destino) {
        if (!verticeValido(origem) || !verticeValido(destino)) return false;
        boolean existia = matriz[origem][destino] != SEM_ARESTA;
        matriz[origem][destino] = SEM_ARESTA;
        if (!isDirecionado()) {
            matriz[destino][origem] = SEM_ARESTA;
        }
        return existia;
    }

    private boolean verticeValido(int id) {
        return id >= 0 && id < numVertices();
    }

    // ---------------------------------------------------------------------
    // g) Mostrar conteúdo do arquivo (tipo, vértices e arestas) de forma legível
    // ---------------------------------------------------------------------

    public String mostrarConteudoArquivo() {
        StringBuilder sb = new StringBuilder();
        sb.append("Tipo do grafo: ").append(tipo).append(" - ").append(descreverTipo(tipo)).append("\n");
        sb.append("Quantidade de vértices (n): ").append(numVertices()).append("\n");
        sb.append("Quantidade de arestas (m): ").append(numArestas()).append("\n\n");

        sb.append("--- Vértices ---\n");
        for (int i = 0; i < numVertices(); i++) {
            Endereco e = vertices.get(i);
            sb.append(String.format("  [%3d] %-55s peso=%s%n",
                    i, e.getRotulo(), Endereco.formatarPeso(e.getPeso())));
        }

        sb.append("\n--- Arestas ---\n");
        int n = numVertices();
        for (int i = 0; i < n; i++) {
            int jIni = isDirecionado() ? 0 : i;
            for (int j = jIni; j < n; j++) {
                if (i == j) continue;
                if (matriz[i][j] != SEM_ARESTA) {
                    String seta = isDirecionado() ? " -> " : " -- ";
                    sb.append(String.format("  %3d%s%-3d  peso=%s%n",
                            i, seta, j, Endereco.formatarPeso(matriz[i][j])));
                }
            }
        }
        return sb.toString();
    }

    public static String descreverTipo(int tipo) {
        switch (tipo) {
            case 0: return "grafo não orientado sem peso";
            case 1: return "grafo não orientado com peso no vértice";
            case 2: return "grafo não orientado com peso na aresta";
            case 3: return "grafo não orientado com peso nos vértices e arestas";
            case 4: return "grafo orientado sem peso";
            case 5: return "grafo orientado com peso no vértice";
            case 6: return "grafo orientado com peso na aresta";
            case 7: return "grafo orientado com peso nos vértices e arestas";
            default: return "tipo desconhecido";
        }
    }

    // ---------------------------------------------------------------------
    // h) Mostrar o grafo (lista de adjacência derivada da matriz, mais legível
    //    que a matriz completa quando n é grande - ex.: 80 vértices)
    // ---------------------------------------------------------------------

    public String mostrarGrafo() {
        StringBuilder sb = new StringBuilder();
        int n = numVertices();
        for (int i = 0; i < n; i++) {
            sb.append(String.format("[%3d] %s:%n", i, vertices.get(i).getRotulo()));
            boolean algumVizinho = false;
            for (int j = 0; j < n; j++) {
                if (i == j) continue;
                if (matriz[i][j] != SEM_ARESTA) {
                    algumVizinho = true;
                    sb.append(String.format("        -> [%3d] %-45s (peso=%s)%n",
                            j, vertices.get(j).getRotulo(), Endereco.formatarPeso(matriz[i][j])));
                }
            }
            if (!algumVizinho) {
                sb.append("        (sem vizinhos)\n");
            }
        }
        return sb.toString();
    }

    /** Imprime a matriz de adjacência "crua" (útil para grafos pequenos de teste). */
    public String mostrarMatriz() {
        StringBuilder sb = new StringBuilder();
        int n = numVertices();
        sb.append("     ");
        for (int j = 0; j < n; j++) sb.append(String.format("%6d", j));
        sb.append("\n");
        for (int i = 0; i < n; i++) {
            sb.append(String.format("%4d ", i));
            for (int j = 0; j < n; j++) {
                if (matriz[i][j] == SEM_ARESTA) sb.append("     -");
                else sb.append(String.format("%6s", Endereco.formatarPeso(matriz[i][j])));
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    // ---------------------------------------------------------------------
    // i) Conexidade (C0-C3) e Grafo Reduzido
    //
    // Implementado com a técnica de FECHO DIRETO/INVERSO por ponto fixo,
    // exatamente como ensinado em aula (Ex15, Ex16 e Ex17): em vez de uma
    // busca em profundidade clássica (Kosaraju), repete-se a marcação de
    // vizinhos até não conseguir marcar mais ninguém novo. É um pouco menos
    // eficiente que Kosaraju (O(n^3) em vez de O(n^2)), mas é o algoritmo
    // apresentado na disciplina e mais fácil de explicar na apresentação.
    // ---------------------------------------------------------------------

    /** Resultado da análise de conexidade, para exibição no menu. */
    public static class ResultadoConexidade {
        public String classificacao;           // "Conexo"/"Desconexo" (não direcionado) ou "C0".."C3" (direcionado)
        public List<List<Integer>> componentes; // componentes conexas / fortemente conexas
        public String grafoReduzidoTexto;       // representação textual do grafo reduzido (só p/ direcionado)
    }

    /**
     * R+(v): conjunto de vértices alcançáveis a PARTIR de v (inclui o próprio v),
     * seguindo o sentido das arestas. Fecho transitivo direto por ponto fixo
     * (mesma técnica do método fechoDireto() do Ex16/Ex17).
     */
    private boolean[] fechoDireto(int v) {
        int n = numVertices();
        boolean[] r = new boolean[n];
        r[v] = true;
        boolean mudou = true;
        while (mudou) {
            mudou = false;
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (r[i] && matriz[i][j] != SEM_ARESTA && !r[j]) {
                        r[j] = true;
                        mudou = true;
                    }
                }
            }
        }
        return r;
    }

    /**
     * R-(v): conjunto de vértices que CONSEGUEM CHEGAR em v (inclui o próprio v).
     * Fecho transitivo inverso por ponto fixo (mesma técnica do fechoInverso() do Ex16/Ex17).
     */
    private boolean[] fechoInverso(int v) {
        int n = numVertices();
        boolean[] r = new boolean[n];
        r[v] = true;
        boolean mudou = true;
        while (mudou) {
            mudou = false;
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (r[j] && matriz[i][j] != SEM_ARESTA && !r[i]) {
                        r[i] = true;
                        mudou = true;
                    }
                }
            }
        }
        return r;
    }

    public ResultadoConexidade apresentarConexidade() {
        ResultadoConexidade r = new ResultadoConexidade();
        if (!isDirecionado()) {
            r.componentes = componentesConexasNaoDirecionado();
            r.classificacao = (r.componentes.size() <= 1) ? "Conexo" : "Desconexo (" + r.componentes.size() + " componentes)";
            r.grafoReduzidoTexto = null; // reduzido só se aplica a componentes fortemente conexas (grafo direcionado)
            return r;
        }

        // Grafo direcionado: usa fechoDireto/fechoInverso para achar as
        // Componentes Fortemente Conexas e classificar em C0..C3 (Ex16/Ex17).
        List<List<Integer>> scc = componentesFortementeConexas();
        r.componentes = scc;

        if (isFortementeConexo()) {
            r.classificacao = "C3 (fortemente conexo)";
        } else if (isUnilateralmenteConexo()) {
            r.classificacao = "C2 (unilateralmente conexo)";
        } else if (isConexoIgnorandoDirecao()) {
            r.classificacao = "C1 (conexo / fracamente conexo)";
        } else {
            r.classificacao = "C0 (desconexo)";
        }

        r.grafoReduzidoTexto = montarTextoGrafoReduzido(scc);
        return r;
    }

    /**
     * Componentes conexas de um grafo NÃO direcionado: como a matriz é simétrica,
     * R+(v) já é exatamente a componente inteira de v (não precisa também do R-(v)).
     */
    private List<List<Integer>> componentesConexasNaoDirecionado() {
        int n = numVertices();
        boolean[] jaEstaEmComponente = new boolean[n];
        List<List<Integer>> componentes = new ArrayList<>();

        for (int v = 0; v < n; v++) {
            if (jaEstaEmComponente[v]) continue;
            boolean[] r = fechoDireto(v);
            List<Integer> comp = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if (r[i]) {
                    comp.add(i);
                    jaEstaEmComponente[i] = true;
                }
            }
            componentes.add(comp);
        }
        return componentes;
    }

    /** C3 - fortemente conexo: de QUALQUER vértice dá pra chegar em todos os outros. */
    private boolean isFortementeConexo() {
        int n = numVertices();
        for (int v = 0; v < n; v++) {
            boolean[] r = fechoDireto(v);
            for (int i = 0; i < n; i++) {
                if (!r[i]) return false;
            }
        }
        return true;
    }

    /** C2 - unilateralmente conexo: para TODO par de vértices, pelo menos um alcança o outro. */
    private boolean isUnilateralmenteConexo() {
        int n = numVertices();
        for (int v = 0; v < n; v++) {
            boolean[] rd = fechoDireto(v);
            boolean[] ri = fechoInverso(v);
            for (int i = 0; i < n; i++) {
                if (!rd[i] && !ri[i]) return false;
            }
        }
        return true;
    }

    /** C1 - conexo ignorando a direção (fracamente conexo): ligando os arcos nos dois sentidos,
     *  dá pra ir de qualquer vértice a qualquer outro. */
    private boolean isConexoIgnorandoDirecao() {
        int n = numVertices();
        if (n == 0) return true;
        boolean[] visitado = new boolean[n];
        visitado[0] = true;
        boolean mudou = true;
        while (mudou) {
            mudou = false;
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (visitado[i] && (matriz[i][j] != SEM_ARESTA || matriz[j][i] != SEM_ARESTA) && !visitado[j]) {
                        visitado[j] = true;
                        mudou = true;
                    }
                }
            }
        }
        for (boolean v : visitado) {
            if (!v) return false;
        }
        return true;
    }

    /**
     * Componentes Fortemente Conexas: a componente de v é a INTERSECÇÃO entre
     * R+(v) e R-(v), ou seja, os vértices que estão nos dois fechos ao mesmo
     * tempo (mesma lógica do componentesFConexas() do Ex17).
     */
    private List<List<Integer>> componentesFortementeConexas() {
        int n = numVertices();
        int[] idComponente = new int[n];
        java.util.Arrays.fill(idComponente, -1);
        List<List<Integer>> sccs = new ArrayList<>();
        int c = 0;

        for (int v = 0; v < n; v++) {
            if (idComponente[v] != -1) continue;
            boolean[] rd = fechoDireto(v);
            boolean[] ri = fechoInverso(v);
            List<Integer> compAtual = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if (rd[i] && ri[i] && idComponente[i] == -1) {
                    idComponente[i] = c;
                    compAtual.add(i);
                }
            }
            sccs.add(compAtual);
            c++;
        }
        return sccs;
    }

    private int[] mapeiaVerticeParaComponente(List<List<Integer>> scc) {
        int[] idComponente = new int[numVertices()];
        for (int c = 0; c < scc.size(); c++) {
            for (int v : scc.get(c)) idComponente[v] = c;
        }
        return idComponente;
    }

    /**
     * Grafo reduzido: um vértice para cada componente fortemente conexa, com um
     * arco entre duas componentes quando existe pelo menos um arco entre elas no
     * grafo original (mesma ideia do grafoReduzido() do Ex17).
     */
    private String montarTextoGrafoReduzido(List<List<Integer>> scc) {
        if (scc.size() <= 1) {
            return "O grafo reduzido possui um único vértice (o grafo original já é fortemente conexo).";
        }
        int[] idComponente = mapeiaVerticeParaComponente(scc);
        int k = scc.size();
        boolean[][] cond = new boolean[k][k];
        int n = numVertices();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i != j && matriz[i][j] != SEM_ARESTA) {
                    int ci = idComponente[i], cj = idComponente[j];
                    if (ci != cj) cond[ci][cj] = true;
                }
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Vértices do grafo reduzido (cada um representa uma componente fortemente conexa):\n");
        for (int c = 0; c < scc.size(); c++) {
            sb.append(String.format("  S%d = { ", c));
            for (int v : scc.get(c)) {
                sb.append(vertices.get(v).getRotulo()).append("; ");
            }
            sb.append("}\n");
        }
        sb.append("Arestas do grafo reduzido:\n");
        boolean algumaAresta = false;
        for (int i = 0; i < k; i++) {
            for (int j = 0; j < k; j++) {
                if (cond[i][j]) {
                    sb.append(String.format("  S%d -> S%d%n", i, j));
                    algumaAresta = true;
                }
            }
        }
        if (!algumaAresta) sb.append("  (nenhuma)\n");
        return sb.toString();
    }
}
