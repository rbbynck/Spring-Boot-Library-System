package com.example.Library_Spring.controller;

import com.example.Library_Spring.dto.UserProfileDTO;
import com.example.Library_Spring.model.User;
import com.example.Library_Spring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/spring-library/profile")
public class UserController {
    @Autowired
    UserRepository userRepository;

    @PostMapping("/update")
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody UserProfileDTO userProfileDTO, Authentication authentication) {
        // Update user profile

        Map<String, String> response = new HashMap<>();
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Data Found"));;

        try {
            // Update user details in the database
            user.setName(userProfileDTO.getName());
            user.setUsername(userProfileDTO.getUsername());
            user.setEmail(userProfileDTO.getEmail());
            user.setDob(userProfileDTO.getDob());
            user.setAddress(userProfileDTO.getAddress());

            userRepository.save(user);
            response.put("message", "Profile updated successfully!");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to Update Profile");
        }

        return ResponseEntity.ok(response);
    }

}
