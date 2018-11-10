const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let commentsSchema = mongoose.Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users'
    },
    comment: {
        type: String,
        required: true
    },
    time: {
      type: String,
      required: true
    }
});
const Comments = (module.exports = mongoose.model(
    'comments',
    commentsSchema
));
