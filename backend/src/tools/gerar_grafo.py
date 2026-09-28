import xml.etree.ElementTree as ET
import math
import zipfile
import os

# 1. Função para calcular a distância em KM usando coordenadas (Fórmula de Haversine)
def calcular_distancia(lat1, lon1, lat2, lon2):
    R = 6371.0  # Raio da Terra em km

    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R * c, 2)

# 2. Função para carregar o XML seja de ficheiro .kml ou .kmz
def carregar_raiz_xml(caminho_ficheiro):
    if not os.path.exists(caminho_ficheiro):
        return None

    # Se for KMZ (arquivo ZIP), extrai o KML interno em memória
    if caminho_ficheiro.lower().endswith('.kmz'):
        with zipfile.ZipFile(caminho_ficheiro, 'r') as z:
            ficheiros_kml = [f for f in z.namelist() if f.lower().endswith('.kml')]
            if not ficheiros_kml:
                raise FileNotFoundError("Nenhum ficheiro .kml encontrado dentro do ficheiro KMZ.")
            conteudo_kml = z.read(ficheiros_kml[0])
            return ET.fromstring(conteudo_kml)
    else:
        tree = ET.parse(caminho_ficheiro)
        return tree.getroot()

def gerar_grafo():
    # Procure automaticamente por ficheiros KML ou KMZ na pasta atual
    ficheiro_entrada = None
    for f in os.listdir('.'):
        if f.lower().endswith('.kml') or f.lower().endswith('.kmz'):
            ficheiro_entrada = f
            break

    if not ficheiro_entrada:
        print("❌ Erro: Nenhum ficheiro .kml ou .kmz foi encontrado na pasta atual.")
        return

    print(f"📂 A processar o ficheiro: {ficheiro_entrada}")
    root = carregar_raiz_xml(ficheiro_entrada)

    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    regioes_set = set()
    locais_raw = []

    # Extrair Camadas (Regiões) e Marcadores (Locais)
    folders = root.findall('.//kml:Folder', ns)
    if not folders:
        # Tenta sem namespace se a estrutura KML variar
        folders = root.findall('.//Folder')

    for folder in folders:
        nome_regiao_node = folder.find('kml:name', ns)
        if nome_regiao_node is None:
            nome_regiao_node = folder.find('name')
        
        if nome_regiao_node is None or not nome_regiao_node.text:
            continue

        nome_regiao = nome_regiao_node.text.strip()
        regioes_set.add(nome_regiao)

        placemarks = folder.findall('kml:Placemark', ns)
        if not placemarks:
            placemarks = folder.findall('.//Placemark')

        for placemark in placemarks:
            nome_node = placemark.find('kml:name', ns)
            if nome_node is None:
                nome_node = placemark.find('name')
            if nome_node is None or not nome_node.text:
                continue
            nome_local = nome_node.text.strip()

            # Extrair Categoria da descrição
            desc_node = placemark.find('kml:description', ns)
            if desc_node is None:
                desc_node = placemark.find('description')
            descricao = desc_node.text.strip() if desc_node is not None and desc_node.text else ""

            categoria = "Geral"
            if "Categoria:" in descricao:
                categoria = descricao.split("Categoria:")[1].strip().split('\n')[0]

            # Extrair Coordenadas (longitude, latitude, altitude)
            coords_node = placemark.find('.//kml:Point/kml:coordinates', ns)
            if coords_node is None:
                coords_node = placemark.find('.//Point/coordinates')

            if coords_node is not None and coords_node.text:
                coords_text = coords_node.text.strip()
                lon, lat, *_ = map(float, coords_text.split(','))

                locais_raw.append({
                    "nome": nome_local,
                    "regiao": nome_regiao,
                    "categoria": categoria,
                    "lat": lat,
                    "lon": lon
                })

    # Construção dos Vértices
    todos_vertices = []
    id_counter = 0
    mapa_id_regiao = {}

    # A) Vértices Âncora das Regiões
    for reg_nome in sorted(list(regioes_set)):
        todos_vertices.append({"id": id_counter, "rotulo": reg_nome})
        mapa_id_regiao[reg_nome] = id_counter
        id_counter += 1

    # B) Vértices dos Locais Físicos
    for loc in locais_raw:
        rotulo_completo = f"{loc['nome']} [{loc['categoria']}]"
        todos_vertices.append({"id": id_counter, "rotulo": rotulo_completo})
        loc["id"] = id_counter
        id_counter += 1

    # Construção das Arestas
    arestas = []

    # 1. Região -> Local (Peso 0.0)
    for loc in locais_raw:
        id_regiao = mapa_id_regiao[loc["regiao"]]
        id_local = loc["id"]
        arestas.append((id_regiao, id_local, 0.0))

    # 2. Local <-> Local (K=3 Vizinhos Mais Próximos)
    NUM_VIZINHOS = 3
    arestas_unicas = set()

    for i in range(len(locais_raw)):
        distancias = []
        for j in range(len(locais_raw)):
            if i != j:
                lat1, lon1 = locais_raw[i]["lat"], locais_raw[i]["lon"]
                lat2, lon2 = locais_raw[j]["lat"], locais_raw[j]["lon"]
                dist = calcular_distancia(lat1, lon1, lat2, lon2)
                distancias.append((dist, locais_raw[i]["id"], locais_raw[j]["id"]))

        distancias.sort(key=lambda x: x[0])

        for dist, id1, id2 in distancias[:NUM_VIZINHOS]:
            aresta = tuple(sorted((id1, id2))) + (dist,)
            arestas_unicas.add(aresta)

    for u, v, peso in arestas_unicas:
        arestas.append((u, v, peso))

    # Escrever ficheiro grafo.txt
    with open("grafo.txt", "w", encoding="utf-8") as f:
        f.write("2\n")  # Grafo não direcionado com peso
        f.write(f"{len(todos_vertices)}\n")

        for v in todos_vertices:
            f.write(f'{v["id"]} "{v["rotulo"]}" 0\n')

        f.write(f"{len(arestas)}\n")

        for u, v, peso in arestas:
            f.write(f"{u} {v} {peso}\n")

    print("\n✅ Ficheiro 'grafo.txt' gerado com sucesso!")
    print(f"📍 Total de Vértices: {len(todos_vertices)} ({len(regioes_set)} Regiões + {len(locais_raw)} Locais)")
    print(f"🔗 Total de Arestas geradas: {len(arestas)}")
    print(f"📏 Algoritmo de conexão: K={NUM_VIZINHOS} vizinhos mais próximos\n")

if __name__ == "__main__":
    gerar_grafo()
