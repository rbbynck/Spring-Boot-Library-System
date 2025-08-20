package com.example.Library_Spring.repository;

import com.example.Library_Spring.model.LoanPenalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanPenaltyRepository extends JpaRepository<LoanPenalty, Long> {

    @Query("SELECT l FROM LoanPenalty l WHERE l.user_id = ?1 AND l.paid_date IS NULL")
    Optional<List<LoanPenalty>> findByUserID(Long id);
}
