// const mysql = require('mysql2');

// const connection = mysql.createConnection({
//   host: 'your-rds-endpoint',
//   user: 'your-rds-username',
//   password: 'your-rds-password',
//   database: 'your-rds-database-name',
// });

// module.exports = connection;

// const mysql = require('mysql2');

// const connection = mysql.createConnection({
//   host: 'database-1.cyegjjwzxw9u.us-east-1.rds.amazonaws.com',
//   user: 'admin',
//   password: 'Sakya123',
//   database: 'awsproject',
//   port: '3306',
//   // Remove the connectionLimit and waitForConnections options
// });

// module.exports = connection.promise();

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'database-1.cyegjjwzxw9u.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Sakya123',
  database: 'awsproject',
  port: '3306',
  // Remove the connectionLimit and waitForConnections options
});

module.exports = connection;

// Connect to the database
// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL database:', err);
//     return;
//   }
//   console.log('Connected to MySQL database');
// });

// Check the connection state
// if (connection.state === 'authenticated') {
//   console.log('Database connection is active');
// } else {
//   console.log('Database connection is not active');
// }


// connection.connect ((err) =>
// {
// if (err) {
// console.log(err.message);
// return;
// }
// console.log("Database connected.");
// });