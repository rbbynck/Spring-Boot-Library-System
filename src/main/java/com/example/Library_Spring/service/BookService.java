package com.example.Library_Spring.service;

import com.example.Library_Spring.dto.BookRequestDTO;
import com.example.Library_Spring.model.*;
import com.example.Library_Spring.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookService {
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private LoansRepository loansRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RequestedBooksRepository requestedBooksRepository;
    @Autowired
    private BookCheckInRepository bookCheckInRepository;
    @Autowired
    private LibrarianService librarianService;

    @Transactional
    public void requestToBorrowBook(Long id, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No User Found"));
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Book Found"));

        // CHECK IF USER HAVE PENDING PENALTY
        Double amount_to_pay = librarianService.getPenaltyFine(user.getId());
        if (amount_to_pay != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please pay the penalty fine of " + amount_to_pay + " to be able to check-in any books");
        }

        // CHECK IF USER UNCLAIMED BOOKS IS GREATER THAN OR EQUAL 3
        List<BookCheckIn> bookCheckIns = bookCheckInRepository.checkNoOfUnclaimed(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Data Found"));
        if (bookCheckIns.size() >= 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request to borrow must not exceed 3 books");
        }

        // CHECK IF USER HAVE 3 'ON HOLD' BOOKS
        List<Loans> loans = loansRepository.checkNoOfOnHold(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Data Found"));
        if (loans.size() >= 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to Borrow! Only 3 Books Per Borrower, please return the other books so you can borrow another");
        }
        System.out.println("ID : " + id + "\nAUTHENTICATION: " + authentication.getName());

        // UPDATE BOOK TABLE
        book.setAvailable_copies(book.getAvailable_copies() - 1);
        bookRepository.save(book);

        // UPDATE CHECK-IN TABLE
        BookCheckIn check_in = new BookCheckIn();
        check_in.setBook_id(book.getId());
        check_in.setCheck_in_date(String.valueOf(LocalDateTime.now()));
        check_in.setExpiry_date(String.valueOf(LocalDateTime.now().plusDays(2)));
        check_in.setUser_id(user.getId());
        bookCheckInRepository.save(check_in);
        System.out.println("ID : " + id + "\nAUTHENTICATION: " + authentication.getName());
    }

    @Transactional
    public void requestABook(BookRequestDTO bookRequestDTO) {
        List<Book> books = bookRepository.findAll();

        for (Book book : books) {
            book.setAvailable_copies(book.getTotal_copies());
            bookRepository.save(book);
        }
        String title = bookRequestDTO.getTitle();
        String author = bookRequestDTO.getAuthor();
        System.out.println("DATABASE NOT");
        // Check if book exists
        System.out.println(bookRepository.findByTitleAndAuthor(title, author).isPresent());
        if (bookRepository.findByTitleAndAuthor(title, author).isPresent()) {
            System.out.println("DATABASE");
            System.out.println("BOOK EXISTS");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book already exists");
        }

        // Check if book is already in the requested_books
        if (requestedBooksRepository.findByTitleAndAuthor(title, author).isPresent()) {
            System.out.println("BOOK REQUEST");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book's already requested");
        }

        // Save book request
        requestedBooksRepository.save(new RequestedBooks(title, author));
    }
}
