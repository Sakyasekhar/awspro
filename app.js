const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/auth'); // Import the auth router
const Routes = require('./routes/api');
const proRouter = require('./routes/projects');
const session = require('express-session');

const cookieParser = require("cookie-parser");
const saltRounds = 10;

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);
app.use(express.static('public'));
// Connect to MySQL database
const connection = require('./config/database');

// Define routes for user registration, login, and other functionalities
app.use('/api/auth', authRouter);
app.use('/api', proRouter);
app.use('/', Routes);

// // Start the Express server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log('Server started on port', port);
});
