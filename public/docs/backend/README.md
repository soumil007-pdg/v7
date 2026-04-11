# ADVOCAT-Easy Backend Documentation

Complete guide to building and understanding the ADVOCAT-Easy backend.

## 📚 What's Inside?

18 comprehensive chapters covering everything from backend basics to complete implementation:

### Foundations (Chapters 1-3)
- **Chapter 1:** Backend Basics & Architecture
- **Chapter 2:** Node.js Fundamentals & Async Patterns
- **Chapter 3:** Next.js API Routes Deep Dive

### Authentication & Security (Chapters 4-7)
- **Chapter 4:** Authentication System (Local & Token-Based)
- **Chapter 5:** Password Hashing & Security (bcryptjs)
- **Chapter 6:** Session Management (In-Memory Store)
- **Chapter 7:** Authorization & Access Control

### API Development (Chapters 8-12)
- **Chapter 8:** Error Handling & Validation
- **Chapter 9:** Middleware & Request Pipeline
- **Chapter 10:** RESTful API Design Principles
- **Chapter 11:** Request/Response Handling
- **Chapter 12:** Status Codes & Error Responses

### Advanced Topics (Chapters 13-17)
- **Chapter 13:** API Testing & Debugging
- **Chapter 14:** Rate Limiting & Throttling
- **Chapter 15:** Database Design & Models
- **Chapter 16:** Google Gemini AI Integration
- **Chapter 17:** External API Integration (Apify, Lawyers)

### Complete Implementation (Chapter 18)
- **Chapter 18:** ADVOCAT-Easy Backend Complete Implementation Guide

## 🎯 Who Should Read This?

- **Beginners:** Start at Chapter 1, read sequentially
- **Junior Developers:** Chapters 4-12 for practical API development
- **Team Members:** Chapter 18 for complete system overview
- **Fork-Ready Developers:** All chapters to understand and adapt the backend

## 🚀 Getting Started

### Read Online
- Visit `http://localhost:3000/docs/hub.html`
- Click "Backend Documentation" → "View Backend Docs"
- Click any chapter to start reading

### Local Development
```bash
# Clone the repo
git clone https://github.com/...

# Install dependencies
npm install

# Run dev server
npm run dev

# Open docs
# http://localhost:3000/docs/backend/index-modular.html
```

## 📖 Chapter Overview

### Chapter 1: Backend Basics & Architecture
**Learn:** What is a backend? How does it work with the frontend? Architecture overview.

**Key Concepts:** Requests, responses, tokens, sessions, validation

### Chapter 2: Node.js Fundamentals
**Learn:** JavaScript on the server. Async/await, promises, callbacks.

**Key Concepts:** Event loop, non-blocking I/O, modules, error handling

### Chapter 3: Next.js API Routes
**Learn:** Creating API endpoints. HTTP methods (GET, POST, PUT, DELETE).

**Key Concepts:** Route handlers, request objects, response objects, status codes

### Chapter 4: Authentication System
**Learn:** Token-based authentication. How login works end-to-end.

**Key Concepts:** Tokens, sessions, signup, login, logout, validation

### Chapter 5: Password Hashing
**Learn:** Never store passwords in plain text. Using bcryptjs.

**Key Concepts:** Hashing, salt, bcrypt, password verification

### Chapter 6: Session Management
**Learn:** Storing session data in-memory. Token expiration, cleanup.

**Key Concepts:** Maps, session structure, expiry, validation

### Chapter 7: Authorization
**Learn:** What users are ALLOWED to do. Roles, permissions, resource access.

**Key Concepts:** Authentication vs Authorization, 401 vs 403, roles, audit logging

### Chapter 8: Error Handling
**Learn:** Handling errors gracefully. Validation, try/catch, error responses.

**Key Concepts:** 400/401/403/500, error messages, validation helpers

### Chapter 9: Middleware
**Learn:** Code that runs before route handlers. Global checks and logging.

**Key Concepts:** Middleware pipeline, global vs route middleware, request processing

### Chapter 10: RESTful APIs
**Learn:** Standard patterns for API design. Resources, methods, consistency.

**Key Concepts:** REST principles, CRUD operations, resource URLs, filtering

### Chapter 11: Request/Response Handling
**Learn:** Extracting data from requests, building responses.

**Key Concepts:** Headers, body, query params, content types, streaming

### Chapter 12: Status Codes
**Learn:** Using HTTP status codes correctly. 2xx, 4xx, 5xx responses.

**Key Concepts:** 200, 201, 400, 401, 403, 404, 500, decision tree

### Chapter 13: API Testing
**Learn:** Testing your API with curl, DevTools, Postman.

**Key Concepts:** curl commands, DevTools Network tab, logging, debugging

### Chapter 14: Rate Limiting
**Learn:** Preventing abuse. Limiting requests per user/IP.

**Key Concepts:** Rate limiting, throttling, sliding window, retry-after headers

### Chapter 15: Database Design
**Learn:** Structuring data. Models, relationships, validation.

**Key Concepts:** Tables, documents, relationships, indexes, migrations

### Chapter 16: Gemini Integration
**Learn:** Using AI to provide legal advice. System instructions, safety.

**Key Concepts:** Gemini API, system instructions, streaming, caching, error handling

### Chapter 17: External APIs
**Learn:** Calling other services (Apify, lawyers API). Error handling, caching.

**Key Concepts:** Authentication, timeouts, retries, caching, rate limiting

### Chapter 18: Complete Implementation
**Learn:** How all pieces work together. Complete request flows.

**Key Concepts:** Architecture, security, performance, testing, deployment checklists

## 🛠️ ADVOCAT-Easy Backend Structure

```
app/
  ├── api/
  │   ├── auth/
  │   │   ├── login/route.js
  │   │   ├── signup/route.js
  │   │   ├── validate/route.js
  │   │   └── logout/route.js
  │   ├── chat/route.js
  │   └── case-advisor/route.js
  │
  ├── middleware.js           (Global request processing)
  │
  └── lib/
      ├── authStore.js        (Users & sessions storage)
      └── db.js               (Database helpers)
```

## 🔑 Key Concepts at a Glance

| Concept | Chapter | Definition |
|---------|---------|------------|
| Token | 4 | Unique string proving you're logged in |
| Authentication | 4 | Proving WHO you are |
| Authorization | 7 | Deciding WHAT you can do |
| Hash | 5 | One-way encryption of passwords |
| Session | 6 | Server-side record of login |
| Middleware | 9 | Code running before route handlers |
| Route Handler | 3 | Function handling API requests |
| Status Code | 12 | HTTP response code (200, 400, 500, etc.) |
| Rate Limiting | 14 | Preventing abuse by limiting requests |
| CRUD | 10 | Create, Read, Update, Delete operations |

## 📝 Quick Reference

### HTTP Methods
- `GET` - Read/retrieve data
- `POST` - Create/send data
- `PUT` - Update data
- `DELETE` - Delete data

### Status Code Ranges
- `2xx` - Success (200, 201, 204)
- `4xx` - Client error (400, 401, 403, 404)
- `5xx` - Server error (500, 502, 503)

### Authentication Pattern
1. User submits email & password
2. Backend hashes password, compares with stored hash
3. If valid, create token and session
4. Return token to frontend
5. Frontend sends token in Authorization header for future requests
6. Backend validates token, allows request if valid

## 🧪 Testing Endpoints

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Chat (requires token)
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is copyright law?"}'
```

## 🚀 Extending the Backend

### Add a New Endpoint
1. Create `app/api/your-feature/route.js`
2. Export `POST`, `GET`, etc. functions
3. Handle request, validate, process, return response
4. Test with curl or DevTools
5. Add rate limiting if needed
6. Log errors for debugging

### Example
```javascript
// app/api/your-feature/route.js
export async function POST(request) {
  try {
    const { data } = await request.json();
    
    // Validate
    if (!data) {
      return Response.json({ error: 'Data required' }, { status: 400 });
    }
    
    // Process
    const result = await processData(data);
    
    // Return
    return Response.json({ success: true, result });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
```

## 📚 Learning Path

**Beginner (New to backend):**
1. Chapter 1: Understanding the basics
2. Chapter 2: Node.js fundamentals
3. Chapter 3: API routes
4. Chapter 4: Authentication
5. Chapter 18: See it all together

**Intermediate (Building features):**
1. Chapter 8: Error handling
2. Chapter 10: REST principles
3. Chapter 11: Request/response handling
4. Chapter 13: Testing & debugging

**Advanced (Production-ready):**
1. Chapter 14: Rate limiting
2. Chapter 15: Database design
3. Chapter 16: AI integration
4. Chapter 17: External APIs

## ⚠️ Important Security Rules

- ✅ **Always hash passwords** with bcryptjs
- ✅ **Always validate input** before processing
- ✅ **Always check authentication** on protected routes
- ✅ **Always check authorization** (user can only access their data)
- ✅ **Never store secrets in code** - use environment variables
- ✅ **Never log passwords** - only hash them
- ✅ **Always use HTTPS** in production
- ✅ **Always set token expiration** - sessions should timeout

## 🐛 Debugging Tips

### Check Server Console
```bash
# Run dev server
npm run dev

# Look for console.log output and errors
# Check logs for request processing
```

### Use DevTools Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Make a request
4. Click the request
5. See status, headers, body

### Use curl
```bash
# Test endpoints from command line
curl -v http://localhost:3000/api/test
# -v shows request/response details
```

## 📞 Support

- **Questions?** Re-read the relevant chapter
- **Stuck?** Check Chapter 13: API Testing & Debugging
- **Error message?** Search the chapter for that error code
- **Want to extend?** Follow "Extending the Backend" section

## 🎓 Next Steps

After completing all 18 chapters:

1. **Build Something:** Create a new API endpoint
2. **Test It:** Use curl and DevTools
3. **Secure It:** Add validation and rate limiting
4. **Deploy It:** Push to production
5. **Monitor It:** Check logs and errors
6. **Iterate:** Add features, fix bugs, improve

## 📄 File Locations

- **Frontend Docs:** `/public/docs/frontend/index-modular.html`
- **Backend Docs:** `/public/docs/backend/index-modular.html`
- **Documentation Hub:** `/public/docs/hub.html`
- **Chapter Files:** `/public/docs/backend/chapters/*.html`
- **Loader Script:** `/public/docs/backend/app-modular.js`

---

**Happy backend development! 🚀**
