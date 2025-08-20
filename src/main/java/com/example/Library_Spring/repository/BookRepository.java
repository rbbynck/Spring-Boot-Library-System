package com.example.Library_Spring.repository;

import com.example.Library_Spring.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    @Query("SELECT b FROM Book b WHERE b.title = ?1 AND b.author = ?2")
    Optional<Book> findByTitleAndAuthor(String title, String author);

    @Query("SELECT b FROM Book b WHERE b.id =?1 AND b.available_copies > 0")
    Optional<Book> checkAvailability(Long id);
}
