
const router = require('express').Router();
const verifyApiKey = require('../middlewares/verify-apikey');
const verifyUserAuth = require('../middlewares/verify-user-auth');
const connection = require('../db');
const uuid = require('uuid');
const formatLocalDate = require('../utils/local-date');

router.post('/newClub', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.name) {
        return res.status(400).json({ success: false, msg: "Club Name is required" });

    }


    const createdDate = formatLocalDate();
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
            club['logo_url'] = row[i].club_logo_url;
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



    connection.query("SELECT * from messages m INNER JOIN announcements a ON m.msid=a.msid INNER JOIN user u ON a.posted_by=u.uid where a.cid='" + req.body.clubId + "';", (err, row, fields) => {
        if (err) {
            return res.status(500).send({ error: true, msg: err })
        }

        //console.log(row);
        var msgList = [];

        for (var i = 0; i < row.length; i++) {
            console.log(row[i].created_on);
            var msg = {};
            console.log("*******************************  ", row[i]);
            msg['msg_id'] = row[i].msid;
            msg['title'] = row[i].msg_title;
            msg['content'] = row[i].msg_content;
            msg['img_url'] = row[i].msg_img_url;
            // console.log(row[i]);
            msg['posted_date'] = row[i].msg_created_on;
            msg['deleted_date'] = row[i].msg_deleted_on;




            var user = {};
            user['user_name'] = row[i].user_name;
            user['user_email'] = row[i].user_email;
            user['photo_url'] = row[i].user_photo_url;
            user['uid'] = row[i].uid;
            msg['posted_user'] = user;
            //console.log(msg);
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
    //console.log(req.currentUser);
    connection.query("SELECT * from user_clubs where uid="
        + "'" + userId + "' AND cid='"
        + req.body.clubId + "';", (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }

            if(!row || row.length<=0){
                return res.status(403).send({ error: true, msg: "User not authorised to make announcement" });
            }
            if (row[0].role != 1) {
                return res.status(403).send({ error: true, msg: "User not authorised to make announcement" });
            } else {
                const msgId = uuid.v4();
                var imgUrl = "";
                if (req.body.imgUrl) {
                    imgUrl = req.body.imgUrl;
                }
                const createdDate = formatLocalDate();
                //const createdDate=new Date().toISOString();//.slice(0, 19).replace('T', ' ');
                //const createdDate = new Date();
                console.log(createdDate);
                let msgIns = connection.query("INSERT INTO messages VALUES("
                    + "'" + msgId + "',"
                    + "'" + req.body.title + "',"
                    + "'" + req.body.content + "',"
                    + "'" + imgUrl + "',"
                    + "'" + createdDate + "',"
                    + null + ","
                    + "'" + req.currentUser._name + "'"
                    + ");", (err, row, fields) => {
                        if (err) {
                            return res.status(500).send({ error: true, msg: err })
                        }

                        connection.query("INSERT INTO announcements VALUES ("
                            + "'" + req.body.clubId + "',"
                            + "'" + msgId + "',"
                            + "'" + userId + "'"
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
                console.log(msgIns.sql);
            }


        });




});

router.post('/newProject', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.name || !req.body.clubId || !req.body.isEvent) {
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

            console.log(req);
            if (row[0].role != 1) {
                return res.status(403).send({ error: true, msg: "User not authorised to create project" });
            } else {
                const prjId = uuid.v4();
                var imgUrl = "";
                if (req.body.logoUrl) {
                    imgUrl = req.body.logoUrl;
                }
                const createdDate = formatLocalDate();
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





router.post('/getProjects', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.clubId) {
        return res.status(400).send({ error: true, msg: "Some parameters are missing" });

    }


    const userId = req.currentUser._uid;
    connection.query("SELECT * from user_projects u INNER JOIN project p ON u.pid=p.pid INNER JOIN club_projects c on p.pid=c.pid where uid="
        + "'" + userId + "' AND cid='"
        + req.body.clubId + "';", (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }


            var prjList = [];

            for (var i = 0; i < row.length; i++) {
                var prj = {};
                prj['prj_id'] = row[i].pid;
                prj['prj_name'] = row[i].prj_name;
                prj['user_role'] = row[i].role;
                prj['is_event']=row[i].prj_is_event;
                prj['logo_url']=row[i].prj_logo_url;
                prjList.push(prj);
            }
            return res.status(200).json({
                success: true,
                projects: prjList
            })


        });











});


router.post('/joinClub', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.clubId) {
        return res.status(400).send({ error: true, msg: "Some parameters are missing" });

    }

    connection.query("SELECT * from user_clubs where uid="
        + "'" + req.currentUser._uid + "' AND cid="
        + "'" + req.body.clubId + "';"
        , (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }

            if (row.length > 0) {
                return res.status(400).send({ error: true, msg: "User already in club" })

            } else {
                connection.query("INSERT INTO user_clubs VALUES("
                    + "'" + req.currentUser._uid + "',"
                    + "'" + req.body.clubId + "',"
                    + 0 //Admin-1 Member-0
                    + ");", (err, row, fields) => {
                        if (err) {
                            return res.status(500).send({ error: true, msg: err })
                        }

                        return res.status(200).json({
                            success: true,
                            club: {
                                club_id: req.body.clubId,

                                user_role: 0,


                            }
                        })
                    })
            }

        })













});

router.post('/getProjectMessages', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.prjId) {
        return res.status(400).send({ error: true, msg: "Project id is required" });

    }



    connection.query("SELECT * from messages m INNER JOIN project_messages p ON m.msid=p.msid INNER JOIN user u on p.posted_by=u.uid where p.pid='" + req.body.prjId + "';", (err, row, fields) => {
        if (err) {
            return res.status(500).send({ error: true, msg: err })
        }


        // console.log(row);
        var msgList = [];

        for (var i = 0; i < row.length; i++) {
            var msg = {};
            msg['msg_Id'] = row[i].msid;
            msg['title'] = row[i].msg_title;
            msg['content'] = row[i].msg_content;
            msg['img_url'] = row[i].msg_img_url;
            msg['posted_date'] = row[i].msg_created_on;
            msg['deleted_date'] = row[i].msg_deleted_on;

            var user = {};
            user['user_name'] = row[i].user_name;
            user['user_email'] = row[i].user_email;
            user['photo_url'] = row[i].user_photo_url;
            user['uid'] = row[i].uid;
            msg['posted_user'] = user;


            msgList.push(msg);
        }
        return res.status(200).json({
            success: true,
            announcements: msgList
        })
    });






});


router.post('/newProjectMessage', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.title || !req.body.content || !req.body.prjId) {
        return res.status(400).send({ error: true, msg: "Some parameters are missing" });

    }
    const userId = req.currentUser._uid;
    connection.query("SELECT * from user_projects where uid="
        + "'" + userId + "' AND pid='"
        + req.body.prjId + "';", (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }

            if (row.length == 0) {
                return res.status(403).send({ error: true, msg: "User not authorised to post message" });
            } else {
                const msgId = uuid.v4();
                var imgUrl = "";
                if (req.body.imgUrl) {
                    imgUrl = req.body.imgUrl;
                }
                const createdDate = formatLocalDate();
                connection.query("INSERT INTO messages VALUES("
                    + "'" + msgId + "',"
                    + "'" + req.body.title + "',"
                    + "'" + req.body.content + "',"
                    + "'" + imgUrl + "',"
                    + "'" + createdDate + "',"
                    + null
                    + ",'" + userId + "'"

                    + ");", (err, row, fields) => {
                        if (err) {
                            return res.status(500).send({ error: true, msg: err })
                        }

                        connection.query("INSERT INTO project_messages VALUES ("
                            + "'" + req.body.prjId + "',"
                            + "'" + msgId + "',"
                            + "'" + userId + "'"
                            + ");", (err, row, fields) => {

                                if (err) {
                                    return res.status(500).send({ error: true, msg: err })
                                }
                                return res.status(200).json({
                                    success: true,
                                    msg: "Message added",
                                    msg_id: msgId,
                                    prj_id: req.body.prjId
                                })
                            })


                    });
            }


        });




});


router.post('/joinProject', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.prjId) {
        return res.status(400).send({ error: true, msg: "Some parameters are missing" });

    }

    connection.query("SELECT * from user_projects where uid="
        + "'" + req.currentUser._uid + "' AND pid="
        + "'" + req.body.prjId + "';"
        , (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }


            if (row.length > 0) {
                return res.status(400).send({ error: true, msg: "User already in project" })

            } else {
                const joinedDate = formatLocalDate();
                connection.query("INSERT INTO user_projects VALUES("
                    + "'" + req.currentUser._uid + "',"
                    + "'" + req.body.prjId + "',"
                    + "'" + joinedDate + "',"
                    + 0 //Admin-1 Member-0
                    + ");", (err, row, fields) => {
                        if (err) {
                            return res.status(500).send({ error: true, msg: err })
                        }

                        return res.status(200).json({
                            success: true,
                            club: {
                                prj_id: req.body.prjId,
                                joined_date: joinedDate,
                                user_role: 0,


                            }
                        })
                    })
            }

        })




});


router.post('/newMilestone', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.prjId || !req.body.deadline || !req.body.content) {
        return res.status(400).send({ error: true, msg: "Some parameters are missing" });

    }

    const mlsId = uuid.v4();
    const createdDate = formatLocalDate();
    connection.query("INSERT INTO MILESTONE VALUES("
        + "'" + mlsId + "',"
        + "'" + req.body.content + "',"
        + "'" + req.body.deadline + "',"
        + "'" + createdDate + "',"
        + null
        + ");"
        , (err, row, fields) => {
            if (err) {
                return res.status(500).send({ error: true, msg: err })
            }

            connection.query("INSERT INTO project_milestones VALUES("
                + "'" + req.body.prjId + "',"
                + "'" + mlsId + "'"

                + ");", (err, row, fields) => {
                    if (err) {
                        return res.status(500).send({ error: true, msg: err })
                    }

                    return res.status(200).json({
                        success: true,
                        club: {
                            prj_id: req.body.prjId,
                            milestone_Id: mlsId,
                            created_date: createdDate,


                        }
                    })
                })


        })




});


router.post('/getProjectMilestones', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.prjId) {
        return res.status(400).send({ error: true, msg: "Project id is required" });

    }



    connection.query("SELECT * from milestone m INNER JOIN project_milestones p ON m.mlid=p.mlid where p.pid='" + req.body.prjId + "';", (err, row, fields) => {
        if (err) {
            return res.status(500).send({ error: true, msg: err })
        }


        // console.log(row);
        var mlList = [];

        for (var i = 0; i < row.length; i++) {
            var milestone = {};
            milestone['milestone_id'] = row[i].mlid;
            milestone['content'] = row[i].ml_content;
            milestone['deadline'] = row[i].ml_deadline;
            milestone['created_on'] = row[i].ml_created_on;
            milestone['finished_on'] = row[i].ml_finished_on;

            mlList.push(milestone);
        }
        return res.status(200).json({
            success: true,
            milestone: mlList
        })
    });






});

module.exports = router;