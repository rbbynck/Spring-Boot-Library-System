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
        `;
        announcementsList.appendChild(announcementDiv);
    });
}
//================================//


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
                booksData = data; // Update with fetched data
                renderTable('books', booksData, currentPage.books);
            })
        .catch(error => {
                console.error('Error fetching books:', error);
                renderTable('books', booksData, currentPage.books); // Fallback to current data
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
        row.innerHTML = `<td colspan="${sectionId === 'books' ? 6 : 4}" style="text-align: center;">No data available</td>`;
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
                <td>
                    <button onclick="borrowBook(${item.id || 'null'})" ${item.available_copies <= 0 ? 'disabled' : ''}
                        style="padding: 5px 10px; border: none; background-color: ${item.available_copies <= 0 ? '#bdc3c7' : '#3498db'}; color: white; cursor: ${item.available_copies <= 0 ? 'not-allowed' : 'pointer'}; border-radius: 3px;">
                        Borrow
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
        const currentSortState = sectionId === 'books' ? sortState : borrowedBooksSortState;
        if (btn.dataset.column === currentSortState.column && btn.dataset.order === currentSortState.order) {
            btn.classList.add('active');
        }
    });
}

function changePage(sectionId, delta) {
    currentPage[sectionId] += delta;
    renderTable(sectionId, sectionId === 'books' ? booksData : borrowedBooksData, currentPage[sectionId]);
}
//================================//


//===BORROWED BOOK SECTION===//
function fetchBorrowedBooks() {
    fetch('/spring-library/book/borrowed-book', { method: 'GET' })
        .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
        .then(data => {
                    borrowedBooksData = data; // Update with fetched data
                    renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
                })
        .catch(error => {
                    console.error('Error fetching borrowed books:', error);
                    renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']); // Fallback to current data
                });
}

function borrowBook(bookId) {
    if (!bookId || bookId === 'null') {
        console.error('Invalid bookId:', bookId);
        const errorMessage = document.getElementById('books-error') || document.createElement('p');
        errorMessage.id = 'books-error';
        errorMessage.style.color = 'red';
        errorMessage.style.display = 'block';
        errorMessage.style.textAlign = 'center';
        errorMessage.style.marginTop = '10px';
        errorMessage.textContent = 'Invalid book ID. Unable to borrow.';
        const booksSection = document.getElementById('books');
        if (!document.getElementById('books-error')) {
            booksSection.appendChild(errorMessage);
        }
        return;
    }

    const errorMessage = document.getElementById('books-error') || document.createElement('p');
    errorMessage.id = 'books-error';
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none';
    errorMessage.style.textAlign = 'center';
    errorMessage.style.marginTop = '10px';

    const booksSection = document.getElementById('books');
    if (!document.getElementById('books-error')) {
        booksSection.appendChild(errorMessage);
    }

    // Clear previous error message
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Make POST request to borrow the book
    fetch(`/spring-library/book/loan-book/${bookId}`, {
        method: 'POST',
        headers: {
            [csrfHeader]: csrfToken // Include CSRF token
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to borrow book');
                });
            }
            return response.json();
        })
        .then(data => {
            var successMessage = data.message;
            // Refresh the books table to reflect updated available copies
            fetch('/spring-library/book', { method: 'GET' })
                .then(response => response.json())
                .then(data => {
                    booksData = data;
                    renderTable('books', booksData, currentPage.books);
                    // Show success message
                    errorMessage.style.color = 'blue';
                    errorMessage.textContent = successMessage;
                    errorMessage.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error refreshing books:', error);
                    errorMessage.textContent = 'Error refreshing book list.';
                    errorMessage.style.display = 'block';
                });
        })
        .catch(error => {
            console.error('Error borrowing book:', error);
            errorMessage.textContent = error.message || 'An error occurred while borrowing the book.';
            errorMessage.style.display = 'block';
        });
}

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

function filterBorrowedBooks() {
    console.log('WHAT');
    borrowedBooksFilterStatus = document.getElementById('status-filter').value;
    currentPage['borrowed-books'] = 1; // Reset to page 1 when filter changes
    renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
}
//================================//


//===REQUEST BOOK SECTION===//
function requestBook(event) {
    event.preventDefault(); // Prevent form submission

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const messageContainer = document.getElementById('request-message');
    const successMessage = document.querySelector('#request-message p');
    const errorMessage = document.getElementById('request-error');
    const csrfToken = document.querySelector('input[name="_csrf"]').value;

    // Clear previous messages
    successMessage.textContent = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Validate inputs
    if (!title || !author) {
        errorMessage.textContent = 'Please fill in both title and author.';
        errorMessage.style.display = 'block';
        return;
    }

    // Make POST request
    fetch('/spring-library/book/request-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Include CSRF token
        },
        body: JSON.stringify({ title, author })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Failed to Request a Book`);
                });
            }
            return response.json();
        })
        .then(data => {
            successMessage.textContent = data.message || 'Book request submitted successfully!';
            errorMessage.style.display = 'none';
            document.getElementById('request-book-form').reset();
        })
        .catch(error => {
            console.error('Error requesting book:', error.message);
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
}
//================================//

//===PROFILE SECTION===//
function showEditProfileForm() {
    document.getElementById('profile-view').style.display = 'none';
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
        borrowedBooksFilterStatus = 'all';
        document.getElementById('status-filter').value = 'all';
        currentPage['borrowed-books'] = 1;
        fetchBorrowedBooks();
    }
}
//================================//


// Ensure all variables are initialized before rendering
document.addEventListener('DOMContentLoaded', () => {
    fetchAnnouncements();
    renderTable('books', booksData, currentPage.books);
    renderTable('borrowed-books', borrowedBooksData, currentPage['borrowed-books']);
});