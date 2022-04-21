const express = require('express');
const cors = require('cors');
const app = express();

const routes = require('./routes/api');
const authRoutes = require('./routes/auth-routes');
const connection = require('./db');




connection.query('CREATE TABLE IF NOT EXISTS user(uid varchar(50) PRIMARY KEY,user_name varchar(100) NOT NULL, user_email varchar(50) NOT NULL, user_photo_url varchar(800),user_created_on timestamp NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })


connection.query('CREATE TABLE IF NOT EXISTS club(cid varchar(50) PRIMARY KEY,club_name varchar(100) NOT NULL, club_logo_url varchar(800),club_created_on timestamp NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS project(pid varchar(50) PRIMARY KEY,prj_name varchar(100) NOT NULL, prj_logo_url varchar(800),prj_deadline timestamp, prj_is_event char(1) NOT NULL,prj_created_on timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS milestone(mlid varchar(50) PRIMARY KEY,ml_content varchar(100) NOT NULL,ml_deadline timestamp NULL,ml_created_on timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, ml_finished_on timestamp NULL DEFAULT NULL);'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS messages(msid varchar(50) PRIMARY KEY,msg_title varchar(500),msg_content varchar(5000) NOT NULL,msg_img_url varchar(800),msg_created_on timestamp NOT NULL, msg_deleted_on timestamp NULL DEFAULT NULL, msg_posted_by varchar(50));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })


connection.query('CREATE TABLE IF NOT EXISTS user_clubs(uid varchar(50),cid varchar(50) ,role int NOT NULL,FOREIGN KEY (uid) references user(uid),FOREIGN KEY (cid) references club(cid), PRIMARY KEY(uid,cid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS user_projects(uid varchar(50),pid varchar(50),joined_on timestamp NOT NULL, role int NOT NULL, FOREIGN KEY (uid) references user(uid), FOREIGN KEY (pid) references project(pid), PRIMARY KEY(uid,pid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })
connection.query('CREATE TABLE IF NOT EXISTS club_projects(cid varchar(50),pid varchar(50),clprj_created_on timestamp NOT NULL, FOREIGN KEY (cid) references club(cid), FOREIGN KEY (pid) references project(pid), PRIMARY KEY(cid,pid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS announcements(cid varchar(50),msid varchar(50),posted_by varchar(50), FOREIGN KEY (cid) references club(cid), FOREIGN KEY (msid) references messages(msid), FOREIGN KEY (posted_by) references user(uid), PRIMARY KEY(cid,msid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS project_messages(pid varchar(50),msid varchar(50),posted_by varchar(50), FOREIGN KEY (pid) references project(pid), FOREIGN KEY (msid) references messages(msid), FOREIGN KEY (posted_by) references user(uid),PRIMARY KEY(pid,msid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS project_milestones(pid varchar(50),mlid varchar(50), FOREIGN KEY (pid) references project(pid), FOREIGN KEY (mlid) references milestone(mlid), PRIMARY KEY(pid,mlid));'

    , (err, rows, fields) => {
        if (err) throw err

        //console.log('Table created ', rows)
    })

connection.query('CREATE TABLE IF NOT EXISTS user_milestones(uid varchar(50),mlid varchar(50), assigned_on timestamp NOT NULL,FOREIGN KEY (uid) references user(uid), FOREIGN KEY (mlid) references milestone(mlid), PRIMARY KEY(uid,mlid));'

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
