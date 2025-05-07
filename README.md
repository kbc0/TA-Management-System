# TA Management System

A web application for managing teaching assistants, courses, and assignments.

## Project Structure

- `frontend/`: React frontend application
- `backend/`: Node.js/Express backend API

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- MySQL (v8.x or higher)

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/ta-management-system.git
cd ta-management-system
```

### Database Setup

1. Install MySQL if you haven't already (https://dev.mysql.com/downloads/)

2. Log in to MySQL and create the database:
   ```sql
   CREATE DATABASE ta_management_system;
   ```

3. Create a MySQL user for the application (or use an existing one):
   ```sql
   CREATE USER 'ta_user'@'localhost' IDENTIFIED BY '123456789';
   GRANT ALL PRIVILEGES ON ta_management_system.* TO 'ta_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
   
   Note: The backend is configured to use these default credentials:
   - Username: root
   - Password: 123456789
   - Database: ta_management_system
   
   If you prefer to use different credentials, update them in the backend/.env file.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The backend uses a shared .env file with the following configuration:
   ```
   PORT=5001
   NODE_ENV=development
   JWT_SECRET=taManagementSystemSecret2023
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=123456789
   DB_NAME=ta_management_system
   MAIL_HOST=smtp.bilkent.edu.tr
   MAIL_PORT=587
   MAIL_USER=noreply@bilkent.edu.tr
   MAIL_PASS=email_password
   ```

   Note: For email functionality, you may need to update the MAIL_* settings with your institution's SMTP details.

4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on http://localhost:5001 by default.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will run on http://localhost:3000 by default.

## Development

- Backend API endpoints are available at http://localhost:5001/api
- Frontend development server runs at http://localhost:3000

## Contributing

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Add your commit message"
   ```

3. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request on GitHub.

## Troubleshooting

- If you encounter database connection issues:
  - Ensure your MySQL server is running
  - Verify you've created the database named `ta_management_system`
  - Check that the MySQL user has proper permissions
  - Make sure the credentials match those in the backend/.env file

- For any npm errors, try deleting the `node_modules` folder and running `npm install` again. 