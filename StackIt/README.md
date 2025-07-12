# StackIt - Question & Answer Platform

StackIt is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Question Management**: Ask, edit, and delete questions with tags
- **Answer System**: Post answers, edit them, and accept the best answer
- **Voting System**: Upvote and downvote questions and answers
- **Search & Filter**: Search questions and filter by tags or status
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Dynamic voting and interaction

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templating engine, Bootstrap 5
- **Authentication**: Session-based with bcryptjs
- **Styling**: Custom CSS with Bootstrap components

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone or download the project**
   ```bash
   cd web/StackIt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Make sure MongoDB is running on your system
   - The application will automatically connect to `mongodb://localhost:27017/stackit`

4. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser and go to `http://localhost:3000`

## Project Structure

```
StackIt/
├── app.js                 # Main application file
├── models/               # Database models
│   ├── User.js          # User model with authentication
│   ├── Question.js      # Question model with voting
│   └── Answer.js        # Answer model with voting
├── routes/              # Route handlers
│   ├── users.js         # User authentication routes
│   ├── questions.js     # Question CRUD routes
│   └── answers.js       # Answer CRUD routes
├── views/               # EJS templates
│   ├── layout.ejs       # Main layout template
│   ├── questions/       # Question-related views
│   ├── users/           # User-related views
│   ├── answers/         # Answer-related views
│   └── partials/        # Reusable template parts
├── public/              # Static assets
│   ├── css/            # Custom stylesheets
│   └── js/             # Client-side JavaScript
└── package.json         # Project dependencies
```

## Usage

### For Users

1. **Register/Login**: Create an account or log in to access all features
2. **Ask Questions**: Click "Ask Question" to post a new question with tags
3. **Answer Questions**: Browse questions and provide helpful answers
4. **Vote**: Upvote or downvote questions and answers to help the community
5. **Accept Answers**: Question authors can accept the best answer
6. **Search**: Use the search bar to find specific questions or topics

### For Developers

The application follows MVC architecture:

- **Models**: Define data structure and business logic
- **Views**: EJS templates for rendering pages
- **Routes**: Handle HTTP requests and responses

## API Endpoints

### Questions
- `GET /questions` - List all questions
- `GET /questions/new` - Show new question form
- `POST /questions` - Create new question
- `GET /questions/:id` - Show specific question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question
- `POST /questions/:id/vote` - Vote on question

### Answers
- `POST /answers` - Create new answer
- `PUT /answers/:id` - Update answer
- `DELETE /answers/:id` - Delete answer
- `POST /answers/:id/vote` - Vote on answer

### Users
- `GET /users/register` - Show registration form
- `POST /users/register` - Register new user
- `GET /users/login` - Show login form
- `POST /users/login` - Authenticate user
- `GET /users/logout` - Logout user
- `GET /users/profile/:id` - Show user profile
- `PUT /users/profile/:id` - Update user profile

## Customization

### Styling
- Modify `public/css/style.css` to customize the appearance
- The application uses Bootstrap 5 for responsive design

### Database
- Update the MongoDB connection string in `app.js` if needed
- Add new fields to models in the `models/` directory

### Features
- Add new routes in the `routes/` directory
- Create new views in the `views/` directory
- Extend functionality in `public/js/script.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Ensure MongoDB is running
3. Verify all dependencies are installed
4. Check that the port 3000 is available

## Future Enhancements

- Email notifications
- User reputation system
- Question categories
- Rich text editor
- File uploads
- API documentation
- Unit tests
- Docker support 