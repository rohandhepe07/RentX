# RentX — local rental marketplace (frontend)

RentX is a neighbourhood rental marketplace where people list items they rarely
use and neighbours rent them by the day. This is the frontend prototype, built
with plain HTML, CSS and JavaScript (no frameworks, no build step), designed to
connect to a Java backend (Spring Boot + MySQL/PostgreSQL) later without a rewrite.

## Running it

No server or build tools needed. Open `index.html` in a browser, or serve the
folder with any static file server, e.g.:

```
npx serve .
# or
python3 -m http.server 8000
```

## Demo accounts

Data is seeded automatically into `localStorage` on first load.

| Role   | Email               | Password    |
|--------|---------------------|-------------|
| Renter | sana@rentx.app      | renter123   |
| Renter | karan@rentx.app     | renter123   |
| Owner  | priya@rentx.app     | owner123    |
| Owner  | rohan@rentx.app     | owner123    |
| Admin  | admin@rentx.app     | admin123    |

You can also sign up as a new owner or renter from `signup.html`.

## Structure

```
RentX/
├── index.html              Landing page + browse/search
├── listing.html             Single listing + booking request
├── login.html / signup.html Auth (role tabs: renter / owner / admin)
├── renter-dashboard.html    Renter: my bookings, profile
├── owner-dashboard.html     Owner: my listings (CRUD), booking requests
├── admin-dashboard.html     Admin: users, listings, bookings overview
├── css/style.css            Single shared stylesheet (design tokens at top)
└── js/
    ├── data.js       Mock data layer — see below
    ├── icons.js       Inline SVG category icons (stand-in for photos)
    ├── main.js        Shared nav rendering, toast, small helpers
    ├── auth.js        Login/signup form logic
    ├── browse.js      Landing page search + grid
    ├── listing.js     Listing detail + booking modal
    ├── renter.js      Renter dashboard
    ├── owner.js       Owner dashboard
    └── admin.js       Admin dashboard
```

## How this plugs into the Java backend

`js/data.js` is deliberately written as a set of named functions
(`getListings()`, `createBooking()`, `login()`, ...) that return finished
data, the same shape a page would want from a REST call. Right now they read
and write `localStorage`. When the Spring Boot API is ready, each function's
body becomes a `fetch()` call instead — nothing in the HTML or the other JS
files needs to change:

```js
// today
function getListings(filters) {
  return readTable(DB_KEYS.listings).filter(...);
}

// later
async function getListings(filters) {
  const res = await fetch('/api/listings?' + new URLSearchParams(filters));
  return res.json();
}
```

Suggested backend shape, for when that's built:

- **Spring Boot** REST controllers: `/api/auth`, `/api/users`, `/api/listings`,
  `/api/bookings`
- **MySQL/PostgreSQL** tables matching the objects in `data.js`: `users`,
  `listings`, `bookings`
- **Spring Security** for real authentication (replacing the plaintext mock
  login here) and role-based access (`RENTER`, `OWNER`, `ADMIN`)
- File storage (S3 or local disk) for real listing photos, replacing the
  category icon placeholders in `icons.js`

## Notes on scope

This is a prototype: passwords are stored in plain text in `localStorage`,
there's no real session security, and every "user" shares one browser's
storage. It's built to demonstrate the full flow — listing, browsing,
requesting, approving, and administering — and to give the backend team a
clear contract to build against.
