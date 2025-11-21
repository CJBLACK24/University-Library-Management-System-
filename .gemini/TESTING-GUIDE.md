# 🚀 Quick Start Testing Guide

Test your newly implemented backend APIs!

---

## ⚡ Prerequisites

1. **Add Redis Credentials** to `.env.local`:
```env
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token
```

2. **Restart Development Server**:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🧪 Quick Tests

### 1. Test Redis Connection ✅

Visit in browser:
```
http://localhost:3000/api/test/redis
```

Expected response:
```json
{
  "success": true,
  "connection": "✅ Connected",
  "caching": "✅ Working"
}
```

---

### 2. Test Analytics Dashboard 📊

```
http://localhost:3000/api/analytics/dashboard
```

Expected response:
```json
{
  "totalUsers": 0,
  "totalBooks": 0,
  "totalBorrowedBooks": 0,
  ...
}
```

---

### 3. Test Get All Books 📚

```
http://localhost:3000/api/books?page=1&limit=10
```

Expected response:
```json
{
  "books": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### 4. Test Featured Books ⭐

```
http://localhost:3000/api/books/featured?limit=5
```

---

### 5. Test Get All Users 👥

```
http://localhost:3000/api/users?page=1&limit=10
```

---

### 6. Test Borrow Records 📖

```
http://localhost:3000/api/borrow?page=1&limit=20
```

---

## 🔧 Testing with cURL/Postman

### Create a Book (POST)

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "genre": "Fiction",
    "rating": 5,
    "coverUrl": "https://example.com/cover.jpg",
    "coverColor": "#FF5733",
    "description": "A test book description",
    "totalCopies": 5,
    "availableCopies": 5,
    "videoUrl": "",
    "summary": "Test summary"
  }'
```

### Create a User (POST)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@university.edu",
    "universityId": 12345,
    "password": "testpassword123",
    "role": "USER"
  }'
```

### Borrow a Book (POST)

```bash
curl -X POST http://localhost:3000/api/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "bookId": "book-uuid-here",
    "daysToReturn": 14
  }'
```

---

## 📊 Testing Rate Limiting

Make multiple rapid requests to see rate limiting in action:

```bash
# This should eventually return 429 Too Many Requests
for i in {1..15}; do
  curl http://localhost:3000/api/books
  echo "\nRequest $i done"
done
```

---

## ✅ Checklist

Test each feature:

- [ ] Redis connection works
- [ ] Analytics dashboard returns data
- [ ] Can list users (empty or with data)
- [ ] Can list books (empty or with data)
- [ ] Can create a book
- [ ] Can create a user
- [ ] Can get featured books
- [ ] Can get new books
- [ ] Rate limiting triggers on rapid requests
- [ ] Can borrow a book (after creating user & book)
- [ ] Can download PDF receipt
- [ ] Can return a book

---

## 🐛 Common Issues

### Issue: 500 Error on Any Request
**Cause**: Redis not configured
**Fix**: Add Redis credentials to `.env.local` and restart server

### Issue: "User not found" or "Book not found"
**Cause**: Database is empty
**Fix**: Seed the database with initial data

### Issue: Email-related errors in logs
**Cause**: Resend/QStash not configured
**Fix**: Add proper credentials; emails will fail gracefully

---

## 📝 Seed Database (Optional)

If you have a seed script:
```bash
npm run seed
```

Or manually create test data using the POST endpoints above.

---

## 🎯 Next: Build Frontend

Once APIs are tested and working:
1. Build admin pages to manage users/books/borrows
2. Build public pages (home, library)
3. Add charts to dashboard
4. Integrate Image Kit for uploads
5. Add 3D book effects

---

**Happy Testing! 🚀**
