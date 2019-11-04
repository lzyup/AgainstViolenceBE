const mongoose = require('mongoose');
const bcrpyt = require('bcrypt');
mongoose.connect('mongodb://localhost:27017/againstViolence', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        set(val) {
            return bcrpyt.hashSync(val, 10);
        }
    },
})
const User = mongoose.model('User', UserSchema)
// remove 'users' db
// User.db.dropCollection('users');

module.exports = {
    User
};