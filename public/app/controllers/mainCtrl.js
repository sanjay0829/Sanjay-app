angular.module('mainController',['authServices', 'userServices'])

.controller('mainCtrl', function(Auth, User,$timeout, $http, $location, $rootScope,$window, $interval, $route,AuthToken){
    var app = this;
    app.loadMe = false;

    app.checkSession = function(){
        
        if(Auth.isLoggedIn()){
            app.checkingSession = true
            var interval = $interval(function(){
                var token = $window.localStorage.getItem('token');
                
                if(token === null){
                    $interval.cancel(interval);
                }else{
                    
                    self.parseJwt = function(token){
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-','+').replace('_','/');
                        return JSON.parse($window.atob(base64));
                    }

                    var expiredTime = self.parseJwt(token);
                    var timeStamp = Math.floor(Date.now()/1000)
                    // console.log(expiredTime.exp);
                    // console.log(timeStamp)
                    var timeCheck = expiredTime.exp - timeStamp
                    
                    if(timeCheck <= 25){
                       // console.log('Session Expired..')
                        $interval.cancel(interval);
                        showModal(1)
                    }else{
                       // console.log('Session yet to expire....')
                    }

                }
            }, 2000)
        }

    }

    app.checkSession();

    var showModal = function(option){
        app.choiceMade = false
        app.modalHeader = undefined
        app.modalBody = undefined
        app.hideButton = false

        if(option === 1){
            app.modalHeader = 'Session Timeout Warning'
            app.modalBody = 'Your session will expire in 5 min. WOuld you like to renew session?'
            $("#myModal").modal({backdrop: "static"});
            $timeout(function(){
                if(!app.choiceMade){
                    showModal(2)
                    hideModal();
                }
            }, 4000)
        }else if(option === 2){
            app.hideButton = true
            app.modalHeader = 'Logging Out'
            $("#myModal").modal({backdrop: "static"});
            $timeout(function(){
                Auth.logout()
                $location.path('/')
                hideModal();
                $route.reload()
            }, 2000)
        }
    }

    app.renewSession = function(){
        app.choiceMade = true
        User.renewToken(app.username).then(function(data){
            if(data.data.success){
                AuthToken.setToken(data.data.token)
                app.checkSession();
            }else{
                app.modalBody = data.data.message
            }
        })
        console.log('Session has been renewd')
    }

    app.endSession = function(){
        app.choiceMade = true
        $timeout(function(){
            showModal(2)
        },1000)
    }

    var hideModal = function(){
        $("#myModal").modal('hide');
    }

    $rootScope.$on('$routeChangeStart', function(){

        if(!app.checkingSession) app.checkSession();
        
        if(Auth.isLoggedIn()){
            console.log('success : user logged in')
            app.isLoggedIn = true;
            Auth.getUser().then(function(data){
                //console.log(data.data.username);
                app.username = data.data.username;
                app.email = data.data.email;
                User.getPermission().then(function(data){
                    if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                        app.authorized = true
                    }
                })
                app.loadMe = true;
                
            })
        }else{
            console.log('Failure : user logged out')
            app.isLoggedIn = false;
            app.username = "";
            app.loadMe = true;
            
            
        }
    })

    

    this.doLogin = function(loginData){
        app.loading = true;
        app.errorMsg = false;
        app.expired = false;
        app.disabled = true;
        
        
        Auth.login(app.loginData).then(function(data){
            console.log(data.data.success);
            if(data.data.success){
                app.loading = false;
                app.successMsg = data.data.message;
                $timeout(function(){
                    $location.path('/');
                    app.loginData = '';
                    app.successMsg = false;
                    app.checkSession();
                }, 2000)
                
            }else{
                app.successMsg = false;
                if(data.data.expired){
                    app.expired = true;
                    app.loading = false;
                    app.errorMsg = data.data.message;

                }else{
                    app.disabled = false;
                    app.loading = false;
                    app.errorMsg = data.data.message;

                }

                
            }
        })
    }

    app.logout = function(){
        showModal(2);
    }

    this.resendLink = function(loginData){
        app.expired = false;
        app.errorMsg = "";
        Auth.resend(app.loginData.username).then(function(data){
            if(data.data.success){
                app.emailMsg = data.data.message;
                
            }else{
                app.emailMsg = data.data.message                
            }
        })        

    }
});

