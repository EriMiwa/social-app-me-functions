const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();

var firebaseConfig = {
    apiKey: "AIzaSyAxirrUCKB--j41SsNkcwX939qoUqhAsFQ",
    authDomain: "social-app-me.firebaseapp.com",
    databaseURL: "https://social-app-me.firebaseio.com",
    projectId: "social-app-me",
    storageBucket: "social-app-me.appspot.com",
    messagingSenderId: "333433483934",
    appId: "1:333433483934:web:ccb41e19ea1413ce6ac18f"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/screens', (req, res) => {
    db
        .collection('screens')
        .orderBy('createdAt', 'desc')
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
            });
            return res.json(screens);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
});

app.post('/screens', (req, res) => {

    const newScreen = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
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

//signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    //TODO: validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
        if (doc.exists) {
            return res.status(400).json({ handle: 'this handle is already taken' });
        } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
              return res.status(400).json({ email: 'Email is already is use' });
            } else {
              return res
                .status(500)
                .json({ general: 'Something went wrong, please try again' });
            }
        });
}) 

exports.api = functions.https.onRequest(app);