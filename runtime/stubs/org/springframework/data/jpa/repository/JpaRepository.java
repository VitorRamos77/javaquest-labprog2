package org.springframework.data.jpa.repository;
import java.util.List;
public interface JpaRepository<T, ID> extends org.springframework.data.repository.CrudRepository<T, ID> {
    List<T> findAll();
}
