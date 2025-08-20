package com.example.Library_Spring.model;

import jakarta.persistence.*;

@Entity
@Table(name = "requested_books")
public class RequestedBooks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String author;

    public RequestedBooks() {

    }

    public RequestedBooks(String title, String author) {
        this.title = title;
        this.author = author;
    }

    public RequestedBooks(Long id, String title, String author) {
        this.id = id;
        this.title = title;
        this.author = author;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }
}
