// in the name of allah

// some important constant for the app
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcript = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const expressValidator = require('express-validator');
const config = require('./config/database');
const app = express();
const port = process.env.PORT || 3000;

// setup multer for uploading  files to the server
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/profile/');
    },
    filename: (req, file, cb) => {
        cb(null, Math.floor(Math.random() * 100000000) + file.originalname);
    }
});
const upload = multer({ storage: storage });

/////////////////  database connection //////////////////////
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('err', err => {
    console.log(err);
});
db.on('open', () => {
    console.log(`=============================
||  database is connected  ||
=============================`);
});

////////// some middlewares and setups /////////
//set template  engine
app.set('view engine', 'pug');

// static folder
app.use(express.static(path.join(__dirname, 'public')));

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// validator middleware
app.use(
    expressValidator({
        errorFormat: function(param, msg, value) {
            var namespace = param.split('.'),
                root = namespace.shift(),
                formParam = root;

            while (namespace.length) {
                formParam += '[' + namespace.shift() + ']';
            }
            return {
                param: formParam,
                msg: msg,
                value: value
            };
        }
    })
);

//session setup
app.set('trust proxy', 1); // trust first proxy
app.use(
    cookieSession({
        name: 'session',
        keys: ['icEgv9588DDfiidDGyU', 'r5oQr21854sSe8Ddnj5'],
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
);
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

//get models
let Users = require('./models/users');
let Comments = require('./models/comments');

app.use('/api', require('./routes/api.js'));

// home route
app.post('/makecomment', (req, res) => {
  console.log(5644);
  Comments(req.body).save(err => {
      if (err) console.log(err);
      Users.findById(req.body.user, (err, user) => {
        if(err) console.log(err);
        req.body.user = {
          username: user.username,
          image: user.image
        }
        let commentData = req.body;
        res.json({data: commentData});
        console.log(commentData);
      });
  });
});

app.get('/', (req, res) => {
  if (req.session.user){
    res.render('index')
  } else {
    res.render('welcome')
  }
});


/******************************* register  ***********************************/

app.get('/register', (req, res) => {
  if(req.session.user) {
    res.redirect('/')
  } else {
    res.render('register');
  }
});

app.post('/register', upload.single('image'), (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let password2 = req.body.password2;
    let image;
    if (req.file) image = (req.file.path).toString().replace('public', '');
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'this is not an email').isEmail();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'password does not match').equals(password);
    let errors = req.validationErrors();
    Users.findOne({ email: email }, (err, data) => {
        if (err) console.log(err);
        if (data) {
            res.render('register', { exits: 'this email is already exists.' });
        } else if (errors) {
            res.render('register', { errs: errors });
            if (req.file) {
              fs.unlink(req.file.path, function(error) {
                if (error) {
                  throw error;
                }
                console.log('Deleted');
            });
          }
        } else {
            bcript.genSalt(10, (err, salt) => {
                bcript.hash(password, salt, (err, hash) => {
                    if (err) console.log(err);
                    password = hash;
                    Users({
                        username: username,
                        email: email,
                        password: password,
                        image: image,
                    }).save(err => {
                        if (err) console.log(err);
                        res.redirect('/login');
                    });
                });
            });
        }
    });
});
/********************************** login ***********************************/
app.get('/login', (req, res) => {
  if(req.session.user) {
    res.redirect('/')
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
    let query = { email: req.body.email };
    Users.findOne(query, (err, data) => {
        if (err) console.log(err);
        if (data) {
            bcript.compare(req.body.password, data.password, (err, isMatch) => {
                if (err) console.log(err);
                if (isMatch) {
                    req.session.user = data;
                    res.redirect('/');
                } else {
                    res.render('login', { err: 'wrong password' });
                }
            });
        } else {
            res.render('login', { err: 'this email does not exist' });
        }
    });
});
/****************************************************************************/
app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

//// 404
app.use(function(req, res, next){
  res.status(404);
  res.send('not found back to <a href="/"> home page </a>');
});

//////  port   ////
app.listen(port, () => {
    console.log(
        `=============================\n||server is running at ${port}||\n=============================`
    );
});
