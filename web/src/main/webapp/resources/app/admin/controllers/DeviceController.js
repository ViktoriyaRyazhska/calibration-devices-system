angular
    .module('adminModule')
    .controller('DeviceController', ['$scope', '$http', 'DevicesService',
        function ($scope, $http, devicesService) {
            $scope.totalItems = 0;
            $scope.currentPage = 1;
            $scope.itemsPerPage = 5;
            $scope.pageContent = [];
           /* $scope.typeData = [
                {type: 'PROVIDER', name: 'Постачальник послуг'},
                {type: 'CALIBRATOR', name: 'Повірочна організація'},
                {type: 'STATE_VERIFICATION', name: 'Державний повірник'}
            ];

            /**
             * Updates the table with device.
             */
            $scope.onTableHandling = function () {
                devicesService
                    .getPage($scope.currentPage, $scope.itemsPerPage, $scope.searchData)
                    .then(function (data) {
                        $scope.pageContent = data.content;
                        $scope.totalItems = data.totalItems;
                    });
            };

            $scope.onTableHandling();
    }]);