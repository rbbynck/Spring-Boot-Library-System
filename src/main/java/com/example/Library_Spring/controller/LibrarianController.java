package com.example.Library_Spring.controller;

import com.example.Library_Spring.dto.PenaltyPayDTO;
import com.example.Library_Spring.model.Announcement;
import com.example.Library_Spring.model.Book;
import com.example.Library_Spring.model.BookCheckIn;
import com.example.Library_Spring.model.Loans;
import com.example.Library_Spring.repository.AnnouncementRepository;
import com.example.Library_Spring.repository.BookRepository;
import com.example.Library_Spring.repository.LoansRepository;
import com.example.Library_Spring.service.LibrarianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/spring-library/librarian")
public class LibrarianController {
    @Autowired
    private AnnouncementRepository announcementRepository;
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private LoansRepository loansRepository;
    @Autowired
    private LibrarianService librarianService;

    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        // Display Announcements (Should be sorted from latest)
        return ResponseEntity.ok(librarianService.getAnnouncements());
    }

    @PostMapping("/announcements")
    public ResponseEntity<Map<String, String>> addAnnouncement(@RequestBody Announcement announcement) {
        // Add new announcement
        announcement.setDate(String.valueOf(LocalDate.now()));
        announcementRepository.save(announcement);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Announcement Successfully Added!");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Map<String, String>> deleteAnnouncement(@PathVariable Long id) {
        // Delete announcement
        announcementRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Announcement Successfully Deleted!");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<Map<String, String>> updateAnnouncement(@RequestBody Announcement announcement, @PathVariable Long id) {
        // Edit announcement
        librarianService.editAnnouncement(announcement, id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Announcement Successfully Updated!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/book/add")
    public ResponseEntity<Map<String, String>> addBook(@RequestBody Book book) {
        // Add new book
        librarianService.addBook(book);
        return ResponseEntity.ok(Map.of("message", "Book Successfully Added!"));
    }

    @PutMapping("/book/edit/{id}")
    public ResponseEntity<Map<String, String>> editBook(@RequestBody Book book, @PathVariable Long id) {
        // Edit existing book
        librarianService.editBook(book, id);
        return ResponseEntity.ok(Map.of("message", "Book successfully edited!"));
    }

    @DeleteMapping("/book/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long id) {
        // Delete book
        bookRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Book successfully deleted"));
    }

    @GetMapping("/book/borrowed-books")
    public ResponseEntity<List<Loans>> getBorrowedBooks() {
        // View all borrowed books data
        try {
            return ResponseEntity.ok(loansRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/check-in/{id}")
    public ResponseEntity<BookCheckIn> getCheckInData(@PathVariable Long id) {
        // Get Check-In Data
        return ResponseEntity.ok(librarianService.getCheckInData(id));
    }

    @PostMapping("/check-in/{id}")
    public ResponseEntity<Map<String, String>> saveCheckIn(@PathVariable Long id) {
        // Save Check-In
        librarianService.saveCheckInData(id);
        return ResponseEntity.ok(Map.of("message", "Book successfully Checked-In!"));
    }

    @GetMapping("/check-out/{id}")
    public ResponseEntity<Loans> getCheckOutData(@PathVariable Long id) {
        // Get Check-Out Data
        return ResponseEntity.ok(librarianService.getCheckOutData(id));
    }

    @PostMapping("/check-out/{id}")
    public ResponseEntity<Map<String, String>> saveCheckOut(@PathVariable Long id) {
        // Save Check-Out
        return ResponseEntity.ok(Map.of("message", librarianService.saveCheckOut(id)));
    }

    @GetMapping("/penalty/{id}")
    public ResponseEntity<Double> getPenaltyFine(@PathVariable Long id) {
        // Get Penalty fine amount
        return ResponseEntity.ok(librarianService.getPenaltyFine(id));
    }

    @PostMapping("/penalty/{id}")
    public ResponseEntity<Map<String, String>> payPenaltyFine(@RequestBody PenaltyPayDTO penaltyPayDTO) {
        // Pay penalty fine
        librarianService.payPenaltyFine(penaltyPayDTO);
        return ResponseEntity.ok(Map.of("message", "Fine successfully paid."));
    }
}
