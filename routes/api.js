
const router = require('express').Router();
const verifyApiKey = require('../middlewares/verify-apikey');
const verifyUserAuth = require('../middlewares/verify-user-auth');
const connection = require('../db');
const uuid = require('uuid');

router.post('/newClub', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.name) {
        return res.status(400).json({ success: false, msg: "Club Name is required" });

    }


    const createdDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const clubID = uuid.v4();
    var logoUrl = "";
    if (req.body.logoUrl) {
        logoUrl = req.body.logoUrl;
    }

    connection.query("INSERT INTO club VALUES("
        + "'" + clubID + "',"
        + "'" + req.body.name + "',"
        + "'" + logoUrl + "',"
        + "'" + createdDate + "');", (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }
            connection.query("INSERT INTO user_clubs VALUES("
                + "'" + req.currentUser._uid + "',"
                + "'" + clubID + "',"
                + 1 //Admin-1 Member-0
                + ");", (err, row, fields) => {
                    if (err) {
                        return res.status(500).send({ error: true, msg: err })
                    }

                    return res.status(200).json({
                        success: true,
                        club: {
                            club_id: clubID,
                            club_name: req.body.name,
                            user_role: 1,
                            logo_url: logoUrl,

                        }
                    })
                })

        });






});

router.get('/getClubs', verifyApiKey, verifyUserAuth, (req, res, next) => {


    const userId = req.currentUser._uid;


    connection.query("SELECT * from user INNER JOIN user_clubs ON user.uid=user_clubs.uid INNER JOIN club ON club.cid=user_clubs.cid where user.uid='" + userId + "';", (err, row, fields) => {
        if (err) {
            return res.status(500).send({ error: true, msg: err })
        }

        var clubsList = [];

        for (var i = 0; i < row.length; i++) {
            var club = {};
            club['club_id'] = row[i].cid;
            club['club_name'] = row[i].club_name;
            club['role'] = row[i].role;
            club['logo_url'] = row[i].logo_url;
            clubsList.push(club);
        }
        return res.status(200).json({
            success: true,
            clubs: clubsList
        })
    });






});


router.post('/getAnnouncements', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.clubId) {
        return res.status(400).send({ error: true, msg: "Club id is required" });

    }



    connection.query("SELECT * from messages m INNER JOIN announcements a ON m.msid=a.msid where a.cid='" + req.body.clubId + "';", (err, row, fields) => {
        if (err) {
            return res.status(500).send({ error: true, msg: err })
        }

        // console.log(row);
        var msgList = [];

        for (var i = 0; i < row.length; i++) {
            var msg = {};
            msg['msg_Id'] = row[i].msid;
            msg['title'] = row[i].title;
            msg['content'] = row[i].content;
            msg['img_url'] = row[i].img_url;
            msgList.push(msg);
        }
        return res.status(200).json({
            success: true,
            announcements: msgList
        })
    });






});


router.post('/newAnnouncement', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.title || !req.body.content || !req.body.clubId) {
        return res.status(400).send({ error: true, msg: "Some parameters are missing" });

    }
    const userId = req.currentUser._uid;
    connection.query("SELECT * from user_clubs where uid="
        + "'" + userId + "' AND cid='"
        + req.body.clubId + "';", (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }

            if (row[0].role != 1) {
                return res.status(403).send({ error: true, msg: "User not authorised to make announcement" });
            } else {
                const msgId = uuid.v4();
                var imgUrl = "";
                if (req.body.imgUrl) {
                    imgUrl = req.body.imgUrl;
                }
                var createdDate = new Date().toISOString();
                connection.query("INSERT INTO messages VALUES("
                    + "'" + msgId + "',"
                    + "'" + req.body.title + "',"
                    + "'" + req.body.content + "',"
                    + "'" + imgUrl + "',"
                    + "'" + createdDate + "',"
                    + null

                    + ");", (err, row, fields) => {
                        if (err) {
                            return res.status(500).send({ error: true, msg: err })
                        }

                        connection.query("INSERT INTO announcements VALUES ("
                            + "'" + req.body.clubId + "',"
                            + "'" + msgId + "'"
                            + ");", (err, row, fields) => {

                                if (err) {
                                    return res.status(500).send({ error: true, msg: err })
                                }
                                return res.status(200).json({
                                    success: true,
                                    msg: "Announcement added",
                                    msg_id: msgId
                                })
                            })


                    });
            }


        });




});

router.post('/newProject', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.name || !req.body.clubId || !req.body.deadline || !req.body.isEvent) {
        return res.status(400).send({ error: true, msg: "Some parameters are missing" });

    }

    if (req.body.isEvent != 'Y' && req.body.isEvent != 'N') {
        return res.status(400).send({ error: true, msg: "Invalid value for isEvent" });
    }
    const userId = req.currentUser._uid;
    connection.query("SELECT * from user_clubs where uid="
        + "'" + userId + "' AND cid='"
        + req.body.clubId + "';", (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }

            if (row[0].role != 1) {
                return res.status(403).send({ error: true, msg: "User not authorised to create project" });
            } else {
                const prjId = uuid.v4();
                var imgUrl = "";
                if (req.body.logoUrl) {
                    imgUrl = req.body.logoUrl;
                }
                var createdDate = new Date().toISOString();
                connection.query("INSERT INTO project VALUES("
                    + "'" + prjId + "',"
                    + "'" + req.body.name + "',"
                    + "'" + imgUrl + "',"
                    + "'" + req.body.deadline + "',"
                    + "'" + req.body.isEvent + "',"
                    + "'" + createdDate
                    + "');", (err, row, fields) => {
                        if (err) {
                            return res.status(500).send({ error: true, msg: err })
                        }

                        connection.query("INSERT INTO user_projects VALUES ("
                            + "'" + userId + "',"
                            + "'" + prjId + "',"
                            + "'" + createdDate + "',"
                            + 1
                            + ");", (err, row, fields) => {

                                console.log("User Projects inserte query ");
                                console.log(row);
                                if (err) {
                                    return res.status(500).send({ error: true, msg: err })
                                }
                                connection.query("INSERT INTO club_projects VALUES ("
                                    + "'" + req.body.clubId + "',"
                                    + "'" + prjId + "',"
                                    + "'" + createdDate + "'"

                                    + ");", (err, row, fields) => {
                                        console.log("Club Projects inserte query ");
                                        console.log(row);
                                        if (err) {
                                            return res.status(500).send({ error: true, msg: err })
                                        } else {
                                            return res.status(200).json({
                                                success: true,
                                                msg: "Project created",
                                                prj_id: prjId
                                            })
                                        }



                                    })


                            })


                    });
            }


        });











});

module.exports = router;