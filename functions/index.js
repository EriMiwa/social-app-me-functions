const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/screens', (req, res) => {
// exports.getScreens = functions.https.onRequest((req, res) => {
    admin
        .firestore()
        .collection('screens')
        .orderBy('createdAt', 'desc')//latest screen shows first
        .get()
        .then((data) => {
            let screens = [];
            data.forEach((doc) => {
                screens.push({
                    screenId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            // data.forEach((doc) => {
            //     screens.push(doc.data());
            });
            return res.json(screens);
        })
        .catch((err) => console.error(err));
});

app.post('/screens', (req, res) => {
// exports.createScreens = functions.https.onRequest((req, res) => {
    // if (req.method !== 'POST') {
    //     return res.status(400).json({error: 'Method not allowed'});
    // }
    const newScreen = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
        // createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
        .firestore()
        .collection('screens')
        .add(newScreen)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully`});
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        })
})

//http://
exports.api = functions.https.onRequest(app);