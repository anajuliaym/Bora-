import java.io.IOException;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Scanner;

/**
Gabriel Mires Camargo 10436741
Ana Julia Yaguti Matilha 10436655
Jiye Huang 10438990
 */
public class Main {

    private static final String TITULO =
            "===== Grafo de Locais de Interesse - Cidade de São Paulo =====";
    private static final String ARQUIVO_PADRAO = "grafo.txt";

    private static Grafo grafo = new Grafo();
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) throws UnsupportedEncodingException {
        // Força UTF-8 na entrada/saída, independente do encoding padrão do console
        // (evita caracteres acentuados quebrados no Windows/VS Code).
        System.setOut(new PrintStream(System.out, true, "UTF-8"));
        scanner = new Scanner(System.in, StandardCharsets.UTF_8);
        scanner.useLocale(Locale.US); // garante "." como separador decimal na leitura de doubles

        boolean sair = false;
        while (!sair) {
            exibirMenu();
            String opcao = scanner.nextLine().trim().toLowerCase();

            switch (opcao) {
                case "a": lerArquivo(); break;
                case "b": gravarArquivo(); break;
                case "c": inserirVertice(); break;
                case "d": inserirAresta(); break;
                case "e": removerVertice(); break;
                case "f": removerAresta(); break;
                case "g": mostrarConteudoArquivo(); break;
                case "h": mostrarGrafo(); break;
                case "i": apresentarConexidade(); break;
                case "j": sair = true; System.out.println("Encerrando a aplicação. Até logo!"); break;
                default: System.out.println("Opção inválida. Tente novamente.\n");
            }
        }
        scanner.close();
    }

    private static void exibirMenu() {
        System.out.println("\n" + TITULO);
        System.out.println("Vértices carregados: " + grafo.numVertices()
                + " | Arestas carregadas: " + grafo.numArestas()
                + " | Tipo: " + grafo.getTipo() + " (" + Grafo.descreverTipo(grafo.getTipo()) + ")");
        System.out.println("-----------------------------------------------------------------");
        System.out.println("a) Ler dados do arquivo grafo.txt");
        System.out.println("b) Gravar dados no arquivo grafo.txt");
        System.out.println("c) Inserir vértice");
        System.out.println("d) Inserir aresta");
        System.out.println("e) Remover vértice");
        System.out.println("f) Remover aresta");
        System.out.println("g) Mostrar conteúdo do arquivo");
        System.out.println("h) Mostrar grafo");
        System.out.println("i) Apresentar a conexidade do grafo e o reduzido");
        System.out.println("j) Encerrar a aplicação");
        System.out.print("Escolha uma opção: ");
    }

    // a) ----------------------------------------------------------------
    private static void lerArquivo() {
        System.out.print("Caminho do arquivo (ENTER para usar '" + ARQUIVO_PADRAO + "'): ");
        String caminho = scanner.nextLine().trim();
        if (caminho.isEmpty()) caminho = ARQUIVO_PADRAO;
        try {
            grafo.lerArquivo(caminho);
            System.out.println("Arquivo lido com sucesso! " + grafo.numVertices()
                    + " vértices e " + grafo.numArestas() + " arestas carregados.");
        } catch (IOException | NumberFormatException e) {
            System.out.println("Erro ao ler o arquivo: " + e.getMessage());
        }
    }

    // b) ----------------------------------------------------------------
    private static void gravarArquivo() {
        System.out.print("Caminho do arquivo (ENTER para usar '" + ARQUIVO_PADRAO + "'): ");
        String caminho = scanner.nextLine().trim();
        if (caminho.isEmpty()) caminho = ARQUIVO_PADRAO;
        try {
            grafo.gravarArquivo(caminho);
            System.out.println("Arquivo '" + caminho + "' gravado com sucesso!");
        } catch (IOException e) {
            System.out.println("Erro ao gravar o arquivo: " + e.getMessage());
        }
    }

    // c) ----------------------------------------------------------------
    private static void inserirVertice() {
        System.out.print("Endereço/nome do local (ex.: 'Museu do Ipiranga'): ");
        String endereco = scanner.nextLine().trim();
        System.out.print("Categoria (ENTER para deixar sem categoria, ex.: 'Cultura'): ");
        String categoria = scanner.nextLine().trim();

        String rotulo = categoria.isEmpty() ? endereco : endereco + " [" + categoria + "]";

        double peso = 0.0;
        if (grafo.temPesoVertice()) {
            System.out.print("Peso do vértice: ");
            peso = lerDouble();
        }
        int id = grafo.inserirVertice(endereco, rotulo, peso);
        System.out.println("Vértice inserido com id " + id + " (rótulo: \"" + rotulo + "\").");
    }

    // d) ----------------------------------------------------------------
    private static void inserirAresta() {
        if (grafo.numVertices() == 0) {
            System.out.println("Não há vértices no grafo ainda.");
            return;
        }
        System.out.print("Id do vértice de origem: ");
        int origem = lerInt();
        System.out.print("Id do vértice de destino: ");
        int destino = lerInt();
        double peso = 0.0;
        if (grafo.temPesoAresta()) {
            System.out.print("Peso da aresta: ");
            peso = lerDouble();
        }
        boolean ok = grafo.inserirAresta(origem, destino, peso);
        System.out.println(ok ? "Aresta inserida com sucesso!" : "Não foi possível inserir a aresta (ids inválidos).");
    }

    // e) ----------------------------------------------------------------
    private static void removerVertice() {
        System.out.print("Id do vértice a remover: ");
        int id = lerInt();
        boolean ok = grafo.removerVertice(id);
        System.out.println(ok ? "Vértice removido (e arestas associadas)!" : "Id de vértice inválido.");
    }

    // f) ----------------------------------------------------------------
    private static void removerAresta() {
        System.out.print("Id do vértice de origem: ");
        int origem = lerInt();
        System.out.print("Id do vértice de destino: ");
        int destino = lerInt();
        boolean ok = grafo.removerAresta(origem, destino);
        System.out.println(ok ? "Aresta removida com sucesso!" : "Aresta não encontrada ou ids inválidos.");
    }

    // g) ----------------------------------------------------------------
    private static void mostrarConteudoArquivo() {
        System.out.println(grafo.mostrarConteudoArquivo());
    }

    // h) ----------------------------------------------------------------
    private static void mostrarGrafo() {
        if (grafo.numVertices() > 25) {
            System.out.print("Grafo tem " + grafo.numVertices()
                    + " vértices. Mostrar como (1) lista de adjacência ou (2) matriz? ");
            String opc = scanner.nextLine().trim();
            if (opc.equals("2")) {
                System.out.println(grafo.mostrarMatriz());
                return;
            }
        }
        System.out.println(grafo.mostrarGrafo());
    }

    // i) ----------------------------------------------------------------
    private static void apresentarConexidade() {
        Grafo.ResultadoConexidade r = grafo.apresentarConexidade();
        System.out.println("Classificação: " + r.classificacao);
        System.out.println("Quantidade de componentes: " + r.componentes.size());
        for (int i = 0; i < r.componentes.size(); i++) {
            System.out.println("  Componente " + i + ": " + r.componentes.get(i));
        }
        if (r.grafoReduzidoTexto != null) {
            System.out.println("\n--- Grafo Reduzido ---");
            System.out.println(r.grafoReduzidoTexto);
        }
    }

    // ---------------------------------------------------------------------
    private static int lerInt() {
        while (true) {
            try {
                return Integer.parseInt(scanner.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.print("Valor inválido, digite um número inteiro: ");
            }
        }
    }

    private static double lerDouble() {
        while (true) {
            try {
                return Double.parseDouble(scanner.nextLine().trim().replace(",", "."));
            } catch (NumberFormatException e) {
                System.out.print("Valor inválido, digite um número (use ponto para decimais): ");
            }
        }
    }
}
