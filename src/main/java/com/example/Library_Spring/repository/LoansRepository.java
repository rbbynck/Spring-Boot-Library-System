package com.example.Library_Spring.repository;

import com.example.Library_Spring.model.Loans;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoansRepository extends JpaRepository<Loans, Long> {
    @Query("SELECT l FROM Loans l WHERE l.user_id = ?1")
    Optional<List<Loans>> findByUser_ID(Long id);

    @Query("SELECT l FROM Loans l WHERE l.user_id = ?1 AND return_date = null")
    Optional<List<Loans>> checkNoOfOnHold(Long id);
}
