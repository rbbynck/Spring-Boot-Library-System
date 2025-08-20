package com.example.Library_Spring.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false, unique = true)
    private String email;
    private String name;
    private String dob;
    private String address;
    @Column(name = "created_at", updatable = false)
    private String created_at;
    private String role;

    public User() {
    }

    public User(Long id, String username, String password, String email, String name, String dob, String address, String created_at, String role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.name = name;
        this.dob = dob;
        this.address = address;
        this.created_at = created_at;
        this.role = role;
    }

    public User(String username, String password, String email, String name, String dob, String address, String created_at, String role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.name = name;
        this.dob = dob;
        this.address = address;
        this.created_at = created_at;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCreated_at() {
        return created_at;
    }

    public String getRole() {
        return role;
    }

    @PrePersist
    protected void onCreate() {
        created_at = String.valueOf(LocalDateTime.now());
        role = "borrower";
    }
}

