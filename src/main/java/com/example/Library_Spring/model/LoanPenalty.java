package com.example.Library_Spring.model;

import jakarta.persistence.*;

@Entity
@Table(name = "loan_penalty")
public class LoanPenalty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long user_id;
    private Long book_id;
    private Double fine;
    private Double paid_amount;
    private String paid_date;
    private String created_at;

    public LoanPenalty() {

    }

    public LoanPenalty(Long id, Long user_id, Long book_id, Double fine, Double paid_amount, String paid_date, String created_at) {
        this.id = id;
        this.user_id = user_id;
        this.book_id = book_id;
        this.fine = fine;
        this.paid_amount = paid_amount;
        this.paid_date = paid_date;
        this.created_at = created_at;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public Long getBook_id() {
        return book_id;
    }

    public void setBook_id(Long book_id) {
        this.book_id = book_id;
    }

    public Double getFine() {
        return fine;
    }

    public void setFine(double fine) {
        this.fine = fine;
    }

    public Double getPaid_amount() {
        return paid_amount;
    }

    public void setPaid_amount(double paid_amount) {
        this.paid_amount = paid_amount;
    }

    public String getPaid_date() {
        return paid_date;
    }

    public void setPaid_date(String paid_date) {
        this.paid_date = paid_date;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }
}
