# ULMS Implementation Plan - Features 1-6

## Implementation Order & Dependencies

### Phase 1: Foundation & Analytics (Feature 1)
**Analytics Dashboard** - Base for monitoring all other features
- Dashboard stats API
- Analytics endpoints  
- Chart data endpoints
- Dashboard UI components

### Phase 2: User Management (Feature 2)
**User Management System**
- All users API with pagination
- User approval/rejection
- Role management
- Email notifications for status changes

### Phase 3: Book Management (Feature 3)
**Book CRUD Operations**
- Add/Edit/Delete books
- Book listing with filters
- Book details page
- Search functionality

### Phase 4: Borrow System (Feature 4)
**Borrow & Return System**
- Borrow book workflow
- Return book process
- PDF receipt generation
- Email reminders (due date, overdue)
- Borrow history

### Phase 5: Home Page (Feature 5)
**Public Home Page**
- Featured books section
- New arrivals
- 3D book effects
- Hero section

### Phase 6: Library Page (Feature 6)
**Advanced Library Search**
- Filter by genre, author, rating
- Search functionality
- Pagination
- Availability status

## Technical Stack per Feature

### Feature 1: Analytics Dashboard
- **Backend**: Analytics aggregation queries
- **Frontend**: Chart.js/Recharts for visualizations
- **Caching**: Dashboard stats (15min TTL)
- **Rate Limit**: 20 req/10s

### Feature 2: User Management
- **Backend**: User CRUD, approval workflow
- **Frontend**: User table, filters, modals
- **Email**: Approval/rejection notifications
- **Caching**: User list (5min TTL)
- **Rate Limit**: 10 req/10s

### Feature 3: Book Management
- **Backend**: Book CRUD with ImageKit
- **Frontend**: Book forms, image upload
- **Caching**: Book list, details (15min TTL)
- **Rate Limit**: 10 req/10s

### Feature 4: Borrow System
- **Backend**: Borrow logic, PDF generation
- **Frontend**: Borrow UI, receipt download
- **Workflows**: Reminder emails (QStash)
- **Caching**: Borrow records (5min TTL)
- **Rate Limit**: Borrow (3 req/min), API (10 req/10s)

### Feature 5: Home Page
- **Backend**: Featured books API
- **Frontend**: 3D effects, animations
- **Caching**: Featured books (1hour TTL)
- **Rate Limit**: 20 req/10s

### Feature 6: Library Page
- **Backend**: Advanced search, filters
- **Frontend**: Search UI, filter controls
- **Caching**: Search results (10min TTL)
- **Rate Limit**: Search (20 req/10s)

## Files to Create

### API Routes (Backend)
```
app/api/
├── analytics/
│   ├── dashboard/route.ts
│   ├── trends/route.ts
│   └── stats/route.ts
├── users/
│   ├── route.ts (GET all, POST create)
│   ├── [id]/route.ts (GET, PATCH, DELETE)
│   ├── [id]/role/route.ts (PATCH role)
│   └── approve/route.ts (POST approve/reject)
├── books/
│   ├── route.ts (GET all, POST create)
│   ├── [id]/route.ts (GET, PATCH, DELETE)
│   ├── featured/route.ts
│   ├── new/route.ts
│   └── search/route.ts
├── borrow/
│   ├── route.ts (GET all, POST borrow)
│   ├── [id]/route.ts (GET details)
│   ├── [id]/return/route.ts (PATCH return)
│   └── [id]/receipt/route.ts (GET PDF)
└── workflows/
    ├── borrow-reminder/route.ts
    ├── welcome-email/route.ts
    └── role-update/route.ts
```

### Frontend Pages
```
app/
├── (root)/
│   ├── page.tsx (Home page)
│   └── library/
│       ├── page.tsx (Library listing)
│       └── [id]/page.tsx (Book details)
├── admin/
│   ├── page.tsx (Dashboard - enhance)
│   ├── users/
│   │   ├── page.tsx (All users)
│   │   └── requests/page.tsx (Approval requests)
│   ├── books/
│   │   ├── page.tsx (All books)
│   │   ├── add/page.tsx (Add book)
│   │   ├── [id]/page.tsx (Book details)
│   │   └── [id]/edit/page.tsx (Edit book)
│   └── borrow/
│       └── page.tsx (Borrow records)
└── profile/
    └── page.tsx (User profile, borrowed books)
```

### Components
```
components/
├── analytics/
│   ├── DashboardStats.tsx
│   ├── TrendsChart.tsx
│   └── StatsCard.tsx
├── books/
│   ├── BookCard.tsx
│   ├── BookCard3D.tsx
│   ├── BookForm.tsx
│   ├── BookFilters.tsx
│   └── BookSearch.tsx
├── users/
│   ├── UserTable.tsx
│   ├── UserApprovalModal.tsx
│   └── RoleSelector.tsx
└── borrow/
    ├── BorrowModal.tsx
    ├── BorrowTable.tsx
    └── ReceiptDownload.tsx
```

### Utilities
```
lib/
├── analytics.ts (Analytics helpers)
├── email-templates.ts (Email HTML templates)
├── pdf-generator.ts (Receipt PDF generation)
└── queries.ts (Reusable DB queries)
```

## Implementation Progress Tracker

- [ ] Feature 1: Analytics Dashboard
  - [ ] Backend APIs
  - [ ] Dashboard UI
  - [ ] Charts integration
  
- [ ] Feature 2: User Management
  - [ ] User CRUD APIs
  - [ ] Approval workflow
  - [ ] Role management
  - [ ] Email notifications
  
- [ ] Feature 3: Book Management
  - [ ] Book CRUD APIs
  - [ ] Book forms
  - [ ] Image upload
  - [ ] Search/filter
  
- [ ] Feature 4: Borrow System
  - [ ] Borrow/return APIs
  - [ ] PDF generation
  - [ ] Email reminders
  - [ ] Borrow UI
  
- [ ] Feature 5: Home Page
  - [ ] Featured books API
  - [ ] Home UI
  - [ ] 3D effects
  
- [ ] Feature 6: Library Page
  - [ ] Search API
  - [ ] Filter API
  - [ ] Library UI
  - [ ] Pagination

---

**Status**: Ready to implement
**Start Date**: 2025-11-20
