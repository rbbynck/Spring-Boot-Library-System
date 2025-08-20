package com.example.Library_Spring.repository;

import com.example.Library_Spring.model.RequestedBooks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RequestedBooksRepository extends JpaRepository<RequestedBooks, Long> {

    @Query("SELECT b FROM RequestedBooks b WHERE b.title = ?1 AND b.author = ?2")
    Optional<RequestedBooks> findByTitleAndAuthor(String title, String author);
}
