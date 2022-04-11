
const router = require('express').Router();
const verifyApiKey = require('../middlewares/verify-apikey');
const verifyUserAuth = require('../middlewares/verify-user-auth');
const connection = require('../db');
const uuid = require('uuid');

router.post('/newClub', verifyApiKey, verifyUserAuth, (req, res, next) => {


    if (!req.body.name) {
        return res.status(400).json({ success: false, msg: "Club Name is required" });

    }

    
    const createdDate = new Date().toISOString();
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


    if (!req.body.name) {
        return res.status(400).json({ success: false, msg: "Club Name is required" });

    }

    const createdDate = new Date().toISOString();
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

            return res.status(200).json({
                success: true,
                club: {
                    club_id: clubID,
                    club_name: req.body.name,
                    logo_url: logoUrl,

                }
            })
        });






});


module.exports = router;