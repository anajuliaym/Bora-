package br.com.bora.locais.repository;

import br.com.bora.locais.model.Local;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocalRepository extends JpaRepository<Local, Long> {
    List<Local> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);
    List<Local> findByCategoriaIgnoreCaseOrderByNomeAsc(String categoria);
    List<Local> findByNomeContainingIgnoreCaseAndCategoriaIgnoreCaseOrderByNomeAsc(String nome, String categoria);
    List<Local> findAllByOrderByNomeAsc();
}
