<<<<<<< HEAD
# Note-of-Jpy
to track my daily joyful/exciting things
=======
# 🎉 Excitement Calendar

A beautiful calendar application that helps you track exciting moments from your day and future expectations. Built with Node.js, MongoDB, and vanilla JavaScript.

## Features

- 📅 **Interactive Calendar**: Navigate through months and select dates
- 🌟 **Exciting Today**: Record exciting things that happened on any given day
- 🚀 **Future Expectations**: Add things you're excited about for future dates
- 🔒 **Smart Restrictions**: Past dates are view-only, current and future dates are editable
- 💾 **Persistent Data**: All data is stored in MongoDB
- 📱 **Responsive Design**: Works great on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. **Clone or download the project**
   ```bash
   cd exc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - **Local MongoDB**: Make sure MongoDB is running on your system
   - **MongoDB Atlas**: Update the `MONGODB_URI` in the `.env` file with your connection string

4. **Configure environment variables**
   - The `.env` file is already created with default values
   - Update `MONGODB_URI` if you're using a different MongoDB setup

## Running the Application

1. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. **Open your browser**
   - Go to `http://localhost:3000`

## Usage

1. **Navigate the Calendar**
   - Use the arrow buttons to navigate between months
   - Click on any date to select it

2. **Add Events**
   - For today and future dates: Add exciting moments and future expectations
   - For past dates: View-only mode (you can see what was recorded but cannot add new items)

3. **Manage Events**
   - Each event shows the time it was added
   - Delete events using the delete button (not available for past dates)

## API Endpoints

- `GET /api/events/:date` - Get events for a specific date
- `POST /api/events/:date/exciting-today` - Add an exciting today event
- `POST /api/events/:date/future-expectations` - Add a future expectation
- `DELETE /api/events/:date/exciting-today/:itemId` - Delete an exciting today event
- `DELETE /api/events/:date/future-expectations/:itemId` - Delete a future expectation

## Project Structure

```
exc/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styles
│   └── script.js       # Frontend JavaScript
├── server.js           # Express server and API
├── package.json        # Dependencies
├── .env               # Environment variables
└── README.md          # This file
```

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: MongoDB
- **Styling**: Modern CSS with gradients and animations

## Features in Detail

### Calendar Interface
- Beautiful gradient background
- Hover effects and smooth transitions
- Visual indicators for dates with events
- Different styling for past, present, and future dates

### Event Management
- Real-time adding and deleting of events
- Timestamp tracking for each event
- Smart UI that adapts based on selected date

### Data Persistence
- MongoDB integration for reliable data storage
- Automatic database connection handling
- Error handling for network issues

## Contributing

Feel free to submit issues and pull requests to improve the application!

## License

This project is open source and available under the [MIT License](LICENSE).
>>>>>>> ab9e057 (Initial commit: Complete Excitement Calendar with authentication system)
