const router = require('express').Router()
const admin = require('firebase-admin')
const jwt = require('jsonwebtoken')
const verifyApiKey = require('../middlewares/verify-apikey');
const formatLocalDate = require('../utils/local-date');


const connection = require('../db');
require('dotenv').config();


console.log(process.env.FIREBASE_PROJECT_ID);
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    })

});

router.post('/login', verifyApiKey, (req, res, next) => {
    admin.auth().verifyIdToken(req.body.authtoken)
        .then((decodedToken) => {
            console.log(decodedToken.email, decodedToken.uid);

            connection.query("SELECT * from user where uid='" + decodedToken.uid + "';"

                , (err, rows, fields) => {
                    if (err) {
                        return res.status(500).send({ error: true, msg: err })
                    }
                    if (!rows || rows.length<=0) {
                        return res.status(404).send({ error: true, msg: "User not found" });
                    }
                    // console.log(rows[0]['email']);

                    //Existing user

                    const token = jwt.sign({ _email: `${rows[0]['user_email']}`, _name: `${rows[0]['user_name']}`, _uid: `${rows[0]['uid']}` }, process.env.TOKEN_SECRET);
                    return res.status(200).json({
                        success: true,
                        jwt: token,
                        user: {
                            name: rows[0]['user_name'],
                            email: rows[0]['user_email'],
                            uid: rows[0]['uid'],
                            profile_url: rows[0]['photo_url']
                        }
                    })


                })

        }).catch((err) => {
            console.log(err);
            return res.status(500).send(err)
        });

});


router.post('/signup', verifyApiKey, (req, res, next) => {

    if (!req.body.name) {
        return res.status(400).send({ error: true, msg: "Name is required" });
    }
    admin.auth().verifyIdToken(req.body.authtoken)
        .then((decodedToken) => {
            console.log(decodedToken.email);

            var profile_url = decodedToken.photo_url;
            if (!profile_url) {
                profile_url = '';
            }

            const createdDate = formatLocalDate();

            //New user

            connection.query("INSERT INTO user VALUES("
                + "'" + decodedToken.uid + "',"
                + "'" + req.body.name + "',"
                + "'" + decodedToken.email + "',"
                + "'" + profile_url + "',"
                + "'" + createdDate + "');", (err, row, fields) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ error: true, msg: err })
                    }

                    console.log(decodedToken.email)

                    const token = jwt.sign({ _email: `${decodedToken.email}`, _name: `${req.body.name}`, _uid: `${decodedToken.uid}` }, process.env.TOKEN_SECRET);
                    return res.status(200).json({
                        success: true,
                        authToken: token,
                        user: {
                            name: req.body.name,
                            email: decodedToken.email,
                            uid: decodedToken.uid,
                            profile_url: req.body.photo_url ?? ""
                        }
                    })
                });

        }).catch((err) => {
            console.log(err);
            return res.status(500).send(err)
        });

})

module.exports = router