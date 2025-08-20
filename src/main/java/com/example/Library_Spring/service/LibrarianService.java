package com.example.Library_Spring.service;

import com.example.Library_Spring.dto.PenaltyPayDTO;
import com.example.Library_Spring.model.*;
import com.example.Library_Spring.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LibrarianService {
    @Autowired
    private AnnouncementRepository announcementRepository;
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private LoansRepository loansRepository;
    @Autowired
    private LoanPenaltyRepository loanPenaltyRepository;
    @Autowired
    private BookCheckInRepository bookCheckInRepository;

    // ANNOUNCEMENT SERVICE
    public List<Announcement> getAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAll();
        announcements = announcements.stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        lst -> {
                            Collections.reverse(lst);
                            return lst;
                        }));
        return announcements;
    }

    @Transactional
    public void editAnnouncement(Announcement announcement, Long id) {
        Announcement announcementToEdit = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Penalty Found"));
        announcementToEdit.setTitle(announcement.getTitle());
        announcementToEdit.setContent(announcement.getContent());
        announcementRepository.save(announcementToEdit);
    }

    // BOOK SERVICE
    public void addBook(Book book) {
        if (bookRepository.findByTitleAndAuthor(book.getTitle(), book.getAuthor()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book already exists, if you're going to add another copy, please edit the existing book.");
        }
        book.setAvailable_copies(book.getTotal_copies());
        bookRepository.save(book);
    }

    @Transactional
    public void editBook(Book book, Long id) {
        Book bookToEdit = bookRepository.findById(id).orElse(null);
        if (bookToEdit != null) {
            // Make sure the title and author changes first
            if (!bookToEdit.getTitle().equals(book.getTitle()) || !bookToEdit.getAuthor().equals(book.getAuthor())) {
                // Check if the new title and author exists
                if (bookRepository.findByTitleAndAuthor(book.getTitle(), book.getAuthor()).isPresent()) {
                    System.out.println("Book exists");
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book already exists");
                }
            }
            // Save edit
            bookToEdit.setAuthor(book.getAuthor());
            bookToEdit.setTitle(book.getTitle());
            bookToEdit.setCategory(book.getCategory());
            bookToEdit.setPublication_year(book.getPublication_year());
            bookToEdit.setTotal_copies(book.getTotal_copies());
            bookToEdit.setAvailable_copies(book.getAvailable_copies());
            bookRepository.save(bookToEdit);
        }
    }

    // CHECK-IN SERVICE
    public BookCheckIn getCheckInData(Long id) {
        // Check if book check in ID exists
        BookCheckIn bookCheckIn = bookCheckInRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-In data doesn't exists"));

        // Check if user has a penalty
        Double amount_to_pay = getPenaltyFine(bookCheckIn.getUser_id());
        if (amount_to_pay != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please pay the penalty fine of " + amount_to_pay + " to be able to check-in any books");
        }

        // Check if check-in ID hasn't been claimed
        if (bookCheckIn.getClaimed_date() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The book has been claimed");
        }

        // Check if check-in ID has passed its expiry date
        LocalDateTime expiry_date = LocalDateTime.parse(bookCheckIn.getExpiry_date());
        if (LocalDateTime.now().isAfter(expiry_date)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The check in request has expire, please make another request");
        }

        return bookCheckIn;
    }

    @Transactional
    public void saveCheckInData(Long id) {
        BookCheckIn bookCheckIn = bookCheckInRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-In data doesn't exists"));
        bookCheckIn.setClaimed_date(String.valueOf(LocalDateTime.now()));

        Loans loans = new Loans();
        loans.setBook_id(bookCheckIn.getBook_id());
        loans.setUser_id(bookCheckIn.getUser_id());
        loans.setBorrow_date(String.valueOf(LocalDateTime.now()));
        loans.setDue_date(String.valueOf(LocalDateTime.now().plusDays(7)));
        loansRepository.save(loans);
    }


    // CHECK-OUT SERVICE
    public Loans getCheckOutData(Long id) {
        Loans loans = loansRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-Out data doesn't exists"));

        // Check if loan id has been returned
        if (loans.getReturn_date() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The book has been returned");
        }

        // Check if loan is passed its due date, if yes Add Penalty Fine
        verifyPastDueDate(loans);

        // Check if user has a penalty
        Double amount_to_pay = getPenaltyFine(loans.getUser_id());
        if (amount_to_pay != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please pay the penalty fine of " + amount_to_pay + " to be able to check-in any books");
        }

        return loans;
    }

    @Transactional
    public String saveCheckOut(Long id) {
        // Update loans table
        Loans loans = loansRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-Out data doesn't exists"));
        loans.setReturn_date(String.valueOf(LocalDateTime.now()));
        loansRepository.save(loans);

        // Update book table (update the available copies)
        Book book = bookRepository.findById(loans.getBook_id()).get();
        book.setAvailable_copies(book.getAvailable_copies() + 1);
        bookRepository.save(book);

        // Check if user has a Penalty Fine to Pay
        String message = "Book ID: " + book.getId() + " Successfully Checked-Out";
        Double penalty_fine = getPenaltyFine(loans.getUser_id());
        if (penalty_fine != null) {
            message = "Please pay the penalty fine amount of " + penalty_fine + " to be able to borrow books again";
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User have no penalty");
        }
        return message;
    }

    // PENALTY SERVICE
    @Transactional
    public void addPenaltyFine(Long user_id, Long book_id) {
        // Add Penalty Fine for overdue Loans
        LoanPenalty loanPenalty = new LoanPenalty();
        loanPenalty.setFine(60);
        loanPenalty.setUser_id(user_id);
        loanPenalty.setBook_id(book_id);
        loanPenalty.setCreated_at(String.valueOf(LocalDateTime.now()));
        loanPenaltyRepository.save(loanPenalty);
    }

    public void verifyPastDueDate(Loans loans) {
        LocalDateTime due_date = LocalDateTime.parse(loans.getDue_date());
        if (LocalDateTime.now().isAfter(due_date)) {
            // If penalty fine hasn't been created for this current loan
            List<LoanPenalty> loanPenalties = loanPenaltyRepository.findByUserID(loans.getUser_id()).orElse(null);
            if (loanPenalties != null) {
                List<Long> book_ids = loanPenalties.stream().map(LoanPenalty::getBook_id).toList();
                if (book_ids.contains(loans.getBook_id())) {
                    boolean check_penalty_created = false;
                    for (LoanPenalty loanPenalty : loanPenalties) {
                        LocalDateTime created = LocalDateTime.parse(loanPenalty.getCreated_at());
                        if (due_date.isAfter(created)) {
                            check_penalty_created = true;
                        }
                    }
                    if (!check_penalty_created) {
                        addPenaltyFine(loans.getUser_id(), loans.getBook_id());
                    }
                } else {
                    addPenaltyFine(loans.getUser_id(), loans.getBook_id());
                }
            }
        }
    }

    public Double getPenaltyFine(Long user_id) {
        // User ID
        List<LoanPenalty> loanPenalties = loanPenaltyRepository.findByUserID(user_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Penalty Found"));

        // Check if user has penalties
        if (loanPenalties.size() == 0) {
            return null;
        }

        return loanPenalties.stream().mapToDouble(LoanPenalty::getFine).sum();
    }

    @Transactional
    public void payPenaltyFine(PenaltyPayDTO penaltyPayDTO) {
        List<LoanPenalty> loanPenalties = loanPenaltyRepository.findByUserID(penaltyPayDTO.getUser_id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Penalty Found"));

        // Check if user has penalties
        if (loanPenalties.size() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No data exists");
        }

        // Check if amount to pay is equal to the fine
        double total_fine = loanPenalties.stream().mapToDouble(LoanPenalty::getFine).sum();
        if (total_fine != penaltyPayDTO.getAmount_to_pay()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please pay the exact amount");
        }

        // Pay and save the transaction
        for (LoanPenalty loanPenalty : loanPenalties) {
            loanPenalty.setPaid_date(String.valueOf(LocalDateTime.now()));
            loanPenalty.setPaid_amount(loanPenalty.getFine());
            loanPenaltyRepository.save(loanPenalty);
        }
    }
}
