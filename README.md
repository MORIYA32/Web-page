# Netflix App

## Description
This is a Netflix-based streaming application that allows users to watch content

## Installation

Use git and npm to install the app

```bash
git clone https://github.com/MORIYA32/Web-page.git
```
```bash
  cd Web-page
```

add the .env file to the project.

## The .env file should include variables such as:
MONGODB_URI=...
JWT_SECRET=...
PORT=3000

```bash
 npm install
```

## Running

```bash
npm start
```
## Open your browser and navigate to
 http://localhost:3000


## Project Structure

- **config** – Connect the database with the app  
- **controllers** – Responsible for handling the logic behind the application's routes  
- **middleware** – Response on the authentication  
- **models** – Containes the data schemas for the app. Each model define the structure for the data it represents.  
- **node_modules** – Conatines the project dependencies  
- **routes** – Exposes the API endpoints of the application  
- **views** – Contains HTML, CSS and JavaScript files  
  - **views/videos** – Keeps video content for streaming  
- **server.js** – The main entry point of the application
- **.env** - Contains the environment variavles required for running the application

## Main Features

1. **Content Viewing with Progress Tracking** – Users can watch content and resume from their last watched point.   
2. **Search and Sort** – Provides functionality to search and sort content efficiently.  
3. **Personalized Content** – Delivers content recommendations based on user preferences.  
4. **Profile Management** – Enables users to create, edit, and manage their profiles.  
5. **Admin Content Management** – Allows administrators to add and manage platform content.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- HTML
- CSS
- JavaScript