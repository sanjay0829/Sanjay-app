const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var EmailSchema = new Schema({
    name : {type:String, required: true},
    email: {type:String, lowercase:true, required:true}
})

module.exports = mongoose.model('sendmail', EmailSchema);
