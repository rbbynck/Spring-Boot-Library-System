package com.example.Library_Spring.dto;

public class BookRequestDTO {
    private String title;
    private String author;

    // Getters and setters
    public BookRequestDTO() {}

    public BookRequestDTO(String title, String author) {
        this.title = title;
        this.author = author;
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
