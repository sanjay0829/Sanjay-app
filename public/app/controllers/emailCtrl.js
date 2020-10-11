angular.module('emailController',['userServices'])

.controller('emailCtrl', function($routeParams, User, $timeout, $location){
    console.log($routeParams.token)

    app = this;
    var token = $routeParams.token;

    User.activeAccount(token).then(function(data){

        console.log(data.data.message);
        app.successMsg =  false;
        
        app.emailSuccess = data.data.success;

        if(data.data.success){            
            app.successMsg = data.data.message;
            $timeout(function(){
                $location.path('/login');
            }, 2000)
        }else{
            app.successMsg = data.data.message;
        }
    })
})

.controller('usernameCtrl', function(User){
    app = this;  

    app.sendUsername = function(userData, valid){
        app.errorMsg =false;
        app.loading = true;
        app.disabled = true;
        if(valid){
            User.sendUsername(app.userData.email).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message
                }else{
                    app.disabled = false;
                    app.errorMsg = data.data.message
                }
            })
        }else{
            app.disabled = false;
            app.errorMsg = 'Please Enter a Valid Email'
        }
    }
})

.controller('passwordCtrl', function(User){
    app = this;  
  
    app.sendPassword = function(resetData, valid){
        app.errorMsg =false;
        app.loading = true;
        app.disabled = true;
        if(valid){
            User.sendPassword(app.resetData).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message
                }else{
                    app.disabled = false;
                    app.errorMsg = data.data.message
                }
            })
        }else{
            app.disabled = false;
            app.errorMsg = 'Please Enter a Valid Username'
        }
    }
})

.controller('resetCtrl', function(User, $routeParams, $scope,   $timeout, $location){
    app = this;
    app.hide = true;
     
    User.resetUser($routeParams.token).then(function(data){
        if(data.data.success){
            app.hide = false;
            app.successMsg ='Please enter a new password !'
            $scope.username = data.data.user.username
            console.log(data.data.user.username)
        }else{
            app.errorMsg = data.data.message;
        }
        
    })

    app.savePassword = function(regData, valid, confirmed){
        app.errorMsg = false;
        app.disabled = true;
        app.loading = true;
        
        if(valid && confirmed){
            app.regData.username = $scope.username
            User.savePassword(app.regData).then(function(data){
                app.loading = false;
                if(data.data.success){
                    app.successMsg = data.data.message + '....Redirecting'
                    $timeout(function(){
                        $location.path('/login')
                    }, 2000)
                }else{
                    app.loading = false;
                    app.disabled = false;
                    app.errorMsg = data.data.message
                }
            })
        }else{
            app.loading = false;
            app.disabled = false;
            app.errorMsg = 'Please fill out form properly'
        }
    }


})