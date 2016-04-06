angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicActionSheet, $timeout, $cordovaCamera) {
})
.controller('MapCtrl', function($scope, $ionicActionSheet, $timeout, $cordovaCamera, $ionicPlatform, $ionicLoading, $compile, $ionicModal) {
  $scope.markers = JSON.parse(localStorage.getItem('savedMarkers')) || [];
  $scope.pictureModal = function(){
    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
  }

  $scope.show = function() {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Capture from Camara' },
        { text: 'Select from Gallery' }
      ],
      titleText: 'Select Image',
      buttonClicked: function(index) {
        hideSheet();
        takePicture(index);
      }
    });
  };
  function addMarkerOnPosition(item){
    var position = item.position;
    var imageURI = item.imageURI;
    var lat  = position.coords.latitude;
    var long = position.coords.longitude;
    var myLatlng = new google.maps.LatLng(lat, long);
    $scope.src = "data:image/jpeg;base64,"+imageURI;
    var contentString = '<div id="content" ng-click="pictureModal()"><img src="data:image/jpeg;base64,'+imageURI+'"></div>'
    var compiled = $compile(contentString)($scope);
    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: $scope.map,
    });
    marker.addListener('click', function() {
      infowindow.open($scope.map, marker);
    });
  }
  function takePicture(index){
    var options = {
      quality: 100,
      saveToPhotoAlbum: true,
      correctOrientation:true,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: index == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
    };
    $cordovaCamera.getPicture(options).then(function(imageURI) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var item = {
          position: position,
          imageURI: imageURI
        };
        $scope.markers.push(item);
        localStorage.setItem('savedMarkers', JSON.stringify($scope.markers));
        addMarkerOnPosition(item);

      }, function(err) {
        console.log(JSON.stringify(err));
      },{ enableHighAccuracy: true });
    }, function(err) {
      console.log(JSON.stringify(err));
    });
  }
  $ionicPlatform.ready(function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
    });

    var posOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(function (position) {
      var lat  = position.coords.latitude;
      var long = position.coords.longitude;

      var myLatlng = new google.maps.LatLng(lat, long);

      var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.SATELLITE
      };

      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      $scope.map = map;
      $ionicLoading.hide();
      for(var i = 0; i<$scope.markers.length; i++){
        addMarkerOnPosition($scope.markers[i]);
      }
    }, function(err) {
      $ionicLoading.hide();
      console.log(err);
    }, posOptions);
  });
});
