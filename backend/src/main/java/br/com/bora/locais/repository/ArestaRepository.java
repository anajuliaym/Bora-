package br.com.bora.locais.repository;

import br.com.bora.locais.model.Aresta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArestaRepository extends JpaRepository<Aresta, Long> {
    List<Aresta> findByDeOrPara(Long de, Long para);
}
