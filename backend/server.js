const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // We will create this file next

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());

// Route files
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const userRoutes = require('./routes/user');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
