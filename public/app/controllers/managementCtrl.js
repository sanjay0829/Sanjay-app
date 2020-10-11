angular.module('managementController',['userServices'])
.controller('managementCtrl', function(User, $scope){
    var app = this
    app.loading = true
    app.accessDenied = true
    app.errorMsg = false
    app.editAccess = false
    app.deleteAccess = false
    
    function getUsers(){
        User.getUsers().then(function(data){
            if(data.data.success){
                if(data.data.permission === 'admin' || data.data.permission || 'moderator'){
                    app.users =data.data.users
                    app.loading =false;
                    app.accessDenied = false;
                    if(data.data.permission ==='admin'){
                        app.editAccess = true
                        app.deleteAccess = true
                    }else if(data.data.permission === 'moderator'){
                        app.editAccess = true
                        app.deleteAccess = false
                    }
                }else{
                    app.errorMsg = 'Insufficient Permission!!!'
                    app.loading = false
                }
            }else{
                app.errorMsg = data.data.message
            }
        })    
    }

    getUsers();

    app.showMore = function(number){
        app.showMoreError = undefined;
        
        if(number < 0){
            app.limit = undefined;
        }else  if(number > 0){
            app.limit = number;
            
        }else{
            app.showMoreError = "Please enter valid number."
        }
    }

    app.showAll = function(){
        app.limit = undefined;
        app.showMoreError = false;
        $scope.number = undefined;
    }

    app.deleteUser = function(username){
        
        User.deleteUser(username).then(function(data){
            if(data.data.success){
                getUsers();
            }else{
                app.showMoreError = data.data.message;
            }
        })
    }

    app.search = function(searchKeyword, number){
        if(searchKeyword){
            if(searchKeyword.length > 0){
                $scope.serachFilter = searchKeyword;
                app.limit = number;
            }
        }else{
            $scope.serachFilter = undefined;
            app.limit = 0;
        }
        
    }

    app.clear = function(){
        $scope.serachFilter = undefined;
        $scope.searchKeyword = '';
        app.limit = undefined;
        app.showMoreError = false;
    }

    app.advanceSearch = function(searchByName, searchByUsername, SearchByEmail ){
       
        if(searchByName || searchByUsername || SearchByEmail){
            $scope.advanceSearchFilter = {};
            if(searchByName){                             
                $scope.advanceSearchFilter.name = searchByName;
            }
            if(searchByUsername){
                
                $scope.advanceSearchFilter.username = searchByUsername;
            }
            if(SearchByEmail){
                $scope.advanceSearchFilter.email = SearchByEmail;
            }
            app.limit = undefined
        }
    }

    app.sortOrder = function(order){
        app.sort = order;
    }

})

.controller('editCtrl', function($scope, User, $routeParams, $timeout){

    app = this;
    $scope.nameTab = 'active';
    app.phase1 = true;

    User.getUser($routeParams.id).then(function(data){
        if(data.data.success){

            $scope.newName = data.data.user.name;
            $scope.newUsername = data.data.user.username;
            $scope.oldUsername = data.data.user.username;
            $scope.newEmail = data.data.user.email;
            $scope.oldEmail = data.data.user.email;
            $scope.newPermission = data.data.user.permissions;
            app.currentUser = data.data.user._id
        }else{
            app.errorMsg = data.data.message;
        }
    })

    app.namePhase = function(){
        app.errorMsg = false;
        $scope.nameTab = 'active';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'default';
        $scope.permissionTab = 'default';
        app.phase1 = true;
        app.phase2 = false;
        app.phase3 = false;
        app.phase4 = false;
    };
    app.emailPhase = function(){
        app.errorMsg = false;
        $scope.nameTab = 'default';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'active';
        $scope.permissionTab = 'default';
        app.phase1 = false;
        app.phase2 = true;
        app.phase3 = false;
        app.phase4 = false;
    };
    app.usernamePhase = function(){
        app.errorMsg = false;
        $scope.nameTab = 'default';
        $scope.usernameTab = 'active';
        $scope.emailTab = 'default';
        $scope.permissionTab = 'default';
        app.phase1 = false;
        app.phase2 = false;
        app.phase3 = true;
        app.phase4 = false;
    };
    app.permissionPhase = function(){
        app.errorMsg = false;
        $scope.nameTab = 'default';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'default';
        $scope.permissionTab = 'active';
        app.phase1 = false;
        app.phase2 = false;
        app.phase3 = false;
        app.phase4 = true;

        app.disableUser = false;
        app.disableModerator = false;
        app.disableAdmin = false;

        if($scope.newPermission == 'user'){
            app.disableUser = true;
        }else if($scope.newPermission == 'moderator'){
            app.disableModerator = true;
        }else if($scope.newPermission = 'admin'){
            app.disableAdmin = true;
        }
    };
    // Update Name section
    app.updateName = function(newName, valid){
        app.errorMsg = false;
        app.disabled = true;
        var userObject = {};

        if(valid){
            userObject._id = app.currentUser;
            userObject.name = $scope.newName;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message
                    $timeout(function(){
                        app.nameForm.name.$setPristine();
                        app.nameForm.name.$setUntouched();
                        app.successMsg = "";
                        app.disabled = false;
                    }, 2000)
                }else{
                    app.errorMsg = data.data.message
                    app.disabled = false;
                }

            })

        }else{
            app.errorMsg = 'Please ensure form is filled out properly'
            app.disabled = false;
        }
    }

    //Checking email
    app.checkEmail = function(newEmail){
        //console.log($scope.oldEmail)
      
            app.emailMsg = false;
            app.emailInvalid = false;
            var regData = {}
            regData.email = newEmail;
        if($scope.oldEmail.toLowerCase() != newEmail.toLowerCase()){
            User.checkEmail(regData).then(function(data){
                if(data.data.success){
                    app.emailInvalid = false;
                    app.emailMsg = data.data.message;
                    app.disabled = false;
                }else{
                    app.emailInvalid = true;
                    app.emailMsg = data.data.message;
                    app.disabled = true;
                }
                
            })
        }else{
            app.disabled = false;
        }
    }
    // Check username duplication
    app.checkUsername = function(newUsername){

        app.usernameMsg = false;
        app.usernameInvalid = false;
        var regData = {}
        regData.username = newUsername;
        if($scope.oldUsername.toLowerCase() != newUsername.toLowerCase()){
            User.checkUsername(regData).then(function(data){
                if(data.data.success){
                    app.usernameInvalid = false;
                    app.usernameMsg = data.data.message;
                    app.disabled = false;
                }else{
                    app.usernameInvalid = true;
                    app.usernameMsg = data.data.message;
                    app.disabled = true;
                }
                
            })
        }else{
            app.disabled = false;
        }
    }

    //Update Email Section
    app.updateEmail = function(newEmail, valid){
        app.errorMsg = false;
        app.disabled = true;
        var userObject = {};

        if(valid){
            userObject._id = app.currentUser;
            userObject.email = $scope.newEmail;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message
                    $timeout(function(){
                        app.emailForm.email.$setPristine();
                        app.emailForm.email.$setUntouched();
                        app.successMsg = "";
                        app.disabled = false;
                    }, 2000)
                }else{
                    app.errorMsg = data.data.message
                    app.disabled = false;
                }

            })

        }else{
            app.errorMsg = 'Please ensure form is filled out properly'
            app.disabled = false;
        }
    }

    //Update Username Section
    app.updateUsername = function(newUsername, valid){
        app.errorMsg = false;
        app.disabled = true;
        var userObject = {};

        if(valid){
            userObject._id = app.currentUser;
            userObject.username = $scope.newUsername;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message
                    $timeout(function(){
                        app.usernameForm.username.$setPristine();
                        app.usernameForm.username.$setUntouched();
                        app.successMsg = "";
                        app.disabled = false;
                    }, 2000)
                    app.usernameMsg = false;
                    app.usernameInvalid = false;
                }else{
                    app.errorMsg = data.data.message
                    app.disabled = false;
                }

            })

        }else{
            app.errorMsg = 'Please ensure form is filled out properly'
            app.disabled = false;
        }
    }
    //Update Permission Section
    app.updatePermissions = function(newPermission){
        app.errorMsg = false;
        app.disableAdmin = true;
        app.disableModerator = true;
        app.disableUser = true;
        var userObject = {};

        
        userObject._id = app.currentUser;
        userObject.permission = newPermission;
        User.editUser(userObject).then(function(data){
            if(data.data.success){
                app.successMsg = data.data.message
                $timeout(function(){                    
                    app.successMsg = "";
                    if(newPermission == 'user'){
                        $scope.newPermission = 'user';
                        app.disableUser = true;
                        app.disableModerator = false;
                        app.disableAdmin = false;
                    }else if(newPermission == 'moderator'){
                        $scope.newPermission = 'moderator';
                        app.disableModerator = true;
                        app.disableUser = false;
                        app.disableAdmin = false;
                    }else if(newPermission = 'admin'){
                        $scope.newPermission = 'admin';
                        app.disableAdmin = true;
                        app.disableModerator = false;
                        app.disableUser = false;
                    }
                }, 2000)
                app.usernameMsg = false;
                app.usernameInvalid = false;
            }else{
                app.errorMsg = data.data.message
                app.disabled = false;
            }

        })

        
    }
})