
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

const appRouter = require('./app/routes/api');

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))//
app.use(bodyParser.json()); // parse application/json
app.use('/api',appRouter);
app.use(express.static(__dirname + '/public'))
//app.use(express.static('public'))
// app.use('/public', express.static(path.join(__dirname, '/public')))
//app.use(express.json());


//mongoose.connect('mongodb://localhost/tutorial',{useNewUrlParser:true})

// mongoose.connect('mongodb+srv://sanjay01:Admin_09@cluster0.jnbn9.mongodb.net/tutorial?retryWrites=true&w=majority',{useNewUrlParser:true})
mongoose.connect('mongodb+srv://sanjay02:Admin_098@cluster0.jnbn9.mongodb.net/tutorial?retryWrites=true&w=majority',{useNewUrlParser:true})
mongoose.set('useCreateIndex', true);

const con = mongoose.connection;

con.on('open', function(){
    console.log('Database Connected..');
});


app.get('*', function(req, res){

    res.sendFile(path.join(__dirname + '/public/app/views/index.html'))

})


app.listen(9000, function(err){
    if(!err){
    console.log('Server Started')
    }
});
