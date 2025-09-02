package com.example.Library_Spring.config;

import com.example.Library_Spring.model.User;
import com.example.Library_Spring.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
                .cors(cors -> cors.configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/spring-library/register", "/spring-library/login", "/css/**").permitAll()
                        .requestMatchers("/spring-library/home").hasRole("USER")
                        .requestMatchers("/spring-library/librarian").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/spring-library/login")
                        .successHandler(customSuccessHandler()) // Use custom success handler
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/spring-library/logout")
                        .logoutSuccessUrl("/spring-library/login?logout")
                        .invalidateHttpSession(true) // Invalidate session
                        .clearAuthentication(true) // Clear authentication
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                );
        return http.build();
    }


    @Bean
    public AuthenticationSuccessHandler customSuccessHandler() {
        return (request, response, authentication) -> {
            // Check the user's roles
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (isAdmin) {
                response.sendRedirect("/spring-library/librarian"); // Redirect ADMIN to librarian page
            } else {
                response.sendRedirect("/spring-library/home"); // Redirect USER to home page
            }
        };
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return credential -> {
            Optional<User> user;
            if (userRepository.findByUsername(credential).isPresent()) {
                user = userRepository.findByUsername(credential);
            } else if (userRepository.findByEmail(credential).isPresent()) {
                user = userRepository.findByEmail(credential);
            } else {
                throw new UsernameNotFoundException("User not found");
            }

            // This one is like SESSION
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.get().getUsername())
                    .password(user.get().getPassword())
                    .roles(user.get().getRole())
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
