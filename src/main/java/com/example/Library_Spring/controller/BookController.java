package com.example.Library_Spring.controller;

import com.example.Library_Spring.dto.BookRequestDTO;
import com.example.Library_Spring.model.Book;
import com.example.Library_Spring.model.Loans;
import com.example.Library_Spring.model.User;
import com.example.Library_Spring.repository.BookRepository;
import com.example.Library_Spring.repository.LoansRepository;
import com.example.Library_Spring.repository.UserRepository;
import com.example.Library_Spring.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/spring-library/book")
public class BookController {
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private LoansRepository loansRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getBooks() {
        // Display all books
        List<Book> books = bookRepository.findAll();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/borrowed-book")
    public ResponseEntity<List<Loans>> getLoans(Authentication authentication) {
        // Display borrowed books

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Data Found"));
        try {
            List<Loans> loans = loansRepository.findByUser_ID(user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Data Found"));
            System.out.println(loans);
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/request-book")
    public ResponseEntity<Map<String, String>> requestBook(@RequestBody BookRequestDTO bookRequestDTO) {
        // POST REQUEST FOR REQUEST BOOK

        bookService.requestABook(bookRequestDTO);
        return ResponseEntity.ok(Map.of("message", "Book request submitted successfully!"));
    }

    @PostMapping("/loan-book/{id}")
    public ResponseEntity<Map<String, String>> requestToBorrowBook(@PathVariable Long id, Authentication authentication) {
        // Request To Borrow Book
        bookService.requestToBorrowBook(id, authentication);
        return ResponseEntity.ok(Map.of("message", "Book successfully requested! Go to the Librarian for checking in."));
    }
}
