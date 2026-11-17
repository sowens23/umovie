# UMovie

A full-stack movie streaming and management platform with role-based access for viewers, content editors, and marketing managers. Built with Node.js, Express, and MongoDB as the final project for CS 372 (Software Construction) at the University of Alaska Fairbanks, Spring 2025.

**[Watch the demo video](https://youtu.be/rvPUPhgZjw8)**

## Team

- **Spencer Owens:** backend development and database management (Express server, REST API, authentication and authorization, MongoDB data layer)
- **Ivy Swenson:** frontend development, UI/UX design, and API integration

## Features

| Role | What they can do |
| --- | --- |
| **Viewer** | Browse and search the catalog, watch movies, like, dislike, and favorite titles, view watch history, and send feedback |
| **Content Editor** | Add, edit, and delete movies, and bulk-import the catalog from JSON |
| **Marketing Manager** | View play counts, reactions, and viewer feedback, and leave notes for content editors |
| **Power User** | Both editor and manager roles |

## Architecture

```
Browser (HTML/CSS/JS)  --REST/JSON-->  Express server  -->  MongoDB
                                        - sessions (express-session)
                                        - auth + role middleware
                                        - authController.js (API handlers)
```

- **REST API:** about 25 JSON endpoints for accounts, reactions, watch history, movie management, and analytics
- **Authentication:** passwords are stored as salted **scrypt** hashes, with server-side sessions and strong-password validation at registration
- **Authorization:** middleware enforces login and role checks on the server, so editor and manager APIs reject unauthorized requests (`401`/`403`) even if called directly
- **Identity from the session:** account endpoints act as the logged-in user rather than trusting an email sent by the browser
- **Static file safety:** only front-end folders are served; server code is never downloadable

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or later
- [MongoDB](https://www.mongodb.com/try/download/community) running locally

### Setup

```
git clone https://github.com/sowens23/umovie.git
cd umovie
npm install
cp .env.example .env     # then set SESSION_SECRET to a long random string
npm start
```

Open **http://localhost:3000**.

### Load the Movie Catalog
1. Register an account with the **Content Editor** role.
2. Open the Content Editor page and click **Import MovieList.json** (with an empty `movies` collection).

### Try Each Role
Roles are chosen at registration so every view can be demoed. Create a Viewer, a Content Editor, a Marketing Manager, and a Power User (both roles) to see each set of pages.

| Account | Pages |
| --- | --- |
| Not logged in | Login and registration |
| Viewer | Home, Account, Video Player |
| Content Editor | Content Editor, plus viewer pages |
| Marketing Manager | Marketing Manager, plus viewer pages |
| Power User | All pages |

## Project Structure

```
umovie/
├── server.js              # Express app: middleware, routes, authorization
├── Javascript/
│   ├── authController.js  # API handlers (server-side)
│   ├── db.js              # MongoDB connection (server-side)
│   └── script_*.js        # Page scripts (browser)
├── html/                  # Pages: login, home, account, editor, manager, player
├── Styling/               # CSS
├── Assets/                # Posters, banners, sample video, MovieList.json
├── docs/
│   └── Development_Document.pdf
├── .env.example
└── package.json
```

## Future Improvements

- Replace self-selected roles with admin-assigned roles
- Move the hardcoded `http://localhost:3000` API URLs to relative paths
- Add automated API tests and CSRF protection
- Separate server code from browser scripts into `server/` and `public/` folders

## Acknowledgements

- Testers Grace, Jonathan, and Daniel, for finding and reporting issues
- GitHub Copilot, which assisted with general project structure and debugging

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).
