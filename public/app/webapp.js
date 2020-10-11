angular.module('userApp',['appRoutes','userControllers','userServices',
'mainController','authServices','emailController','managementController'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors')
})
