var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'pass1234',
   
});

connection.connect()

connection.query('CREATE DATABASE IF NOT EXISTS clumos;', (err, rows, fields) => {
    if (err) throw err

    //console.log('Database created ', rows)
})

connection.changeUser({database : 'clumos'}, function(err) {
    if (err) throw err;
  });

module.exports = connection;