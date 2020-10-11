angular.module('userControllers',['userServices'])

.controller('regCtrl', function($http, $location, $timeout,User){
    
    var app = this;

    this.regUser = function(regData, valid){
        app.loading = true;
        app.errorMsg = false;
        // console.log('Form Submitted');
        // console.log(this.regData);
       if(valid){
            User.create(app.regData).then(function(data){
               // console.log(data.data.success);
                if(data.data.success){
                    app.loading = false;
                    app.successMsg = data.data.message;
                    $timeout(function(){
                        $location.path('/');
                    }, 2000)
                    
                }else{
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
            })
       }else{
            app.loading = false;
            app.errorMsg = "Please ensure form filled correctly!!!";
       }
    }

    this.checkUsername = function(regData){

        app.usernameMsg = false;
        app.usernameInvalid = false;

        User.checkUsername(app.regData).then(function(data){
            if(data.data.success){
                app.usernameInvalid = false;
                app.usernameMsg = data.data.message;
            }else{
                app.usernameInvalid = true;
                app.usernameMsg = data.data.message;
            }
            
        })
    }

    this.checkEmail = function(regData){

        app.emailMsg = false;
        app.emailInvalid = false;

        User.checkEmail(app.regData).then(function(data){
            if(data.data.success){
                app.emailInvalid = false;
                app.emailMsg = data.data.message;
            }else{
                app.emailInvalid = true;
                app.emailMsg = data.data.message;
            }
            
        })
    }

    
})

.directive('match', function(){
    return {
        restrict : 'A',
        controller : function($scope){

            $scope.confirmed = false

            $scope.doConfirm = function(values){
                values.forEach(function(ele){

                    if($scope.confirm == ele){
                        $scope.confirmed = true
                    }else{
                        $scope.confirmed = false
                    }
                    
                })
                
            }
        },
        link : function(scope, element, attr){

            attr.$observe('match', function(){
                scope.matches = JSON.parse(attr.match)
                scope.doConfirm(scope.matches);
            })

            scope.$watch('confirm', function(){
                scope.matches = JSON.parse(attr.match)
                scope.doConfirm(scope.matches);
            })
        }
    }
})