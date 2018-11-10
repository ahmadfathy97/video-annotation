const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Comments = require('../models/comments');


router.get('/', (req, res) => {
  res.send(`<h1>what are you doing here <a href='/'> go to the home page</a></h1>`)
});
router.get('/comments/', (req, res) => {
  if(req.session.user){
    let query = req.query;
    Comments.find(query)
      .populate('user')
      .exec((err, comments) => {
        let newComments = []
        comments.forEach((comment) => {
          let newComment = comment.toJSON();
          if (comment.user.password) delete newComment.user.password
          if (comment.user.email) delete newComment.user.email
          newComments.push(newComment);
        });
        if (err) console.log(err);
        res.json(newComments);
    });
  } else{
    res.send('you can\'t be here')
  }
});
module.exports = router;
