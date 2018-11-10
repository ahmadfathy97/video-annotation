const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '/uploads/default/default.jpg'
    }
});
const Users = (module.exports = mongoose.model('Users', userSchema));
