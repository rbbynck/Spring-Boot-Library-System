package com.example.Library_Spring.repository;

import com.example.Library_Spring.model.BookCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookCheckInRepository extends JpaRepository<BookCheckIn, Long> {
    @Query("SELECT b FROM BookCheckIn b WHERE b.user_id = ?1 AND b.claimed_date IS NULL")
    Optional<List<BookCheckIn>> checkNoOfUnclaimed(Long user_id);
}
