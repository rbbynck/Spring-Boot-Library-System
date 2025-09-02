package com.example.Library_Spring.controller;

import com.example.Library_Spring.model.User;
import com.example.Library_Spring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
@RequestMapping("/spring-library")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/register")
    public String showRegistrationForm(Model model, Authentication authentication) {
        // If user is logged in, redirect them to home when they're accessing the login/register form
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/spring-library/home";
        }
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(User user, Model model, @RequestParam("confirm-password") String confirmPassword) {
        // Check username if its already taken
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            model.addAttribute("error", "Username already exists");
            return "register";
        }
        // Check email if its already taken
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            model.addAttribute("error", "Email already taken");
            return "register";
        }

        // Check if password matches confirm password
        if (!user.getPassword().equals(confirmPassword)) {
            model.addAttribute("error", "Password didn't match");
            return "register";
        }

        // Check if birthdate format is correct
        if (LocalDate.parse(user.getDob()).getYear() > (LocalDate.now().getYear() - 5)) {
            model.addAttribute("error", "Invalid Birth Date");
            return "register";
        }

        // Save User
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String showLogin(Authentication authentication) {
        // If user is logged in, redirect them to home when they're accessing the login/register form
        if (authentication != null && authentication.isAuthenticated()) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (isAdmin) {
                return "redirect:/spring-library/librarian";
            } else {
                return "redirect:/spring-library/home";
            }
        }
        return "login";
    }

    @GetMapping("/home")
    public String home(Authentication authentication, Model model) {
        // Display home page

        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        assert user != null;
        model.addAttribute("user", user);
        return "home";
    }

    @GetMapping("/librarian")
    public String librarian(Authentication authentication, Model model) {
        // Display librarian page (FOR Librarian ONLY)

        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        assert user != null;
        model.addAttribute("user", user);
        return "librarian";
    }

    @GetMapping("/home/profile")
    public String viewProfile(Authentication authentication, Model model) {
        // Display Profile data of user

        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        assert user != null;
        model.addAttribute("user", user);
        return "home";
    }

}
