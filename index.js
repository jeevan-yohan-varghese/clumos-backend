const express = require('express');
const cors = require('cors');
const app = express();

const routes = require('./routes/api');
const authRoutes = require('./routes/auth-routes');
const connection = require('./db');




connection.query('CREATE TABLE IF NOT EXISTS user(uid varchar(50) PRIMARY KEY,name varchar(100) NOT NULL, email varchar(50) NOT NULL, photo_url varchar(800),created_on datetime NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })


connection.query('CREATE TABLE IF NOT EXISTS club(cid varchar(50) PRIMARY KEY,name varchar(100) NOT NULL, logo_url varchar(800),created_on datetime NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS project(pid varchar(50) PRIMARY KEY,name varchar(100) NOT NULL, logo_url varchar(800),deadline datetime, is_event char(1) NOT NULL,created_on datetime NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS milestone(mlid varchar(50) PRIMARY KEY,content varchar(100) NOT NULL,deadline datetime NOT NULL,created_on datetime NOT NULL, finished_on datetime NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS messages(msid varchar(50) PRIMARY KEY,title varchar(500),content varchar(5000) NOT NULL,img_url varchar(800), deadline datetime NOT NULL,created_on datetime NOT NULL, deleted_on datetime NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })


connection.query('CREATE TABLE IF NOT EXISTS user_clubs(uid varchar(50),cid varchar(50) ,role int NOT NULL,FOREIGN KEY (uid) references user(uid),FOREIGN KEY (cid) references club(cid), PRIMARY KEY(uid,cid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS user_projects(uid varchar(50),pid varchar(50),joined_on datetime NOT NULL, role int NOT NULL, FOREIGN KEY (uid) references user(uid), FOREIGN KEY (pid) references project(pid), PRIMARY KEY(uid,pid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })
connection.query('CREATE TABLE IF NOT EXISTS club_projects(cid varchar(50),pid varchar(50),created_on datetime NOT NULL, FOREIGN KEY (cid) references club(cid), FOREIGN KEY (pid) references project(pid), PRIMARY KEY(cid,pid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS announcements(cid varchar(50),msid varchar(50), FOREIGN KEY (cid) references club(cid), FOREIGN KEY (msid) references messages(msid), PRIMARY KEY(cid,msid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS project_messages(pid varchar(50),msid varchar(50), FOREIGN KEY (pid) references project(pid), FOREIGN KEY (msid) references messages(msid), PRIMARY KEY(pid,msid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS project_milestones(pid varchar(50),mlid varchar(50), FOREIGN KEY (pid) references project(pid), FOREIGN KEY (mlid) references milestone(mlid), PRIMARY KEY(pid,mlid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS user_milestones(uid varchar(50),mlid varchar(50), assigned_on datetime NOT NULL,FOREIGN KEY (uid) references user(uid), FOREIGN KEY (mlid) references milestone(mlid), PRIMARY KEY(uid,mlid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })





app.use(express.json());
app.use(cors());

app.use('/api', routes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
    res.status(422).send({ error: err.message });
})




app.listen(process.env.PORT || 5080, () => {

    console.log('Clumos app listening on port 5080!');


}
);
