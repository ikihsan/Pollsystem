  **Real-Time Polling System**

A full-stack polling app with NestJS + Prisma + PostgreSQL on the backend and React (Vite) on the frontend. It supports real-time voting via WebSockets and provides authentication, role-based access, and poll management.Implemented filelogger aswell.
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
DATABASE_URL="database_url"
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN=”expirytime”
PORT=yourportNo

create .env for frontend:
VITE_API_URL="yourapiurl"


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

Method    Endpoint	        Description

POST	    /auth/register	  Register new user
POST	    /auth/login	      Login with email + password
 
 Polls

Method    	Endpoint	            Description

GET	        /poll                 Get all polls for current user
GET	        /poll/:id             Get a specific poll
GET	        /poll/results/:id	    Get result of a poll
POST	      /poll/create    	    Create a new poll (admin only)
POST        /poll/allow/:id       Allow a user to a private poll(admin)
PATCH       /poll/:id              Update poll (admin only)
PATCH       /poll/delete/:id      Soft delete a poll(admin)

 Voting

Method	     Endpoint	            Description

POST	       /vote/:id	          Cast a vote
		

User previleges

:login
:see public polls aswell as allowed private polls
:vote a poll
:view results

Admin previleges

:Create poll {public ,private}
:edit poll
:delete poll
:allow users to a pool (via their email)
:vote 
:view results