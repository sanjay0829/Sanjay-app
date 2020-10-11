const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var SendMail = require('../models/sendmail');
var secret = 'topsecret';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const user = require('../models/user');

var options = {
  auth: {
    api_user: 'sanjaymarki@groupthink.in',
    api_key: 'amazing_123'
  }
}

var client = nodemailer.createTransport(sgTransport(options));

//Start Area Mail Sending
router.post('/sendmail', function(req, res){

    var sendmail = new SendMail({
        name : 'Sanjay',
        email : 'Sanjay@gmail.com'
    })

     sendmail.save(function(err){
        if(err){
            res.json({success: false , message : err})
        }
        else{
            res.json({success: true , message : 'Saved'})
        }
    })
})

router.post('/DeleteAll',function(req, res){
    SendMail.find(function(err, doc){
        doc.forEach(function(item){
            console.log(item._id);
            SendMail.deleteOne({_id: item._id}, function(err){
                if(err){
                    console.log(err)
                }
            })
            
        })
    }).skip(2)
})

router.post('/sendmailAll', function(req, res){
    var count = 0
    SendMail.find(function(err, doc){
        doc.forEach(function(item){
           // res.json({success: true , message : item.email})
        console.log(item.email);
        var email = {
            from: 'Local staff, no-reply@groupthink.in',
            fromname: 'The NOESIS',
            to: item.email,
            subject: 'Login Details -  POGS & NOESIS Conference ',
            text: 'Hello '+item.name+' This is test mail. Thank you',
            //html: 'Hello <b>'+item.name+' <b><br><br>This is test mail. offer 25% off <a href="https://www.sfmvirtual.org/">www.sfmvirtual.org</a> Thank you '
            html: '<div style="font-size:1.2rem"><h4>Dear '+item.name+',</h4>' +
            '<p>Greetings from POGS & NOESIS Conference</p>' +
            '<p>Thank you for your registration to the Annual Conference of The Perinthalmanna Obstetric and Gynaecological Society (POGS), The Noesis. This is the official confirmation letter for your registration. Please go through the email thoroughly.</p>'+    
            '<p>Smartphones will not do justice to the program and images. You should have a high quality internet connection.  </p>'+    
            '<p>Registered participants will be able to access the virtual meeting on 8 & 9 Aug, from 8:00 am Indian Standard Time ( IST )</p>'+    
            '<h4>To access the meeting:</h4>'+    
            '<p><b>Click on the Link: pogsvirtualci.virtualmnc.com<br>'+
            'Your Login Id is: '+item.email +"<br><br>"+
            '(Important Note : Log In Id is Non-Transferable. You can only log in from one device. <i  style="color: brown;">Please Login at 8:00 am onwards in order to avoid any last minutes confusion</i>)</b></p>' +
    
            '<p>To view  <b> scientific program</b>, click here - <a href="http://www.pogsvirtual.com/pdf/Programme-30.07.pdf">http://www.pogsvirtual.com/Programme</a> </p>'+    
            '<p>POGS virtual platform video guide, click here <a href="https://www.youtube.com/watch?v=Ko0Z7-RyJUA">https://www.youtube.com/watch?v=Ko0Z7-RyJUA</a> </p>'+    
            '<p>For the best experience of the virtual congress, it is recommended to join the meeting via tablet, laptop or desktop computer with good audio output. You can log in early to ensure you are able to connect.</p>'+    
            '<p>The trade exhibition, product videos, industry representative visits, special offers, free downloads of trade brochures and viewing of e-Posters will be available from 8:00 am IST onwards on 8 & 9 August. </p>'+    
            '<p>POGS & Conferences International shall not be responsible for loss of connection / late joining / audio issues at your end. No recordings shall be shared later.</p>'+    
            '<h3 style="color:blue;">Important Note:</h3>'+
    
            '<ul>'+
                '<li>The meeting will be conducted as per Indian Standard Time. The flexible format of the conference allows you to enter the meeting room as per your convenience. All the talks would be held in the scientific hall where the live presentation would be running as per the program agenda. Updated scientific program can be viewed at  <a href="http://www.pogsvirtual.com/pdf/Programme-30.07.pdf">http://www.pogsvirtual.com/Programme</a></li>'+
                '<li> the Exhibition Lobby, you can interact with the exhibitor through the option of live chat, video call and future appointments</li>'+
                '<li>The E Poster Area - You can view E-posters which would be on display on both the days.</li>'+
                '<li>In case you still have queries you can dial our Toll Free No. 1800-2124-758 on the day of the meeting for any help.</li>'+
            '</ul>'+    
            '<p>We wish to express our gratitude to all members of the society who have supported us in such huge numbers. As we work through further details of the conference we will keep you informed via the website <a href="http://www.pogsvirtual.com/">http://www.pogsvirtual.com/</a> </p>'+
    
           '<h4>Kind Regards,</h4>'+
    
            '<h4>POGS & NOESIS Conference Virtual Team</h4></div>'
          };
          
        client.sendMail(email, function(err, info){
              if (err ){
                console.log(err);
              }
              else {
                  count = count + 1
                console.log('Message sent: ' + count +info.response);
              }
        });
       
        })
        
    }).skip(1774).limit(100)
    
    
    // SendMail.find(function(err, doc){
    //     doc.forEach(function(item){
    //             //res.json({success: true , message : item.email})
    //             console.log(item.email);
    //         })
    // }).limit(2)
})
//End Area Email Sending

//User Registration Route
//localhost:9000/api/users
router.post('/users',async function(req, res){

        var user = new User({
            name : req.body.name,
            username : req.body.username,
            password : req.body.password,
            email : req.body.email,
            temporarytoken : jwt.sign({ username : req.body.username, email : req.body.email}, secret, {expiresIn : '24h'})
            
        });    
            try{
    
                await user.save(function(err){
                    if(err){
                        if (err.name === 'MongoError' && err.code === 11000) {
                            // Duplicate username                            
                           res.json({success: false , message : JSON.stringify(err.keyValue) + ' Already Exists'})
                          }else{
                            if (err.errors.name){
                                res.json({success: false , message : err.errors.name.message})                                
                            }else if(err.errors.email){
                                res.json({success: false , message : err.errors.email.message})
                            }else if(err.errors.username){
                                res.json({success: false , message : err.errors.username.message})
                                
                            }else if(err.errors.password){
                                res.json({success: false , message : err.errors.password.message})
                                
                            }else{
                                res.json({success: false , message : err})
                            }
                          }
                          
                    
                    }else{

                        var email = {
                            from: 'Local staff, sanjaymarki@groupthink.in',
                            fromname: 'Account Activation',
                            to: 'sanjaymarki@gmail.com',
                            subject: 'Localhost Activation Link',
                            text: 'Hello '+user.name+' Thank you for registering at Localhost.com.Please click on the link below to complete your activation http://localhost:9000/activate/'+user.temporarytoken,
                            html: 'Hello <b>'+user.name+'</b> <br><br> Thank you for registering at Localhost.com.Please click on the link below to complete your activation.<br><br> <a href="http://localhost:9000/activate/'+user.temporarytoken+'">http://localhost:9000/activate/'
                          };
                          
                        client.sendMail(email, function(err, info){
                              if (err ){
                                console.log(err);
                              }
                              else {
                                console.log('Message sent: ' + info.response);
                              }
                        });
                        
                        res.json({success: true , message : 'Account registered. Please check your for activation link...'})
                    }
                });
                
            }
            catch(err){
                res.send('Error ' + err);
            }
    
    
})

//username checking
//localhost:9000/api/checkusername
router.post('/checkusername', function(req, res){
    //console.log(req.body.username)
    User.findOne({username : req.body.username}).select('email username').exec(function(err, user){
        if(err) throw err

        if(user){
            res.json({ success: false, message: 'username already taken'})
        }else{
            res.json({ success: true, message: 'valid username'})
        }

        
    })
})

//email checking
//localhost:9000/api/checkemail
router.post('/checkemail', function(req, res){
    //console.log(req.body)
    User.findOne({email : req.body.email}).select('email username').exec(function(err, user){
        if(err) throw err

        if(user){
            res.json({ success: false, message: 'e-mail already taken'})
        }else{
            res.json({ success: true, message: 'valid e-mail'})
        }

        
    })
})

// USER Login route
//localhost:9000/api/authenticate
router.post('/authenticate', function(req, res){
    //console.log(req.body.username)     

    User.findOne({username : req.body.username}).select('email username password active').exec(function(err, user){
        if(err) throw err

        if(!user){
            res.json({success :false , message : 'Could not authenticate user'})
        }else if(user){
            var validPassword = user.comparePassword(req.body.password);

            if(!validPassword){
                res.json({success :false , message : 'Password not matching'})
            } else if(!user.active){
                res.json({success : false, message : 'Account is not yet activated!!! Please check your email for activation link!', expired : true})

            } else{
                var token = jwt.sign({ username : user.username, email : user.email}, secret, {expiresIn : '24h'})
                res.json({ success : true, message : 'User Authenticated!!!!', token : token})
            }
        }
    })
})

//resend authentication link
router.post('/resend/:username', function(req, res){
    //console.log(req.body.username)     

    User.findOne({username : req.params.username}).select('email username password active').exec(function(err, user){
        if(err) throw err

        if(!user){
            res.json({success :false , message : 'Could not authenticate user from resend'})
        }else if(user){
            
            
            res.json({success: true , message : user})
        }
    })
})
//Update the Token to resend 
router.put('/resend/:username', function(req, res){
    //console.log(req.body.username)     

    User.findOne({username : req.params.username}).select('name email username  temporarytoken').exec(function(err, user){
        if(err) throw err

        if(!user){
            res.json({success :false , message : 'Could not authenticate user from resend put'})
        }else if(user){
            user.temporarytoken = jwt.sign({ username : user.username, email : user.email}, secret, {expiresIn : '24h'})
            user.save(function(err){
                if(err){
                    console.log(err)
                }else{

                    var email = {
                        from: 'Local staff, sanjaymarki@groupthink.in',
                        fromname: 'Account Activation',
                        to: 'sanjaymarki@gmail.com',
                        subject: 'Localhost Activation Link',
                        text: 'Hello '+user.name+' You Requested for new activation Link.Please click on the link below to complete your activation http://localhost:9000/activate/'+user.temporarytoken,
                        html: 'Hello <b>'+user.name+'</b> <br><br> You Requested for new activation Link.Please click on the link below to complete your activation.<br><br> <a href="http://localhost:9000/activate/'+user.temporarytoken+'">http://localhost:9000/activate/'
                      };
                      
                    client.sendMail(email, function(err, info){
                          if (err ){
                            console.log(err);
                          }
                          else {
                            console.log('Message sent: ' + info.response);
                          }
                    });
                    
                    res.json({success: true , message : 'Activation link sent to '+user.email+'. Please check your for activation link...'})
                }
            })
            
        }
    })
})

// activation of account
router.put('/activate/:token', function(req, res){
    User.findOne({temporarytoken : req.params.token}, function(err, user){
        if(err) throw err;

        var token = req.params.token;

        jwt.verify(token, secret, function(err, decoded) {
            if(err){
                res.json({ success : false , message : 'Activation Link Expired'})
            }else if(!user){
                res.json({ success : false , message : 'Activation Link Expired'})
            }else{
                user.temporarytoken = false;
                user.active = true;
                user.save(function(err){
                    if(err){
                        console.log(err)
                    }else{

                        var email = {
                            from: 'Local staff, sanjaymarki@groupthink.in',
                            fromname: 'Account Activation',
                            to: 'sanjaymarki@gmail.com',
                            subject: 'Localhost Acount activated',
                            text: 'Hello '+user.name+' Account has been activated',
                            html: 'Hello <b>'+user.name+'</b> <br><br> Your Account has been activated'
                          };
                          
                        client.sendMail(email, function(err, info){
                              if (err ){
                                console.log(err);
                              }
                              else {
                                console.log('Message sent: ' + info.response);
                              }
                        });

                        res.json({ success : true , message : 'Acount has been Activated'})
                    }
                })
                
            }
            
          });
    })
})


// Forgot username 
router.get('/resetusername/:email', function(req, res){
    User.findOne({email: req.params.email}).select('email username name').exec(function(err, user){
        if(err){
            res.json({success : false, message : err})
        }else{
            if(!user){
                res.json({success : false, message : 'E-mail Id is not registered.'})
            }else{

                var email = {
                    from: 'Local staff, sanjaymarki@groupthink.in',
                    fromname: 'Account Activation',
                    to: 'sanjaymarki@gmail.com',
                    subject: 'Localhost Username Request',
                    text: 'Hello '+user.name+' You recently requested  for your username. Please save it in your files : ' + user.username,
                    html: 'Hello <b>'+user.name+'</b> <br><br> You recently requested  for your username. Please save it in your files : ' + user.username
                  };
                  
                client.sendMail(email, function(err, info){
                      if (err ){
                        console.log(err);
                      }
                      else {
                        console.log('Message sent: ' + info.response);
                      }
                });
                res.json({success : true, message : 'Username is sent to the Email address.'})
            }
        }
    })
})

//Reset Password
router.put('/resetpassword', function(req, res){    
    User.findOne({username : req.body.username}).select('username name resettoken email').exec(function(err, user){
        if(err) throw err;

        if(!user){
            res.json({success: false, message: 'Username not found'})
        }else{
            user.resettoken = jwt.sign({ username : user.username, email : user.email}, secret, {expiresIn : '24h'})
            user.save(function(err){
                if(err){
                    res.json({ success: false, message: err})
                }else{
                    var email = {
                        from: 'Local staff, sanjaymarki@groupthink.in',
                        fromname: 'Account Activation',
                        to: 'sanjaymarki@gmail.com',
                        subject: 'Localhost Password Reset Request',
                        text: 'Hello '+user.name+' You recently Requested for a password reset Link.Please click on the link below to reset password. http://localhost:9000/reset/'+user.resettoken,
                        html: 'Hello <b>'+user.name+'</b> <br><br> You recently Requested for a password reset Link.Please click on the link below to reset password.<br><br> <a href="http://localhost:9000/reset/'+user.resettoken+'">http://localhost:9000/reset/'
                      };
                      
                    client.sendMail(email, function(err, info){
                        if (err ){
                            console.log(err);
                        }else {
                            console.log(info)
                            console.log('Message sent: ' + info.message);
                        }
                    });

                    res.json({success: true, message : 'Password reset link is sent to your email address'})
                }

            })
        }

    })
})

router.get('/resetpassword/:token', function(req, res){
    User.findOne({resettoken : req.params.token}).select().exec(function(err, user){
        if(err) throw err;
        var token = req.params.token
        
        jwt.verify(token, secret, function(err, decoded) {
            if(err){
                res.json({ success : false , message : 'Password reset link has Expired !!!'})
            }else{
                if(!user){
                    res.json({success: false, message : 'Password reset link has Expired !!!'})
                }else{
                    res.json({ success : true, user : user})
                }
                
            }
            
          });
    })
})

router.put('/savepassword', function(req, res){
    User.findOne({username : req.body.username}).select('username name password resettoken').exec(function(err, user){
        if(err) throw err;
        if(req.body.password == null || req.body.password == ''){
            res.json({success: false, message:'Password Not Provided'})
        }else{
            user.password = req.body.password
            user.resettoken = false;
            user.save(function(err){
                if(err){
                    res.json({success : false, message : err})
                }else{
                    var email = {
                        from: 'Local staff, sanjaymarki@groupthink.in',
                        fromname: 'Account Activation',
                        to: 'sanjaymarki@gmail.com',
                        subject: 'Localhost Password Reset ',
                        text: 'Hello '+user.name+' This e-mail is to notify you that your password has been changed successfully',
                        html: 'Hello <b>'+user.name+'</b> <br><br> This e-mail is to notify you that your password has been changed successfully'
                      };
                      
                    client.sendMail(email, function(err, info){
                          if (err ){
                            console.log(err);
                          }
                          else {
                            console.log('Message sent: ' + info.response);
                          }
                    });

                    res.json({success : true, message : 'Password has been reset'})
                }
            }) 
        }
    })
})

//Middleware to decoded the token
router.use(function(req, res, next){
    var token = req.body.token || req.body.query || req.headers['x-access-token']       
    if(token){

        jwt.verify(token, secret, function(err, decoded) {
            if(err){
                res.json({ success : false , message : 'Invalid token'})
            }else{
                req.decoded = decoded;
                next();
            }
            
          });

    }else{

        res.json({ success : false , message : 'No token Provided'})

    }
})




// Get The User from token
router.post('/me', function(req, res){
    res.send(req.decoded)
})

//REnew token
router.get('/renewToken/:username', function(req, res){
    User.findOne({username: req.params.username}).select('username email').exec(function(err, user){
        if(err) throw err;
        if(!user){
            res.json({success:false, message:'No User found!!'})
        }else{
            var newtoken = jwt.sign({ username : user.username, email : user.email}, secret, {expiresIn : '24h'})
            res.json({ success : true,  token : newtoken})
        }
    })
})

router.get('/permission', function(req, res){
    User.findOne({username : req.decoded.username},function(err, user){
        if(err) throw err;
        
        if(!user){
            res.json({success:false, message: 'No users found!'})
        }else{
            res.json({success:true, permission: user.permissions})
        }
    })
})

router.get('/management', function(req, res){
    User.find({}, function(err, users){
        if(err) throw err;
        User.findOne({username : req.decoded.username}, function(err, mainUser){
            if(err) throw err
            if(!mainUser){
                res.json({success: false, message: 'No User Found'})
            }else{
                if(mainUser.permissions === 'admin' || mainUser.permissions === 'moderator'){
                    if(!users){
                        res.json({ success: false, message : 'Users not Found'})
                    }else{
                        res.json({success: true, users: users, permission: mainUser.permissions })
                    }

                }else{
                    res.json({success:false, message: 'Insufficient Permission'})
                }
            }
        })

    })
})

router.delete('/management/:username', function(req, res){
    var deletedUser = req.params.username;
    
    User.findOne({username : req.decoded.username}, function(err, mainUser){
        if(err) throw err
        if(!mainUser){
            res.json({success: false, message: 'No User Found'})
        }else{
            if(mainUser.permissions !== 'admin'){
                res.json({success:false, message: 'Insufficient Permission'})
            }else{
                
                User.findOneAndRemove({username : deletedUser}, function(err, user){
                    if(err) throw err;
                    res.json({success: true})
                })
            }
        }
    })
})

router.get('/edit/:id', function(req, res){
    var editUser = req.params.id;
    User.findOne({username : req.decoded.username}, function(err, mainUser){
        if(err) throw err
        if(!mainUser){
            res.json({success: false, message: 'No User Found'})
        }else{
            if(mainUser.permissions === 'admin' || mainUser.permissions === 'moderator'){
                User.findOne({_id : editUser}, function(err, user){
                    if(err) throw err;
                    if(!user){
                        res.json({success : false, message : 'No user found!'})
                    }else{
                        res.json({success:true, user : user})
                    }
                })
            }else{
                res.json({success:false, message: 'Insufficient Permission'})
            }
        }
    })
})

router.put('/edit', function(req, res){
    var editUser = req.body._id;
    
    if(req.body.name) var newName = req.body.name;
    if(req.body.username) var newUsername = req.body.username;
    if(req.body.email) var newEmail = req.body.email;
    if(req.body.permission) var newPermission = req.body.permission;
    User.findOne({username : req.decoded.username}, function(err, mainUser){
        if(err) throw err;
        if(!mainUser){
            res.json({success: false, message: 'No User Found'})
        } else {
            //Name update section
            if(newName){
                if(mainUser.permissions === 'admin' || mainUser.permissions === 'moderator'){
                    User.findOne({_id : editUser}, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({success: false, message: 'No User Found'})
                        }else{
                            user.name = newName;
                            //user.temporarytoken = false;
                            user.save(function(err){
                                if(err){
                                    console.log('i am here');
                                    console.log(err);
                                }else{
                                    res.json({success: true, message : 'Name is updated.'})
                                }
                            })
                        }
                    })
                }else{
                    res.json({success: false, message: 'Insufficient Permissions!'})
                }
            }
            // Username Update Section
            if(newUsername){
                if(mainUser.permissions === 'admin' || mainUser.permissions === 'moderator'){
                    User.findOne({_id : editUser}, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({success: false, message: 'No User Found'})
                        }else{
                            user.username = newUsername;
                            user.save(function(err){
                                if(err){
                                    console.log(err);
                                }else{
                                    res.json({success: true, message : 'Username is updated.'})
                                }
                            })
                        }
                    })
                }else{
                    res.json({success: false, message: 'Insufficient Permissions!'})
                }
            }
            // Email Update Section
            if(newEmail){
                if(mainUser.permissions === 'admin' || mainUser.permissions === 'moderator'){
                    User.findOne({_id : editUser}, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({success: false, message: 'No User Found'})
                        }else{
                            user.email = newEmail;
                            user.save(function(err){
                                if(err){
                                    console.log(err);
                                }else{
                                    res.json({success: true, message : 'Email is updated.'})
                                }
                            })
                        }
                    })
                }else{
                    res.json({success: false, message: 'Insufficient Permissions!'})
                }
            }
            // Permission Update Section
            if(newPermission){
                if(mainUser.permissions === 'admin' || mainUser.permissions === 'moderator'){
                    User.findOne({_id : editUser}, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({success: false, message: 'No User Found'})
                        }else{
                            if(newPermission === 'user'){
                                if(user.permissions === 'admin'){
                                    if(mainUser.permissions !== 'admin'){
                                        res.json({success : false, message: 'Insufficient Permissions! You must be an admin to downgrade another admin.'})
                                    }else{
                                        user.permissions = newPermission
                                        user.save(function(err){
                                            if(err){
                                                console.log(err)
                                            }else{
                                                res.json({success: true, message: 'Permissions has been updated!'})
                                            }
                                        })
                                    }

                                }else{
                                    user.permissions = newPermission
                                    user.save(function(err){
                                         if(err){
                                            console.log(err)
                                        }else{
                                            res.json({success: true, message: 'Permissions has been updated!'})
                                        }
                                    })

                                }

                            }
                            if(newPermission === 'moderator'){
                                if(user.permissions === 'admin'){
                                    if(mainUser.permissions !== 'admin'){
                                        res.json({success : false, message: 'Insufficient Permissions! You must be an admin to downgrade another admin.'})
                                    }else{
                                        user.permissions = newPermission
                                        user.save(function(err){
                                            if(err){
                                                console.log(err)
                                            }else{
                                                res.json({success: true, message: 'Permissions has been updated!'})
                                            }
                                        })
                                    }

                                }else{
                                    user.permissions = newPermission
                                    user.save(function(err){
                                         if(err){
                                            console.log(err)
                                        }else{
                                            res.json({success: true, message: 'Permissions has been updated!'})
                                        }
                                    })

                                }
                            }
                            if(newPermission === 'admin'){
                                if(mainUser.permissions === 'admin'){
                                    user.permissions = newPermission
                                    user.save(function(err){
                                         if(err){
                                            console.log(err)
                                        }else{
                                            res.json({success: true, message: 'Permissions has been updated!'})
                                        }
                                    })
                                }else{
                                    res.json({success : false, message: 'Insufficient Permissions! You must be an admin to upgrade someone to admin.'})
                                }
                            }
                        }
                    })
                }else{
                    res.json({success: false, message: 'Insufficient Permissions!'})
                }
            }
        }
    })
})

module.exports = router;


