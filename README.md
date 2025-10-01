  Real-Time Polling System
A full-stack polling app with NestJS + Prisma + PostgreSQL on the backend and React (Vite) on the frontend. It supports real-time voting via WebSockets and provides authentication, role-based access, and poll management.
________________________________________
 Tech Stack
•	Backend: NestJS, Prisma ORM, PostgreSQL
•	Frontend: React (Vite)
•	Real-time: Socket.IO
•	Auth: JWT + Role-based access
________________________________________
Application Workflow
The system is a full-stack real-time application where users register and login to receive JWT tokens that authenticate all their requests. 
Once logged in, users can view available polls on their dashboard, vote on active polls by selecting options, and see results update instantly through WebSocket connections. 
Administrators have additional privileges to create new polls with custom options and durations, manage poll access for private polls, and edit or delete existing polls through a dedicated admin panel. 
The backend validates all operations including vote uniqueness, poll expiry times, and user permissions before processing requests. 
Real-time updates are broadcast to all connected users whenever someone votes or creates a poll, ensuring everyone sees live results without refreshing.
 The system maintains security through role-based access control and prevents duplicate voting through database constraints, while Prisma ORM handles all database operations with PostgreSQL.

Setup
1. Install Dependencies
Clone repo
git clone <repo-url>
cd myapp

Backend deps
npm install

Frontend deps
cd frontend
npm install
cd ..
2. Configure Environment
Create .env in root:
DATABASE_URL="postgresql://user:password@localhost:5432/polling_db"
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN=”expirytime”
PORT=3000


3. Setup Database
npx prisma generate
npx prisma db push
npx prisma db seed   # optional
4. Run the App
Backend:
npm run start:dev
# runs at http://localhost:3000
Frontend:
cd frontend
npm run dev
runs at http://localhost:3001
Open http://localhost:3001
________________________________________
 API Endpoints
 Auth
Method	Endpoint	Description
POST	/auth/register	Register new user
POST	/auth/login	Login with email + password
 Polls
Method	Endpoint	Description
GET	/poll	Get all polls for current user
POST	/poll/create	Create a new poll (admin only)
GET	/poll/:id	Get specific poll details
PATCH
GET	/poll/:id
/poll/results/:pollId	Update poll (admin only)
Get poll results
 Voting
Method	Endpoint	Description
POST	/vote/:pollId	Cast a vote
		
________________________________________
 Project Structure
myapp/
├── src/                      Backend (NestJS)
│   ├── auth/               Authentication & JWT
│   ├── poll/                 Poll CRUD
│   ├── vote/                Voting logic
│   ├── user/                User management
│   └── gateway/           WebSockets for real-time
├── frontend/              React frontend
│   ├── components/      UI components
│   ├── pages/              App pages
│   ├── services/          API + WebSocket calls
│   └── contexts/           Global state
├── prisma/                 Database schema + migrations

