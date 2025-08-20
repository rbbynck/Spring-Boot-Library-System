package com.example.Library_Spring.model;

import jakarta.persistence.*;

@Entity
@Table(name = "book_check_in")
public class BookCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long book_id;
    private Long user_id;
    private String check_in_date;
    private String claimed_date;
    private String expiry_date;

    public BookCheckIn() {
    }

    public BookCheckIn(Long id, Long book_id, Long user_id, String check_in_date, String claimed_date, String expiry_date) {
        this.id = id;
        this.book_id = book_id;
        this.user_id = user_id;
        this.check_in_date = check_in_date;
        this.claimed_date = claimed_date;
        this.expiry_date = expiry_date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBook_id() {
        return book_id;
    }

    public void setBook_id(Long book_id) {
        this.book_id = book_id;
    }

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public String getCheck_in_date() {
        return check_in_date;
    }

    public void setCheck_in_date(String check_in_date) {
        this.check_in_date = check_in_date;
    }

    public String getClaimed_date() {
        return claimed_date;
    }

    public void setClaimed_date(String claimed_date) {
        this.claimed_date = claimed_date;
    }

    public String getExpiry_date() {
        return expiry_date;
    }

    public void setExpiry_date(String expiry_date) {
        this.expiry_date = expiry_date;
    }
}
