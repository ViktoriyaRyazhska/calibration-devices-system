angular
    .module('welcomeModule')
    .controller('ApplicationSendingController', ['$scope', '$q', '$state', '$http', '$log',
        'DataReceivingService', 'DataSendingService', '$stateParams', '$window', '$rootScope', '$location', '$modal', '$filter', 'toaster',

        function ($scope, $q, $state, $http, $log, dataReceivingService, dataSendingService, $stateParams, $window, $rootScope, $location, $modal, $filter, toaster) {
            $scope.isShownForm = true;
            $scope.blockSearchFunctions = false;


            $scope.createNew = function (ID) {
                $location.path('/application-sending/' + ID);
            };

            /*
             * Selected values from select will be temprorily saved here.
             * We should create model object to avoid issues with scope inheritance
             * https://github.com/angular/angular.js/wiki/Understanding-Scopes
             * */
            $scope.selectedValues = {};

            function arrayObjectIndexOf(myArray, searchTerm, property) {
                for (var i = 0, len = myArray.length; i < len; i++) {
                    if (myArray[i][property] === searchTerm) return i;
                }
                var elem = {
                    id: length,
                    designation: searchTerm
                };
                myArray.push(elem);
                return (myArray.length - 1);
            }

            if ($stateParams.verificationId) {
                dataReceivingService.getVerificationById($stateParams.verificationId).then(function (verification) {

                    $scope.verification = verification;
                    $scope.formData = {};
                    $scope.formData.lastName = $scope.verification.data.lastName;
                    $scope.formData.firstName = $scope.verification.data.firstName;
                    $scope.formData.middleName = $scope.verification.data.middleName;
                    $scope.formData.email = $scope.verification.data.email;
                    $scope.formData.phone = $scope.verification.data.phone;
                    $scope.formData.flat = $scope.verification.data.flat;
                    $scope.formData.comment = $scope.verification.data.comment;
                    $scope.defaultValue = {};
                    $scope.defaultValue.privateHouse = $scope.verification.data.flat == 0 ? true : false;
                   

                    $scope.blockSearchFunctions = true;
                    dataReceivingService.findAllRegions().then(function (respRegions) {
                        $scope.regions = respRegions.data;
                        var index = arrayObjectIndexOf($scope.regions, $scope.verification.data.region, "designation");
                        $scope.selectedValues.selectedRegion = $scope.regions[index];

                        dataReceivingService.findDistrictsByRegionId($scope.selectedValues.selectedRegion.id)
                            .then(function (districts) {
                                $scope.districts = districts.data;
                                var index = arrayObjectIndexOf($scope.districts, $scope.verification.data.district, "designation");
                                $scope.selectedValues.selectedDistrict = $scope.districts[index];

                                dataReceivingService.findLocalitiesByDistrictId($scope.selectedValues.selectedDistrict.id)
                                    .then(function (localities) {
                                        $scope.localities = localities.data;
                                        var index = arrayObjectIndexOf($scope.localities, $scope.verification.data.locality, "designation");
                                        $scope.selectedValues.selectedLocality = $scope.localities[index];

                                        dataReceivingService.findProvidersByDistrict($scope.selectedValues.selectedDistrict.designation)
                                            .then(function (providers) {
                                                $scope.providers = providers.data;
                                                var index = arrayObjectIndexOf($scope.providers, $scope.verification.data.provider, "designation");
                                                $scope.selectedValues.selectedProvider = $scope.providers[index];

                                                dataReceivingService.findStreetsByLocalityId($scope.selectedValues.selectedLocality.id)
                                                    .then(function (streets) {
                                                        $scope.streets = streets.data;
                                                        var index = arrayObjectIndexOf($scope.streets, $scope.verification.data.street, "designation");
                                                        $scope.selectedValues.selectedStreet = $scope.streets[index];

                                                        dataReceivingService.findBuildingsByStreetId($scope.selectedValues.selectedStreet.id)
                                                            .then(function (buildings) {
                                                                $scope.buildings = buildings.data;
                                                                var index = arrayObjectIndexOf($scope.buildings, $scope.verification.data.building, "designation");
                                                                $scope.selectedValues.selectedBuilding = $scope.buildings[index].designation;

                                                                dataReceivingService.findMailIndexByLocality($scope.selectedValues.selectedLocality.designation, $scope.selectedValues.selectedDistrict.id)
                                                                    .success(function (indexes) {
                                                                        $scope.indexes = indexes;
                                                                        $scope.selectedValues.selectedIndex = $scope.indexes[0];
                                                                        $scope.blockSearchFunctions = false;
                                                                    });

                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
                });
            }

            $scope.values = [1, 2, 3, 4, 5, 6];
            /**
             * Receives all possible regions.
             */

            $scope.regions = [];
            $scope.receiveRegions = function () {
                dataReceivingService.findAllRegions()
                    .success(function (regions) {
                        $scope.regions = regions;
                        $scope.selectedValues.selectedRegion = undefined; //for ui-selects
                        $scope.selectedValues.selectedDistrict = undefined;
                        $scope.selectedValues.selectedLocality = undefined;
                        $scope.selectedValues.selectedStreet = ""; //for bootstrap typeahead (ui.typeahead)
                    });
            };
            if (!$stateParams.verificationId) {
                $scope.receiveRegions();
            }


            /**
             * Receives all possible districts.
             * On-select handler in region input form element.
             */
            $scope.receiveDistricts = function (selectedRegion) {
                if (!$scope.blockSearchFunctions) {
                    $scope.districts = [];
                    dataReceivingService.findDistrictsByRegionId(selectedRegion.id)
                        .success(function (districts) {
                            $scope.districts = districts;
                            $scope.selectedValues.selectedDistrict = undefined;
                            $scope.selectedValues.selectedLocality = undefined;
                            $scope.selectedValues.selectedStreet = "";
                        });
                }
            };
            /**
             * Receives all possible localities.
             * On-select handler in district input form element.
             */
            $scope.receiveLocalitiesAndProviders = function (selectedDistrict) {
                if (!$scope.blockSearchFunctions) {
                    $scope.localities = [];
                    dataReceivingService.findLocalitiesByDistrictId(selectedDistrict.id)
                        .success(function (localities) {
                            $scope.localities = localities;
                            $scope.selectedValues.selectedLocality = undefined;
                            $scope.selectedValues.selectedIndex = undefined;
                            $scope.selectedValues.selectedStreet = "";

                        });

                    /**
                     *  Receives providers corresponding this district
                     */

                    dataReceivingService.findProvidersByDistrict(selectedDistrict.designation)
                        .success(function (providers) {

                            $scope.providers = providers;
                            $scope.selectedValues.selectedProvider = providers[0];


                        });
                }
            };


            /**
             * Receives all possible streets.
             * On-select handler in locality input form element
             */
            $scope.streetsTypes = [];
            $scope.selectedStreetType = "";

            dataReceivingService.findStreetsTypes()
                .success(function (streetsTypes) {
                    $scope.streetsTypes = streetsTypes;
                    $scope.selectedValues.selectedStreetType = undefined;
                    $log.debug("$scope.streetsTypes");
                    $log.debug($scope.streetsTypes);

                });


            $scope.receiveStreets = function (selectedLocality, selectedDistrict) {
                if (!$scope.blockSearchFunctions) {
                    $scope.streets = [];
                    dataReceivingService.findStreetsByLocalityId(selectedLocality.id)
                        .success(function (streets) {
                            $scope.streets = streets;
                            $scope.selectedValues.selectedStreet = undefined;
                            $log.debug("$scope.streets");
                            $log.debug($scope.streets);

                        });

                    $scope.indexes = [];
                    dataReceivingService.findMailIndexByLocality(selectedLocality.designation, selectedDistrict.id)
                        .success(function (indexes) {
                            $scope.indexes = indexes;
                            if (indexes.length > 0) {
                                $scope.selectedValues.selectedIndex = indexes[0];
                            }
                            $log.debug("$scope.indexes");
                            $log.debug($scope.indexes);

                        });
                }
            };
            /**
             * Receives all possible buildings.
             * On-select handler in street input form element.
             */
            $scope.receiveBuildings = function (selectedStreet) {
                if (!$scope.blockSearchFunctions) {
                    $scope.buildings = [];
                    dataReceivingService.findBuildingsByStreetId(selectedStreet.id)
                        .success(function (buildings) {
                            $scope.buildings = buildings;
                        });
                }
            };
            /**
             * Receives all possible devices.
             */
            $scope.devices = [];

            $scope.firstDeviceCount = undefined;
            $scope.selectedValues.secondDeviceCount = undefined;
            $scope.selectedValues.thirdDeviceCount = undefined;

            dataReceivingService.findAllDevices()
                .success(function (devices) {
                    $scope.devices = devices;
                    $scope.selectedValues.firstSelectedDevice = undefined;
                    $scope.selectedValues.secondSelectedDevice = undefined;
                    $scope.selectedValues.thirdSelectedDevice = undefined;
                });


            /**
             *  Check if all devices were selected
             */
            $scope.deviceErrorCheck = function () {
                if ($scope.firstDeviceCount !== undefined) {
                    $scope.clientForm.firstDeviceCount.$invalid = false;
                }
                if ($scope.selectedValues.firstSelectedDevice == undefined) {
                    $scope.clientForm.firstSelectedDevice.$invalid = true;
                    $scope.clientForm.firstDeviceCount.$invalid = true;
                }

                if (($scope.selectedValues.secondDeviceCount !== undefined) || ($scope.selectedValues.secondDeviceCount === undefined)) {
                    $scope.clientForm.secondDeviceCount.$invalid = false;
                }
                if ($scope.selectedValues.secondSelectedDevice == undefined) {
                    $scope.clientForm.secondSelectedDevice.$invalid = true;
                    $scope.clientForm.secondDeviceCount.$invalid = true;
                }

                if (($scope.selectedValues.thirdDeviceCount !== undefined) || ($scope.selectedValues.thirdDeviceCount == undefined)) {
                    $scope.clientForm.thirdDeviceCount.$invalid = false;
                }
                if ($scope.selectedValues.thirdSelectedDevice == undefined) {
                    $scope.clientForm.thirdSelectedDevice.$invalid = true;
                    $scope.clientForm.thirdDeviceCount.$invalid = true;
                }
            };

            /**
             * Sends data to the server where Verification entity will be created.
             * On-click handler in send button.
             */
            $log.debug("$scope.devices");
            $log.debug($scope.devices);
            $scope.firstAplicationCodes = [];
            $scope.secondAplicationCodes = [];
            $scope.thirdAplicationCodes = [];

            $scope.allSelectedDevices = [];
            $scope.appProgress = false;
            $scope.deviceShowError = false;

            $scope.changeFlat = function () {
                $scope.$watch('formData', function (formData) {
                    if (formData) {
                        formData.flat = 0;
                    }
                });
            };

            $scope.sendApplicationData = function () {
                $scope.codes = [];

                $scope.deviceErrorCheck();

                $scope.$broadcast('show-errors-check-validity');
                if ($scope.clientForm.$valid) {
                    $scope.isShownForm = false;
                    $scope.appProgress = true;

                    $scope.formData.region = $scope.selectedValues.selectedRegion.designation;
                    $scope.formData.district = $scope.selectedValues.selectedDistrict.designation;
                    $scope.formData.locality = $scope.selectedValues.selectedLocality.designation;
                    $scope.formData.street = $scope.selectedValues.selectedStreet.designation || $scope.selectedValues.selectedStreet;
                    $scope.formData.building = $scope.selectedValues.selectedBuilding.designation || $scope.selectedValues.selectedBuilding;
                    $scope.formData.providerId = $scope.selectedValues.selectedProvider.id;
                    for (var i = 0; i < $scope.selectedValues.firstDeviceCount; i++) {
                        $scope.formData.deviceId = $scope.selectedValues.firstSelectedDevice.id;
                        $scope.firstAplicationCodes.push(dataSendingService.sendApplication($scope.formData))
                    }
                    $q.all($scope.firstAplicationCodes).then(function (values) {
                        for (var i = 0; i < ($scope.selectedValues.firstDeviceCount); i++) {
                            $scope.codes.push(values[i].data);

                        }
                        for (var i = 0; i < $scope.selectedValues.secondDeviceCount; i++) {
                            $scope.formData.deviceId = $scope.selectedValues.secondSelectedDevice.id;
                            $scope.secondAplicationCodes.push(dataSendingService.sendApplication($scope.formData))
                        }
                        $q.all($scope.secondAplicationCodes).then(function (values) {
                            for (var i = 0; i < $scope.selectedValues.secondDeviceCount; i++) {
                                $scope.codes.push(values[i].data);

                            }
                            for (var i = 0; i < $scope.selectedValues.thirdDeviceCount; i++) {
                                $scope.formData.deviceId = $scope.selectedValues.thirdSelectedDevice.id;
                                $scope.thirdAplicationCodes.push(dataSendingService.sendApplication($scope.formData))
                            }

                            $q.all($scope.thirdAplicationCodes).then(function (values) {
                                for (var i = 0; i < $scope.selectedValues.thirdDeviceCount; i++) {
                                    $scope.codes.push(values[i].data);
                                }
                                $scope.appProgress = false;
                            });
                        });
                    });
                    $log.debug(" $scope.codeslength");
                    $log.debug($scope.codes.length);
                }
            };
            $scope.closeAlert = function () {
                $location.path('/resources/app/welcome/views/start.html');
            };

            /**
             * Receives all regex for input fields
             *
             *
             */

            $scope.STREET_REGEX = /^[a-z\u0430-\u044f\u0456\u0457]{1,20}\s([A-Z\u0410-\u042f\u0407\u0406]{1}[a-z\u0430-\u044f\u0456\u0457\u0454]{1,20}\u002d{1}[A-Z\u0410-\u042f\u0407\u0406\u0454]{1}[a-z\u0430-\u044f\u0456\u0457\u0454]{1,20}|[A-Z\u0410-\u042f\u0407\u0406\u0454]{1}[a-z\u0430-\u044f\u0456\u0457\u0454]{1,20}){1}$/;
            $scope.FIRST_LAST_NAME_REGEX = /^([A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20}\u002d{1}[A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20}|[A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20})$/;
            $scope.MIDDLE_NAME_REGEX = /^[A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20}$/;
            $scope.FLAT_REGEX = /^([1-9]{1}[0-9]{0,3}|0)$/;
            $scope.BUILDING_REGEX = /^[1-9]{1}[0-9]{0,3}([A-Za-z]|[\u0410-\u042f\u0407\u0406\u0430-\u044f\u0456\u0457]){0,1}$/;
            $scope.PHONE_REGEX = /^[1-9]\d{8}$/;
            $scope.PHONE_REGEX_SECOND = /^[1-9]\d{8}$/;
            $scope.EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
            $scope.checkboxModel = false;
            $scope.isSecondDevice = false;
            $scope.isThirdDevice = false;
            /**
             * Modal window used to send questions to administration
             */
            $scope.responseSuccess = false;
            $scope.showSendingAlert = false;
            $scope.feedbackModalNoProvider = function () {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '/resources/app/welcome/views/modals/feedBackWindow.html',
                    controller: 'FeedbackController',
                    size: 'md'

                });

                /**
                 * executes when modal closing
                 */

                $scope.pop = function(){
                    toaster.pop('success', "\u0406\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F", "\u0412\u0430\u0448\u0435 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u0431\u0443\u043B\u043E \u0443\u0441\u043F\u0456\u0448\u043D\u043E \u043D\u0430\u0434\u0456\u0441\u043B\u0430\u043D\u043E");
                };

                modalInstance.result.then(function (formData, sendingStarted) {
                    var messageToSend = {
                        verifID: $filter('translate')('NOTFOUND_TRANSLATION'),
                        msg: formData.message,
                        name: formData.firstName,
                        surname: formData.lastName,
                        email: formData.email
                    };
                    var idInfo = function () {
                        return $filter('translate')('PHONE')
                    };
                    $scope.showSendingAlert = true;
                    dataSendingService.sendMailNoProvider(messageToSend)
                        .success(function () {
                            $scope.responseSuccess = true;
                            $scope.showSendingAlert = false;
                            $log.debug('response val');
                            $log.debug($scope.responseSuccess);
                        });
                    $scope.pop();
                });

            };

            $scope.closeAlertW = function () {
                $scope.responseSuccess = false;
                $scope.showSendingAlert = false;
            };

            /**
             * Resets form
             */
            $scope.resetApplicationForm = function () {
              
                $scope.$broadcast('show-errors-reset');
               
                $scope.clientForm.$setPristine();
                $scope.clientForm.$setUntouched();
             
                $scope.formData = null;

                $scope.selectedValues.firstSelectedDevice = undefined;
                $scope.selectedValues.secondSelectedDevice = undefined;
                $scope.selectedValues.thirdSelectedDevice = undefined;

                $scope.selectedValues.firstDeviceCount = undefined;
                $scope.selectedValues.secondDeviceCount = undefined;
                $scope.selectedValues.thirdDeviceCount = undefined;
                
                $scope.selectedValues.selectedRegion = undefined;
                $scope.selectedValues.selectedDistrict = undefined;
                $scope.selectedValues.selectedLocality = undefined;
                $scope.selectedValues.selectedStreetType = undefined;
                $scope.selectedValues.selectedStreet = "";
                $scope.selectedValues.selectedBuilding = "";
                $scope.selectedValues.selectedIndex = undefined;
                $scope.defaultValue.privateHouse = false;
                $log.debug("$scope.resetApplicationForm");
            };

            $scope.$watch('selectedValues.selectedRegion', function () {
                $scope.selectedValues.selectedDistrict = undefined;
                $scope.selectedValues.selectedLocality = undefined;
                $scope.selectedValues.selectedIndex = undefined;
                $scope.selectedValues.selectedStreetType = undefined;
                $scope.selectedValues.selectedStreet = "";
            });

            $scope.$watch('selectedValues.selectedDistrict', function () {
                $scope.selectedValues.selectedLocality = undefined;
                $scope.selectedValues.selectedIndex = undefined;
                $scope.selectedValues.selectedStreetType = undefined;
                $scope.selectedValues.selectedStreet = "";
            });

            $scope.$watch('selectedValues.selectedLocality', function () {
                $scope.selectedValues.selectedIndex = undefined;
                $scope.selectedValues.selectedStreetType = undefined;
                $scope.selectedValues.selectedStreet = "";
            });

            //$scope.$watch('selectedValues.selectedIndex', function () {
            //    $scope.selectedValues.selectedStreetType = undefined;
            //    $scope.selectedValues.selectedStreet = "";
            //});

        }]);
