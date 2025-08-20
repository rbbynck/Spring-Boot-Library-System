package com.example.Library_Spring.dto;

public class UserProfileDTO {

    private String name;
    private String username;
    private String email;
    private String dob;
    private String address;

    public UserProfileDTO() {}
    public UserProfileDTO(String name, String username, String email, String dob, String address) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.dob = dob;
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
}
