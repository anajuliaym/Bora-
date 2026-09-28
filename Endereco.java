/**
 * =================================================================================
 * Universidade Presbiteriana Mackenzie - Faculdade de Computação e Informática
 * Disciplina : Teoria dos Grafos - Turma 6o
 * Professor  : Prof. Dr. Ivan Carlos Alcântara de Oliveira
 * Projeto    : Grafo de Locais de Interesse em São Paulo (Projeto - Parte 2)
 *
 * Integrantes do grupo (preencher nome completo e RA de cada integrante):
 *   - <Nome Completo 1> - RA: <00000000>
 *   - <Nome Completo 2> - RA: <00000000>
 *   - <Nome Completo 3> - RA: <00000000>
 *
 * Arquivo    : Endereco.java
 * Descrição  : Classe que representa um vértice do grafo: um "endereço", ou seja,
 *              um local de interesse (ex.: "Museu do Ipiranga") ou uma região/bairro
 *              de São Paulo (vértice-âncora, ex.: "Região Ipiranga"). Não guarda um
 *              id próprio: o identificador do vértice é a POSIÇÃO do objeto dentro
 *              do vetor de Enderecos em Grafo (vertices.get(i) é sempre o vértice
 *              de id "i"), e essa mesma posição indexa a matriz de adjacência.
 *              Cada instância guarda o endereço/apelido do local, o rótulo completo
 *              do vértice (usado na leitura/gravação do grafo.txt) e o peso do
 *              vértice (usado apenas quando o Tipo do Grafo prevê peso no vértice).
 *
 * Histórico de alterações:
 *   27/09/2026 - Claude (assistente) - Criação da classe Endereco.
 *   27/09/2026 - Claude (assistente) - Separação do campo único "rotulo" em dois
 *                campos distintos: "endereco" (nome/apelido do local, conforme
 *                sugerido no enunciado: "...vetor que armazena o rótulo do vértice
 *                e o seu apelido (localidade)") e "rotulo" (string completa gravada
 *                no grafo.txt, no formato "Nome [Categoria]").
 *   27/09/2026 - Claude (assistente) - Remoção do campo "id": o identificador do
 *                vértice passa a ser exclusivamente a posição do objeto no vetor
 *                (ArrayList<Endereco> em Grafo), evitando duplicar essa informação.
 * =================================================================================
 */
public class Endereco {

    private String endereco; // nome/apelido do local (ex.: "Museu do Ipiranga"), sem a categoria
    private String rotulo;   // rótulo completo gravado no grafo.txt (ex.: "Museu do Ipiranga [Cultura]")
    private double peso;     // peso do vértice (relevante apenas se o Tipo do Grafo tiver peso no vértice)

    /**
     * Construtor "completo": usado quando se conhece separadamente o endereço
     * (nome/apelido) e o rótulo completo do vértice.
     */
    public Endereco(String endereco, String rotulo, double peso) {
        this.endereco = endereco;
        this.rotulo = rotulo;
        this.peso = peso;
    }

    /**
     * Construtor de conveniência: usado ao ler o grafo.txt, onde só existe a
     * string do rótulo (ex.: "Museu do Ipiranga [Cultura]"). O endereço
     * (apelido/localidade) é derivado automaticamente removendo o sufixo
     * "[Categoria]", se existir.
     */
    public Endereco(String rotulo, double peso) {
        this(derivarEnderecoDoRotulo(rotulo), rotulo, peso);
    }

    /** Remove o sufixo " [Categoria]" do rótulo, se existir, para obter só o nome do local. */
    private static String derivarEnderecoDoRotulo(String rotulo) {
        int ini = rotulo.lastIndexOf('[');
        if (ini > 0 && rotulo.trim().endsWith("]")) {
            return rotulo.substring(0, ini).trim();
        }
        return rotulo;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getRotulo() {
        return rotulo;
    }

    public void setRotulo(String rotulo) {
        this.rotulo = rotulo;
    }

    public double getPeso() {
        return peso;
    }

    public void setPeso(double peso) {
        this.peso = peso;
    }

    /**
     * Extrai a categoria do rótulo, caso ele siga o padrão "Nome [Categoria]"
     * (convenção usada nos vértices de local gerados a partir do KMZ).
     * Retorna null quando o padrão não é encontrado (ex.: vértices de região,
     * que não têm colchetes).
     */
    public String getCategoria() {
        int ini = rotulo.lastIndexOf('[');
        int fim = rotulo.lastIndexOf(']');
        if (ini >= 0 && fim > ini) {
            return rotulo.substring(ini + 1, fim);
        }
        return null;
    }

    /**
     * Formata o peso sem casas decimais desnecessárias (ex.: 0.0 -> "0"),
     * mantendo o padrão usado no arquivo grafo.txt de exemplo do enunciado.
     */
    public static String formatarPeso(double peso) {
        if (peso == Math.floor(peso) && !Double.isInfinite(peso)) {
            return String.valueOf((long) peso);
        }
        return String.valueOf(peso);
    }

    /**
     * Representação no formato exigido pelo grafo.txt (sem o id, que precisa ser
     * fornecido por quem chama, já que este objeto não guarda sua própria posição):
     * "rotulo" peso
     */
    @Override
    public String toString() {
        return "\"" + rotulo + "\" " + formatarPeso(peso);
    }

    /** Formata a linha completa do grafo.txt, recebendo o id (posição no vetor) de fora. */
    public String toLinhaArquivo(int id) {
        return id + " " + toString();
    }
}
