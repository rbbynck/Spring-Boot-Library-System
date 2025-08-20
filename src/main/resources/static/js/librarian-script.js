// Store CSRF token and header name in JavaScript variables
const csrfToken = document.querySelector('meta[name="_csrf"]').content;
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

let booksData = [];
let borrowedBooksData = [];
let announcementsData = [];
const itemsPerPage = 10;
let currentPage = { books: 1, 'borrowed-books': 1 };
let sortState = { column: null, order: null };
let borrowedBooksSortState = { column: null, order: null };
let borrowedBooksFilterStatus = 'all'; // Default to showing all books

//===BOOK SECTION===//
// Sort Books
function sortBooks(column, order) {
    sortState.column = column;
    sortState.order = order;

    booksData.sort((a, b) => {
        let valueA = a[column] || (typeof a[column] === 'number' ? 0 : '');
        let valueB = b[column] || (typeof b[column] === 'number' ? 0 : '');

        // Handle numeric columns (publication_year, available_copies, total_copies)
        if (column === 'publication_year' || column === 'available_copies' || column === 'total_copies') {
            valueA = Number(valueA);
            valueB = Number(valueB);
        } else {
            // Handle string columns (title, author, category)
            valueA = valueA.toString().toLowerCase();
            valueB = valueB.toString().toLowerCase();
        }

        if (order === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    // Reset to first page after sorting
    currentPage.books = 1;
    renderTable('books', booksData, currentPage.books);
}

// Show Add Book Form
function showAddBookForm() {
    const formContainer = document.getElementById('add-book-form-container');
    formContainer.style.display = 'block';
    formContainer.classList.add('active');
    document.getElementById('book-success').textContent = '';
    document.getElementById('book-error').style.display = 'none';
    document.getElementById('book-error').textContent = '';
}

// Cancel Add Book
function cancelAddBook() {
    const formContainer = document.getElementById('add-book-form-container');
    formContainer.style.display = 'none';
    formContainer.classList.remove('active');
    document.getElementById('add-book-form').reset();
    document.getElementById('book-success').textContent = '';
    document.getElementById('book-error').style.display = 'none';
    document.getElementById('book-error').textContent = '';
}

// Add Book
function addBook(event) {
    event.preventDefault();

    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const category = document.getElementById('book-category').value;
    const publication_year = document.getElementById('book-publication-year').value;
    const total_copies = document.getElementById('book-total-copies').value;
    const available_copies = total_copies; // Initially, available copies = total copies
    const successMessage = document.getElementById('book-success');
    const errorMessage = document.getElementById('book-error');
    const formContainer = document.getElementById('add-book-form-container');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Validate inputs
    if (!title || !author || !category || !publication_year || !total_copies || total_copies < 1) {
        errorMessage.textContent = 'Please fill in all fields with valid values.';
        errorMessage.style.display = 'block';
        return;
    }

    fetch('/spring-library/librarian/book/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ title, author, category, publication_year, total_copies, available_copies })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to add book');
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Book added successfully!';
            errorMessage.style.display = 'none';
            document.getElementById('add-book-form').reset();
            formContainer.style.display = 'none';
            formContainer.classList.remove('active'); // Hide form and remove active class
            fetchBooks(); // Refresh the books list
        })
        .catch(error => {
            console.error('Error adding book:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}

// Fetch Books
function fetchBooks() {
    fetch('/spring-library/book', { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            booksData = data;
            renderTable('books', booksData, currentPage.books);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            renderTable('books', booksData, currentPage.books);
        });
}

// Show Edit Book Form
function showEditBookForm(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) {
        console.error('Book not found:', bookId);
        return;
    }

    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-book-title').value = book.title || '';
    document.getElementById('edit-book-author').value = book.author || '';
    document.getElementById('edit-book-category').value = book.category || '';
    document.getElementById('edit-book-publication-year').value = book.publication_year || '';
    document.getElementById('edit-book-total-copies').value = book.total_copies || '';
    document.getElementById('edit-book-available-copies').value = book.available_copies || '';
    const formContainer = document.getElementById('edit-book-form-container');
    formContainer.style.display = 'block';
    formContainer.classList.add('active'); // Add active class
    document.getElementById('edit-book-success').textContent = '';
    document.getElementById('edit-book-error').style.display = 'none';
    document.getElementById('edit-book-error').textContent = '';
}

// Cancel Edit Book
function cancelEditBook() {
    const formContainer = document.getElementById('edit-book-form-container');
    formContainer.style.display = 'none';
    formContainer.classList.remove('active'); // Remove active class
    document.getElementById('edit-book-form').reset();
    document.getElementById('edit-book-success').textContent = '';
    document.getElementById('edit-book-error').style.display = 'none';
    document.getElementById('edit-book-error').textContent = '';
}

// Update Book
function updateBook(event) {
    event.preventDefault();

    const id = document.getElementById('edit-book-id').value;
    const title = document.getElementById('edit-book-title').value;
    const author = document.getElementById('edit-book-author').value;
    const category = document.getElementById('edit-book-category').value;
    const publication_year = document.getElementById('edit-book-publication-year').value;
    const total_copies = document.getElementById('edit-book-total-copies').value;
    const available_copies = document.getElementById('edit-book-available-copies').value;
    const successMessage = document.getElementById('edit-book-success');
    const errorMessage = document.getElementById('edit-book-error');
    const formContainer = document.getElementById('edit-book-form-container');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Validate inputs
    if (!title || !author || !category || !publication_year || !total_copies || !available_copies) {
        errorMessage.textContent = 'Please fill in all fields with valid values.';
        errorMessage.style.display = 'block';
        return;
    }
    if (total_copies < available_copies || available_copies < 0) {
        errorMessage.textContent = 'Available copies cannot exceed total copies.';
        errorMessage.style.display = 'block';
        return;
    }

    fetch(`/spring-library/librarian/book/edit/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ id, title, author, category, publication_year, total_copies, available_copies })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to update book');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            successMessage.textContent = data.message || 'Book updated successfully!';
            errorMessage.style.display = 'none';
            formContainer.style.display = 'none';
            formContainer.classList.remove('active'); // Remove active class
            document.getElementById('edit-book-form').reset();
            fetchBooks(); // Refresh the books list
        })
        .catch(error => {
            console.error('Error updating book:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}

// Delete Book
function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    const successMessage = document.getElementById('book-success');
    const errorMessage = document.getElementById('book-error');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    fetch(`/spring-library/librarian/book/delete/${bookId}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to delete book');
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Book deleted successfully!';
            errorMessage.style.display = 'none';
            // Fetch updated books list
            return fetch('/spring-library/book', { method: 'GET' });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            booksData = data;
            // Calculate total pages after deletion
            const totalPages = Math.ceil(booksData.length / itemsPerPage);
            // Check if current page is empty or beyond total pages
            if (currentPage.books > totalPages && currentPage.books > 1) {
                currentPage.books = totalPages > 0 ? totalPages : 1;
            }
            renderTable('books', booksData, currentPage.books);
        })
        .catch(error => {
            console.error('Error deleting book:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}

function renderTable(sectionId, data, page) {
    const tableBody = document.getElementById(`${sectionId}-table-body`);
    tableBody.innerHTML = '';

    // Filter data for borrowed books based on status
    let filteredData = data;
    if (sectionId === 'borrowed-books' && borrowedBooksFilterStatus !== 'all') {
        filteredData = data.filter(item => {
            const currentDate = new Date();
            const due_date = item.due_date ? new Date(item.due_date) : null;
            let status = item.return_date === null ? "On Hold" : (due_date && currentDate > due_date ? "Passed Due" : "Returned");
            return status === borrowedBooksFilterStatus;
        });
    }

    // Handle empty data case
    if (!filteredData || filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="${sectionId === 'books' ? 8 : 4}" style="text-align: center;">No data available</td>`;
        tableBody.appendChild(row);
        document.getElementById(`${sectionId}-page-info`).textContent = `Page 1`;
        document.querySelector(`#${sectionId}-pagination button:first-child`).disabled = true;
        document.querySelector(`#${sectionId}-pagination button:last-child`).disabled = true;
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = filteredData.slice(start, end);

    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        if (sectionId === 'books') {
            if (!item.hasOwnProperty('id')) {
                console.warn('Book item missing id:', item);
            }
            row.innerHTML = `
                <td>${item.title || 'N/A'}</td>
                <td>${item.author || 'N/A'}</td>
                <td>${item.category || 'N/A'}</td>
                <td>${item.publication_year || 'N/A'}</td>
                <td>${item.available_copies || '0'}</td>
                <td>${item.total_copies || '0'}</td>
                <td>
                    <button onclick="showEditBookForm(${item.id || 'null'})" style="padding: 5px 10px; border: none; background-color: #3498db; color: white; cursor: pointer; border-radius: 3px;">
                        Edit
                    </button>
                </td>
                <td>
                    <button onclick="deleteBook(${item.id || 'null'})" style="padding: 5px 10px; border: none; background-color: #e74c3c; color: white; cursor: pointer; border-radius: 3px;">
                        Delete
                    </button>
                </td>
            `;
        } else {
            let status = "";
            const currentDate = new Date();
            const due_date = item.due_date ? new Date(item.due_date) : null;

            if (item.return_date === null) {
                status = "On Hold";
            } else if (due_date && currentDate > due_date) {
                status = "Passed Due";
            } else {
                status = "Returned";
            }

            row.innerHTML = `
                <td>${item.book_id || 'N/A'}</td>
                <td>${item.borrow_date || 'N/A'}</td>
                <td>${item.due_date || 'N/A'}</td>
                <td>${status}</td>
            `;
        }
        tableBody.appendChild(row);
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    document.getElementById(`${sectionId}-page-info`).textContent = `Page ${page}`;
    document.querySelector(`#${sectionId}-pagination button:first-child`).disabled = page === 1;
    document.querySelector(`#${sectionId}-pagination button:last-child`).disabled = page === totalPages;

    // Update sort button states
    document.querySelectorAll(`#${sectionId}-table .sort-btn`).forEach(btn => {
        btn.classList.remove('active');
        const sortState = sectionId === 'books' ? sortState : borrowedBooksSortState;
        if (btn.dataset.column === sortState.column && btn.dataset.order === sortState.order) {
            btn.classList.add('active');
        }
    });
}

function changePage(sectionId, delta) {
    currentPage[sectionId] += delta;
    renderTable(sectionId, sectionId === 'books' ? booksData : borrowedBooksData, currentPage[sectionId]);
}
//================================//


//===Borrowed Book Section===//
// Sort Borrowed Books
function sortBorrowedBooks(column, order) {
    borrowedBooksSortState.column = column;
    borrowedBooksSortState.order = order;

    borrowedBooksData.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // Handle Status column (computed dynamically)
        if (column === 'status') {
            const currentDate = new Date();
            const dueDateA = a.due_date ? new Date(a.due_date) : null;
            const dueDateB = b.due_date ? new Date(b.due_date) : null;
            valueA = a.return_date === null ? "On Hold" : (dueDateA && currentDate > dueDateA ? "Passed Due" : "Returned");
            valueB = b.return_date === null ? "On Hold" : (dueDateB && currentDate > dueDateB ? "Passed Due" : "Returned");
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        // Handle date columns (borrow_date, due_date)
        else if (column === 'borrow_date' || column === 'due_date') {
            valueA = valueA ? new Date(valueA) : new Date(0); // Fallback to epoch for null/undefined
            valueB = valueB ? new Date(valueB) : new Date(0);
        }
        // Handle numeric column (book_id)
        else if (column === 'book_id') {
            valueA = Number(valueA) || 0;
            valueB = Number(valueB) || 0;
        }

        if (order === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    // Reset to first page after sorting and reapply filter
    currentPage['borrowed-books'] = 1;
    renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
}
// Filter Borrowed Books
function filterBorrowedBooks() {
    borrowedBooksFilterStatus = document.getElementById('status-filter').value;
    currentPage['borrowed-books'] = 1; // Reset to page 1 when filter changes
    renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
}
//================================//

//===PROFILE SECTION===//
function showEditProfileForm() {
    document.getElementById('profileaview').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';
}

function cancelEditProfile() {
    document.getElementById('profile-edit').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
    document.getElementById('edit-profile-form').reset();
    document.getElementById('profile-success').textContent = '';
    document.getElementById('profile-error').style.display = 'none';
    document.getElementById('profile-error').textContent = '';
}

function updateProfile(event) {
    event.preventDefault(); // Prevent form submission

    const name = document.getElementById('edit-name').value;
    const username = document.getElementById('edit-username').value;
    const email = document.getElementById('edit-email').value;
    const dob = document.getElementById('edit-dob').value;
    const address = document.getElementById('edit-address').value;
    const successMessage = document.getElementById('profile-success');
    const errorMessage = document.getElementById('profile-error');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Validate inputs
    if (!name || !username || !email || !dob || !address) {
        errorMessage.textContent = 'Please fill in all fields.';
        errorMessage.style.display = 'block';
        return;
    }

    // Make POST request
    fetch('/spring-library/profile/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Include CSRF token
        },
        body: JSON.stringify({ name, username, email, dob, address })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to update profile');
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Profile updated successfully!';
            errorMessage.style.display = 'none';
            // Update the profile view with new data
            document.querySelector('#profile-view .profile-row:nth-child(1) span').textContent = name;
            document.querySelector('#profile-view .profile-row:nth-child(2) span').textContent = username;
            document.querySelector('#profile-view .profile-row:nth-child(3) span').textContent = email;
            document.querySelector('#profile-view .profile-row:nth-child(4) span').textContent = dob;
            document.querySelector('#profile-view .profile-row:nth-child(5) span').textContent = address;
            // Switch back to view mode
            document.getElementById('profile-edit').style.display = 'none';
            document.getElementById('profile-view').style.display = 'block';
            document.getElementById('edit-profile-form').reset();
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}
//================================//

//===ANNOUNCEMENT SECTION===//
function fetchAnnouncements() {
    fetch('/spring-library/librarian/announcements', { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            announcementsData = data;
            renderAnnouncements();
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
            renderAnnouncements(); // Render with current data as fallback
        });
}

function renderAnnouncements() {
    const announcementsList = document.getElementById('announcements-list');
    announcementsList.innerHTML = '';

    if (!announcementsData || announcementsData.length === 0) {
        announcementsList.innerHTML = '<p style="text-align: center;">No announcements available</p>';
        return;
    }

    announcementsData.forEach(announcement => {
        const announcementDiv = document.createElement('div');
        announcementDiv.className = 'announcement';
        // Replace newline characters with <br> tags for consistent rendering
        const formattedContent = (announcement.content || 'N/A').replace(/\n/g, '<br>');
        announcementDiv.innerHTML = `
            <h3>${announcement.title || 'N/A'}</h3>
            <p>${formattedContent}</p>
            <div style="margin-top: 10px; text-align: right;">
                <button onclick="showEditAnnouncementForm(${announcement.id})" style="padding: 5px 10px; border: none; background-color: #3498db; color: white; cursor: pointer; border-radius: 3px; margin-right: 5px;">
                    Edit
                </button>
                <button onclick="deleteAnnouncement(${announcement.id})" style="padding: 5px 10px; border: none; background-color: #e74c3c; color: white; cursor: pointer; border-radius: 3px;">
                    Delete
                </button>
            </div>
        `;
        announcementsList.appendChild(announcementDiv);
    });
}

function showAddAnnouncementForm() {
    const formContainer = document.getElementById('add-announcement-form-container');
    formContainer.style.display = 'block';
    formContainer.classList.add('active');
    document.getElementById('announcement-success').textContent = '';
    document.getElementById('announcement-error').style.display = 'none';
    document.getElementById('announcement-error').textContent = '';
    document.getElementById('add-announcement-form').reset();
}

function cancelAddAnnouncement() {
    const formContainer = document.getElementById('add-announcement-form-container');
    formContainer.style.display = 'none';
    formContainer.classList.remove('active');
    document.getElementById('add-announcement-form').reset();
    document.getElementById('announcement-success').textContent = '';
    document.getElementById('announcement-error').style.display = 'none';
    document.getElementById('announcement-error').textContent = '';
}

function addAnnouncement(event) {
    event.preventDefault();

    const title = document.getElementById('announcement-title').value;
    const content = document.getElementById('announcement-content').value;
    const successMessage = document.getElementById('announcement-success');
    const errorMessage = document.getElementById('announcement-error');
    const formContainer = document.getElementById('add-announcement-form-container');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Validate inputs
    if (!title || !content) {
        errorMessage.textContent = 'Please fill in both title and content.';
        errorMessage.style.display = 'block';
        return;
    }

    fetch('/spring-library/librarian/announcements', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ title, content })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to add announcement');
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Announcement added successfully!';
            errorMessage.style.display = 'none';
            document.getElementById('add-announcement-form').reset();
            formContainer.style.display = 'none';
            formContainer.classList.remove('active');
            fetchAnnouncements(); // Refresh the announcements list
        })
        .catch(error => {
            console.error('Error adding announcement:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}

function showEditAnnouncementForm(id) {
    const announcement = announcementsData.find(a => a.id === id);
    if (!announcement) {
        console.error('Announcement not found:', id);
        return;
    }

    document.getElementById('edit-announcement-id').value = announcement.id;
    document.getElementById('edit-announcement-title').value = announcement.title || '';
    document.getElementById('edit-announcement-content').value = announcement.content || '';
    const formContainer = document.getElementById('edit-announcement-form-container');
    formContainer.style.display = 'block';
    formContainer.classList.add('active');
    document.getElementById('edit-announcement-success').textContent = '';
    document.getElementById('edit-announcement-error').style.display = 'none';
    document.getElementById('edit-announcement-error').textContent = '';
}

function cancelEditAnnouncement() {
    const formContainer = document.getElementById('edit-announcement-form-container');
    formContainer.style.display = 'none';
    formContainer.classList.remove('active');
    document.getElementById('edit-announcement-form').reset();
    document.getElementById('edit-announcement-success').textContent = '';
    document.getElementById('edit-announcement-error').style.display = 'none';
    document.getElementById('edit-announcement-error').textContent = '';
}

function updateAnnouncement(event) {
    event.preventDefault();

    const id = document.getElementById('edit-announcement-id').value;
    const title = document.getElementById('edit-announcement-title').value;
    const content = document.getElementById('edit-announcement-content').value;
    const successMessage = document.getElementById('edit-announcement-success');
    const errorMessage = document.getElementById('edit-announcement-error');
    const formContainer = document.getElementById('edit-announcement-form-container');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Validate inputs
    if (!title || !content) {
        errorMessage.textContent = 'Please fill in both title and content.';
        errorMessage.style.display = 'block';
        return;
    }

    fetch(`/spring-library/librarian/announcements/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ title, content })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to update announcement');
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Announcement updated successfully!';
            errorMessage.style.display = 'none';
            formContainer.style.display = 'none';
            formContainer.classList.remove('active');
            document.getElementById('edit-announcement-form').reset();
            fetchAnnouncements(); // Refresh the announcements list
        })
        .catch(error => {
            console.error('Error updating announcement:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}

function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const successMessage = document.getElementById('announcement-success');
    const errorMessage = document.getElementById('announcement-error');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    fetch(`/spring-library/librarian/announcements/${id}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to delete announcement');
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Announcement deleted successfully!';
            errorMessage.style.display = 'none';
            fetchAnnouncements(); // Refresh the announcements list
        })
        .catch(error => {
            console.error('Error deleting announcement:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}
//================================//


//===Check-In/Check-Out Functions===//
function fetchCheckInOutData(action) {
    const requestId = document.getElementById('request-id').value;
    const errorMessage = document.getElementById('check-in-out-error');
    const successMessage = document.getElementById('check-in-out-success');
    const formContainer = document.getElementById('check-in-out-form-container');

    // Clear previous messages
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    successMessage.textContent = '';
    successMessage.style.display = 'none';
    document.getElementById('check-in-out-error-form').style.display = 'none';
    document.getElementById('check-in-out-error-form').textContent = '';

    if (!requestId) {
        errorMessage.textContent = 'Please enter a valid Request/Loan ID.';
        errorMessage.style.display = 'block';
        return;
    }

    const endpoint = action === 'check-in' ? `/spring-library/librarian/check-in/${requestId}` : `/spring-library/librarian/check-out/${requestId}`;

    fetch(endpoint, {
        method: 'GET',
        headers: {
            [csrfHeader]: csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'No data found for this Request/Loan ID.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Populate the floating form
            document.getElementById('check-in-out-id').value = data.id || requestId;
            document.getElementById('check-in-out-request-id').value = data.id || requestId;
            document.getElementById('check-in-out-book-id').value = data.book_id || 'N/A';
            document.getElementById('check-in-out-user-id').value = data.user_id || 'N/A';
            if (action == 'check-in') {
                document.getElementById('check-in-out-borrow-date').value = data.check_in_date || 'N/A';
                document.getElementById('check-in-out-due-date').value = data.expiry_date || 'N/A';
            } else {
                document.getElementById('check-in-out-borrow-date').value = data.borrow_date || 'N/A';
                document.getElementById('check-in-out-due-date').value = data.due_date || 'N/A';
            }

            document.getElementById('check-in-out-action').value = action;
            formContainer.style.display = 'block';
            formContainer.classList.add('active');
        })
        .catch(error => {
            console.error(`Error fetching ${action} data:`, error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}

function cancelCheckInOut() {
    const formContainer = document.getElementById('check-in-out-form-container');
    formContainer.style.display = 'none';
    formContainer.classList.remove('active');
    document.getElementById('check-in-out-action-form').reset();
    document.getElementById('check-in-out-success').textContent = '';
    document.getElementById('check-in-out-error-form').style.display = 'none';
    document.getElementById('check-in-out-error-form').textContent = '';
}

function handleCheckInOut(event) {
    event.preventDefault();

    const id = document.getElementById('check-in-out-id').value;
    const action = document.getElementById('check-in-out-action').value;
    const successMessage = document.getElementById('check-in-out-success');
    const errorMessage = document.getElementById('check-in-out-error-form');
    const formContainer = document.getElementById('check-in-out-form-container');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const endpoint = action === 'check-in' ? `/spring-library/librarian/check-in/${id}` : `/spring-library/librarian/check-out/${id}`;

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ id })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    errorMessage.style.color = 'red';
                    throw new Error(err.error || `Failed to perform ${action}`);
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || `${action.charAt(0).toUpperCase() + action.slice(1)} successful!`;
            errorMessage.style.display = 'none';
            formContainer.style.display = 'none';
            formContainer.classList.remove('active');
            document.getElementById('check-in-out-form').reset();
            successMessage.textContent = data.message || 'Success'
            successMessage.style.display = 'block';
            successMessage.style.color = 'blue';
        })
        .catch(error => {
            console.error(`Error performing ${action}:`, error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}
//================================//

//===Penalty Fine Functions===//
function fetchProfilePenaltyData() {
    const userId = document.getElementById('penalty-user-id').value;
    const errorMessage = document.getElementById('penalty-error');
    const formContainer = document.getElementById('penalty-form-container');

    // Clear previous messages
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    document.getElementById('penalty-success').textContent = '';
    document.getElementById('penalty-error-form').style.display = 'none';
    document.getElementById('penalty-error-form').textContent = '';

    if (!userId) {
        errorMessage.textContent = 'Please enter a valid Loan ID.';
        errorMessage.style.display = 'block';
        return;
    }

    fetch(`/spring-library/librarian/penalty/${userId}`, {
        method: 'GET',
        headers: {
            [csrfHeader]: csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'No penalty data found for this Loan ID.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Populate the floating form
            document.getElementById('penalty-user-id-hidden').value = userId;
            document.getElementById('penalty-user-id-display').value = userId;
            document.getElementById('penalty-amount').value = data || '0.00';
            formContainer.style.display = 'block';
            formContainer.classList.add('active');
        })
        .catch(error => {
            console.error('Error fetching penalty data:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}

function cancelPenaltyPayment() {
    const formContainer = document.getElementById('penalty-form-container');
    formContainer.style.display = 'none';
    formContainer.classList.remove('active');
    document.getElementById('penalty-payment-form').reset();
    document.getElementById('penalty-success').textContent = '';
    document.getElementById('penalty-error-form').style.display = 'none';
    document.getElementById('penalty-error-form').textContent = '';
}

function handlePenaltyPayment(event) {
    event.preventDefault();

    const userId = document.getElementById('penalty-user-id-hidden').value;
    const paymentAmount = document.getElementById('penalty-payment-amount').value;
    const successMessage = document.getElementById('penalty-error');
    const errorMessage = document.getElementById('penalty-error-form');
    const formContainer = document.getElementById('penalty-form-container');

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    if (!paymentAmount || paymentAmount <= 0) {
        errorMessage.textContent = 'Please enter a valid payment amount.';
        errorMessage.style.display = 'block';
        return;
    }

    fetch(`/spring-library/librarian/penalty/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ user_id: userId, amount_to_pay: paymentAmount })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    errorMessage.textContent = err.error || 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                    throw new Error(err.error || 'Failed to process payment');
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Payment processed successfully!';
            successMessage.style.display = 'block';
            successMessage.style.color = 'blue';
            errorMessage.style.display = 'none';
            formContainer.style.display = 'none';
            formContainer.classList.remove('active');
            document.getElementById('penalty-payment-form').reset();
            console.log(data.message)
            document.getElementById('penalty-user-id').value = '';
        })
        .catch(error => {
            console.error('Error processing payment:', error);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}
//================================//

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
    });
    event.target.classList.add('active');

    if (sectionId === 'announcements') {
        fetchAnnouncements();
    } else if (sectionId === 'books') {
        fetchBooks();
    } else if (sectionId === 'borrowed-books') {
        // Reset filter and page when switching to borrowed-books
        borrowedBooksFilterStatus = 'all';
        document.getElementById('status-filter').value = 'all';
        currentPage['borrowed-books'] = 1;
        fetch('/spring-library/librarian/book/borrowed-books', { method: 'GET' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                borrowedBooksData = data;
                renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
            })
            .catch(error => {
                console.error('Error fetching borrowed books:', error);
                renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
            });
    } else if (sectionId === 'check-in-check-out') {
        document.getElementById('check-in-out-form').reset();
        document.getElementById('check-in-out-error').style.display = 'none';
        document.getElementById('check-in-out-error').textContent = '';
    } else if (sectionId === 'penalty-fine') {
        document.getElementById('penalty-fine-form').reset();
        document.getElementById('penalty-error').style.display = 'none';
        document.getElementById('penalty-error').textContent = '';
    }
}

// Click-to-close backdrop for floating forms
document.addEventListener('click', function (event) {
    const addBookFormContainer = document.getElementById('add-book-form-container');
    const editBookFormContainer = document.getElementById('edit-book-form-container');
    const checkInOutFormContainer = document.getElementById('check-in-out-form-container');
    const penaltyFormContainer = document.getElementById('penalty-form-container');
    const addAnnouncementFormContainer = document.getElementById('add-announcement-form-container');
    const editAnnouncementFormContainer = document.getElementById('edit-announcement-form-container');

    if (addBookFormContainer && addBookFormContainer.classList.contains('active') && !addBookFormContainer.contains(event.target) && !event.target.closest('button[onclick="showAddBookForm()"]')) {
        cancelAddBook();
    }
    if (editBookFormContainer && editBookFormContainer.classList.contains('active') && !editBookFormContainer.contains(event.target) && !event.target.closest('button[onclick*="showEditBookForm"]')) {
        cancelEditBook();
    }
    if (checkInOutFormContainer && checkInOutFormContainer.classList.contains('active') && !checkInOutFormContainer.contains(event.target) && !event.target.closest('button[onclick*="fetchCheckInOutData"]')) {
        cancelCheckInOut();
    }
    if (penaltyFormContainer && penaltyFormContainer.classList.contains('active') && !penaltyFormContainer.contains(event.target) && !event.target.closest('button[onclick="fetchProfilePenaltyData()"]')) {
        cancelPenaltyPayment();
    }
    if (addAnnouncementFormContainer && addAnnouncementFormContainer.classList.contains('active') && !addAnnouncementFormContainer.contains(event.target) && !event.target.closest('button[onclick="showAddAnnouncementForm()"]')) {
        cancelAddAnnouncement();
    }
    if (editAnnouncementFormContainer && editAnnouncementFormContainer.classList.contains('active') && !editAnnouncementFormContainer.contains(event.target) && !event.target.closest('button[onclick*="showEditAnnouncementForm"]')) {
        cancelEditAnnouncement();
    }
});

// Ensure all variables are initialized before rendering
document.addEventListener('DOMContentLoaded', () => {
    fetchAnnouncements();
    renderTable('books', booksData, currentPage.books);
    renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
});