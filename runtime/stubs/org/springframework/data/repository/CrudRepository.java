package org.springframework.data.repository;
import java.util.Optional;
/** Versão simulada: o JavaQuest cria uma implementação em memória automaticamente. */
public interface CrudRepository<T, ID> {
    <S extends T> S save(S entity);
    <S extends T> Iterable<S> saveAll(Iterable<S> entities);
    Optional<T> findById(ID id);
    boolean existsById(ID id);
    Iterable<T> findAll();
    long count();
    void deleteById(ID id);
    void delete(T entity);
    void deleteAll();
}
