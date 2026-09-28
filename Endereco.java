/**
Gabriel Mires Camargo 10436741
Ana Julia Yaguti Matilha 10436655
Jiye Huang 10438990
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
