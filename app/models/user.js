const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const titlize = require('mongoose-title-case');
var validate = require('mongoose-validator')

mongoose.set('useFindAndModify', false);

const bcrypt = require('bcrypt');
const saltRounds = 10;

var nameValidator = [
    validate({
        validator: 'matches',
        arguments: /^[a-zA-Z\s]+$/,
        message: 'Name : All charcters must be alphabets.'
      }),
      validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
      })
] 

var emailValidator = [
    validate({
        validator: 'isEmail',        
        message: 'Enter a valid email Id.'
      })
]

var usernameValidator = [
    validate({
        validator: 'matches',
        arguments: /^[a-z0-9_-]{3,16}$/,
        message: 'Username : Alphanumeric string that may include _ and – having a length of 3 to 16 characters'
      })
]

var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,30}$/,
        message: 'Password : Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
      })
]

var UserSchema = new Schema({
    name: {type:String, required:true, validate:nameValidator},
    username: {type:String, lowercase:true, required:true, unique:true, validate:usernameValidator},
    password: {type:String, required:true, validate:passwordValidator, select:false},
    email: {type:String, lowercase:true, required:true, unique:true, validate:emailValidator},
    active: {type:Boolean, required:true, default:false},
    temporarytoken: {type:String, required:true},
    resettoken: {type:String, required:false},
    permissions : {type:String, required:true, default:'user'}
}) 

UserSchema.pre('save', function(next){
    var user = this; 

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        user.password = hash;
        next();
    });
})

UserSchema.plugin(titlize, {
    paths: [ 'name' ] // Array of paths
    
  });

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('user', UserSchema);
