const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const session = require('express-session');
// const passport = require('passport');
const AuthRoutes = require('./Routes/AuthRoutes');
const bodyParser = require('body-parser');

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use('/storage', express.static('storage'));

// Routes
app.use('/', AuthRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Server initialization
const PORT = process.env.PORT || 8005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));