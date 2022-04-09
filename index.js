const express = require('express');
const cors = require('cors');
const app = express();


const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass1234',
    database: 'medicine'
})

connection.connect()
connection.query('CREATE DATABASE IF NOT EXISTS clumos;', (err, rows, fields) => {
    if (err) throw err

    console.log('Database created ', rows)
})

connection.query('CREATE TABLE IF NOT EXISTS user(uid varchar(50) PRIMARY KEY,name varchar(100) NOT NULL, email varchar(50) NOT NULL, photo_url varchar(800),created_on datetime NOT NULL);'

, (err, rows, fields) => {
    if (err) throw err

    console.log('Table created ', rows)
})


connection.query('CREATE TABLE IF NOT EXISTS club(cid varchar(50) PRIMARY KEY,name varchar(100) NOT NULL, logo_url varchar(800),created_on datetime NOT NULL);'

, (err, rows, fields) => {
    if (err) throw err

    console.log('Table created ', rows)
})

connection.query('CREATE TABLE IF NOT EXISTS project(pid varchar(50) PRIMARY KEY,name varchar(100) NOT NULL, logo_url varchar(800),deadline datetime, is_event char(1) NOT NULL,created_on datetime NOT NULL);'

, (err, rows, fields) => {
    if (err) throw err

    console.log('Table created ', rows)
})

connection.query('CREATE TABLE IF NOT EXISTS milestone(mlid varchar(50) PRIMARY KEY,content varchar(100) NOT NULL,deadline datetime NOT NULL,created_on datetime NOT NULL, finished_on datetime NOT NULL);'

, (err, rows, fields) => {
    if (err) throw err

    console.log('Table created ', rows)
})

connection.query('CREATE TABLE IF NOT EXISTS messages(msid varchar(50) PRIMARY KEY,title varchar(500),content varchar(5000) NOT NULL, deadline datetime NOT NULL,created_on datetime NOT NULL, finished_on datetime NOT NULL);'

, (err, rows, fields) => {
    if (err) throw err

    console.log('Table created ', rows)
})






app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello World!');
}
);


app.listen(process.env.PORT || 5000, () => {

    console.log('Example app listening on port 5000!');
  

}
);
