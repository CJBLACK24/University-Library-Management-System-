# API Documentation - ULMS

Complete API reference for the University Library Management System.

---

## 🔐 Authentication

All API routes support rate limiting. Some routes may require authentication (to be implemented with NextAuth middleware).

---

## 📊 Analytics APIs

### GET /api/analytics/dashboard

Get dashboard statistics.

**Response:**
```json
{
  "totalUsers": 150,
  "totalBooks": 500,
  "totalBorrowedBooks": 45,
  "pendingRequests": 12,
  "newUsersThisMonth": 8,
  "newBooksThisMonth": 15,
  "borrowsThisMonth": 32,
  "availableBooks": 455
}
```

### GET /api/analytics/trends

Get trend data for charts.

**Query Parameters:**
- `days` (optional): Number of days (1-365, default: 30)

**Response:**
```json
[
  {
    "date": "2025-11-01",
    "borrowed": 5,
    "returned": 3,
    "newUsers": 2,
    "newBooks": 1
  }
]
```

### GET /api/analytics/stats

Get additional statistics.

**Query Parameters:**
- `type` (optional): "all", "top-books", or "recent-activities"

**Response:**
```json
{
  "topBooks": [...],
  "recentActivities": [...]
}
```

---

## 👥 User Management APIs

### GET /api/users

List all users with pagination and filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional): Search by name or email
- `status` (optional): "PENDING", "APPROVED", "REJECTED", or "all"
- `role` (optional): "USER", "ADMIN", or "all"

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### POST /api/users

Create a new user (admin only).

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "universityId": 12345,
  "password": "securepassword",
  "universityCard": "base64_image",
  "role": "USER"
}
```

### GET /api/users/[id]

Get user details by ID.

### PATCH /api/users/[id]

Update user information.

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "newemail@example.com",
  "password": "newpassword"
}
```

### DELETE /api/users/[id]

Delete a user.

### PATCH /api/users/[id]/role

Change user role.

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Note:** Sends email notification to user.

### POST /api/users/approve

Approve or reject user account request.

**Request Body:**
```json
{
  "userId": "uuid",
  "action": "approve"
}
```

**Note:** Sends email notification to user.

---

## 📚 Book Management APIs

### GET /api/books

List all books with pagination, search, and filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)
- `search` (optional): Search title, author, description
- `genre` (optional): Filter by genre
- `author` (optional): Filter by author
- `minRating` (optional): Minimum rating (0-5)
- `available` (optional): "true" for only available books

**Response:**
```json
{
  "books": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 500,
    "totalPages": 42
  }
}
```

### POST /api/books

Create a new book.

**Request Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "Fiction",
  "rating": 4,
  "coverUrl": "https://imagekit.io/...",
  "coverColor": "#FF5733",
  "description": "Book description...",
  "totalCopies": 5,
  "availableCopies": 5,
  "videoUrl": "https://...",
  "summary": "Short summary..."
}
```

### GET /api/books/[id]

Get book details by ID.

### PATCH /api/books/[id]

Update book information.

### DELETE /api/books/[id]

Delete a book.

### GET /api/books/featured

Get featured books (rating >= 4).

**Query Parameters:**
- `limit` (default: 10)

### GET /api/books/new

Get newly added books.

**Query Parameters:**
- `limit` (default: 10)
- `days` (default: 30)

---

## 📖 Borrow System APIs

### GET /api/borrow

List all borrow records.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `userId` (optional): Filter by user
- `status` (optional): "BORROWED" or "RETURNED"

**Response:**
```json
{
  "records": [
    {
      "id": "uuid",
      "borrowDate": "2025-11-01",
      "dueDate": "2025-11-15",
      "returnDate": null,
      "status": "BORROWED",
      "user": {...},
      "book": {...}
    }
  ],
  "pagination": {...}
}
```

### POST /api/borrow

Borrow a book.

**Request Body:**
```json
{
  "userId": "uuid",
  "bookId": "uuid",
  "daysToReturn": 14
}
```

**Note:** 
- Decreases available copies
- Sends confirmation email
- Triggers reminder workflow

### PATCH /api/borrow/[id]/return

Return a borrowed book.

**Response:**
```json
{
  "record": {...},
  "isLate": false,
  "daysLate": 0,
  "message": "Book returned successfully"
}
```

**Note:**
- Increases available copies
- Sends return confirmation email
- Calculates late fees if applicable

### GET /api/borrow/[id]/receipt

Download PDF receipt for borrow record.

**Response:** PDF file download

---

## 📧 Workflow APIs

### POST /api/workflows/borrow-reminder

Automated workflow for borrow reminders (triggered by system).

**Sends emails:**
- 3 days before due date
- On due date
- 1 day after due date (if overdue)

---

## 🧪 Testing API

### GET /api/test/redis

Test Redis connection and caching.

**Response:**
```json
{
  "success": true,
  "connection": "✅ Connected",
  "caching": "✅ Working",
  "totalCachedKeys": 5,
  "timestamp": "2025-11-20T00:00:00.000Z"
}
```

---

## 🔄 Rate Limiting

All APIs include rate limiting headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1700000000
```

**Rate Limits:**
- General API: 10 requests / 10 seconds
- Auth operations: 5 requests / 1 minute
- Search: 20 requests / 10 seconds
- Borrow: 3 requests / 1 minute

---

## 💾 Caching

APIs use Redis caching with TTL:

- **SHORT**: 1 minute (activities)
- **MEDIUM**: 5 minutes (user/borrow data)
- **LONG**: 15 minutes (analytics, books)
- **VERY_LONG**: 1 hour (featured books)

Cache is automatically invalidated on data changes.

---

## ❌ Error Responses

All APIs return consistent error format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 409: Conflict
- 429: Too Many Requests
- 500: Internal Server Error

---

**Generated:** 2025-11-20
**Version:** 1.0
