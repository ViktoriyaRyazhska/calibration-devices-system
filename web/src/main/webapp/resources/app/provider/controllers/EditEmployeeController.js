angular
    .module('employeeModule')
    .controller('EditEmployeeController', ['$rootScope', '$scope', '$modalInstance', '$log', '$state', '$http', 'UserService'/*, 'AddressServiceProvider'*/,

        function ($rootScope, $scope, $modalInstance, $log, $state, $http, userService /*addressServiceProvider*/) { //очікую що пройде апдейт без проблем
            var organizationTypeProvider = false;
            var organizationTypeCalibrator = false;
            var organizationTypeVerificator = false;
            var employeeData = {};

            /**
             * Closes modal window on browser's back/forward button click.
             */
            $rootScope.$on('$locationChangeStart', function () {
                $modalInstance.close();
            });

            $scope.$on('info_about_editUser', function (event, args) {

                for (var i = 0; i < args.roles.length; i++) {
                    if (args.roles[i] === 'PROVIDER_EMPLOYEE') {
                        $scope.selectedEmployee.push('PROVIDER_EMPLOYEE');
                        organizationTypeProvider = true;
                    }
                    if (args.roles[i] === 'CALIBRATOR_EMPLOYEE') {
                        $scope.selectedEmployee.push('CALIBRATOR_EMPLOYEE');
                        organizationTypeCalibrator = true;
                    }
                    if (args.roles[i] === 'STATE_VEREFICATOR_EMPLOYEE') {
                        $scope.selectedEmployee.push('STATE_VEREFICATOR_EMPLOYEE');
                        organizationTypeVerificator = true;
                    }
                }


                if (args.isAvaliable == true) {
                    $scope.showRestore = false;
                } else {
                    $scope.showRestore = true;
                }


            });

            userService.isAdmin()
                .success(function (response) {
                    var includeCheckBox = false;
                    var thereIsAdmin = 0;
                    var roles = response + '';
                    var role = roles.split(',');
                    for (var i = 0; i < role.length; i++) {
                        if (role[i] === 'PROVIDER_ADMIN' || role[i] === 'CALIBRATOR_ADMIN' || role[i] === 'STATE_VERIFICATOR_ADMIN')
                            thereIsAdmin++;
                    }
                    if (thereIsAdmin === 0) {
                        $scope.accessLable = true;
                    } else {
                        $scope.verificator = true;
                    }
                    if (thereIsAdmin === 1) {
                        if (role[0] === 'PROVIDER_ADMIN')
                            organizationTypeProvider = true;
                        if (role[0] === 'CALIBRATOR_ADMIN')
                            organizationTypeCalibrator = true;
                        if (role[0] === 'STATE_VERIFICATOR_ADMIN')
                            organizationTypeVerificator = true;
                    }
                    if (thereIsAdmin > 1) {
                        $scope.showListOfOrganization = true;
                        for (var i = 0; i < role.length; i++) {
                            if ((role[0] === 'PROVIDER_ADMIN' && role[1] === 'CALIBRATOR_ADMIN') ||
                                (role[0] === 'CALIBRATOR_ADMIN' && role[1] === 'PROVIDER_ADMIN'))
                                $scope.showListOfOrganizationChosenOne = true;
                            if ((role[0] === 'STATE_VERIFICATOR_ADMIN' && role[1] === 'CALIBRATOR_ADMIN') ||
                                (role[0] === 'CALIBRATOR_ADMIN' && role[1] === 'STATE_VERIFICATOR_ADMIN'))
                                $scope.showListOfOrganizationChosenTwo = true;
                        }
                    }
                });

            /**
             * Choose role of employee
             * @param selectedEmployee
             */
            $scope.choose = function (selectedEmployee) {
                organizationTypeProvider = false;
                organizationTypeCalibrator = false;
                organizationTypeVerificator = false;
                employee = selectedEmployee + '';
                var resaultEmployee = employee.split(',');
                for (var i = 0; i < resaultEmployee.length; i++) {
                    if (resaultEmployee[i] === 'PROVIDER_EMPLOYEE') {
                        organizationTypeProvider = true;
                    }
                    if (resaultEmployee[i] === 'CALIBRATOR_EMPLOYEE') {
                        organizationTypeCalibrator = true;
                    }
                    if (resaultEmployee[i] === 'STATE_VERIFICATOR_EMPLOYEE') {
                        organizationTypeVerificator = true
                    }
                }
            }

            $scope.regions = null;
            $scope.districts = [];
            $scope.localities = [];
            $scope.streets = [];
            $scope.buildings = [];
            $scope.employeeFormData = {};
            $scope.selectedEmployee = [];

            /**
             * Change password
             */
            $scope.changePassword = function () {
                //$scope.preventDefault();
                $scope.user.password = 'generate';
                $scope.generationMessage = true;
            }


            /**
             * Check passwords for equivalent
             */

            $scope.checkPasswords = function () {
                var first = $scope.employeeFormData.password;
                var second = $scope.employeeFormData.rePassword;
                $log.info(first);
                $log.info(second);
                var isValid = false;
                if (first != second) {
                    isValid = true;
                }
                $scope.passwordValidation = {
                    isValid: isValid,
                    css: isValid ? 'has-error' : 'has-success'
                }
            };


            function arrayObjectIndexOf(myArray, searchTerm, property) {
                for (var i = 0, len = myArray.length; i < len; i++) {
                    if (myArray[i][property] === searchTerm) return i;
                }
                var elem = {
                    id: length,
                    designation: searchTerm
                }
                myArray.push(elem);
                return (myArray.length - 1);
            }

            /**
             * Finds all regions
             */
            //addressServiceProvider.findAllRegions().then(
            //     function (data) {
            //         $scope.regions = data.data;
            //         var index = arrayObjectIndexOf($scope.regions,  $scope.user.address.region, "designation");
            //         $scope.employeeFormData.region = $scope.regions[index];
            //         $scope.onRegionSelected($scope.regions[index].id);
            //     });

            /**
             * Finds districts in a given region.
             * @param regionId
             *            to identify region
             */
            //$scope.onRegionSelected = function (regionId) {
            //    addressServiceProvider
            //        .findDistrictsByRegionId(regionId)
            //        .then(function (data) {
            //            $scope.districts = data.data;
            //            var index = arrayObjectIndexOf($scope.districts,  $scope.user.address.district, "designation");
            //            $scope.employeeFormData.district = $scope.districts[index];
            //            $scope.onDistrictSelected($scope.districts[index].id);
            //        });
            //};

            /**
             * Finds localities in a given district.
             * @param districtId
             *            to identify district
             */
            //$scope.onDistrictSelected = function (districtId) {
            //    addressServiceProvider.findLocalitiesByDistrictId(
            //        districtId).then(function (data) {
            //            $scope.localities = data.data;
            //            var index = arrayObjectIndexOf($scope.localities,  $scope.user.address.locality, "designation");
            //            $scope.employeeFormData.locality = $scope.localities[index];
            //        });
            //};

            /**
             * There are no DB records for this methods.
             * Finds streets in a given locality.
             *
             * @param localityId
             *            to identify locality
             */
            //$scope.onLocalitySelected = function (localityId) {
            //    addressServiceProvider.findStreetsByLocalityId(
            //        localityId).then(function (data) {
            //            $scope.streets = data.data;
            //        });
            //};

            /**
             * Finds buildings in a given street.
             * @param streetId
             *            to identify street
             */
            //$scope.onStreetSelected = function (streetId) {
            //    addressServiceProvider
            //        .findBuildingsByStreetId(streetId)
            //        .then(function (data) {
            //            $scope.buildings = data.data;
            //        });
            //};


            //
            //function addressFormToOrganizationForm() {
            //      $scope.user.address.region = $scope.user.address.region.designation;
            //      $scope.user.address.district = $scope.user.address.district.designation;
            //      $scope.user.address.locality = $scope.user.address.locality.designation;
            //      $scope.user.address.street = $scope.user.address.street;
            //      $scope.user.address.building = $scope.user.address.building;
            //      $scope.user.address.flat = $scope.user.address.flat;
            //    }


            /**
             * Refactor data
             */
            function retranslater() {
                employeeData = {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    middleName: $scope.user.middleName,
                    phone: $scope.user.phone,
                    email: $scope.user.email,
                    username: $scope.user.username,
                    password: $scope.user.password,

                    userRoles: [],
                    isAvaliable: true

                }

                //employeeData.address = {
                //    region:  $scope.employeeFormData.region.designation,
                //    district: $scope.employeeFormData.district.designation,
                //    locality: $scope.employeeFormData.locality.designation,
                //    street: $scope.user.address.street,
                //    building: $scope.user.address.building,
                //    flat: $scope.user.address.flat
                //}

                if (organizationTypeProvider === true) {
                    employeeData.userRoles.push('PROVIDER_EMPLOYEE');
                }
                if (organizationTypeCalibrator === true) {
                    employeeData.userRoles.push('CALIBRATOR_EMPLOYEE');
                }
                if (organizationTypeVerificator === true) {
                    employeeData.userRoles.push('STATE_VERIFICATOR_EMPLOYEE');
                }

            }

            /*
             Fire employee
             */
            $scope.fireEmployee = function (action) {
                if (action === 'fire') {
                    $scope.showRestore = true;
                    employeeData.isAvaliable = false;
                    updateEmployee();
                } else {
                    $scope.showRestore = false;
                }

            }


            $scope.onEmployeeFormSubmit = function () {

                $scope.$broadcast('show-errors-check-validity');
                retranslater();
                updateEmployee();

                $scope.incorrectValue = true;


            };

            /**
             * Update new employee in database.
             */
            function updateEmployee() {
                userService.updateUser(
                    employeeData).then(
                    function (data) {
                        if (data.status == 201) {
                            $rootScope.$broadcast('new-employee-added');
                            $scope.closeModal();
                        } else {
                            alert('Error');
                        }
                    });
            };


            /* Closes the modal window
             */
            $rootScope.closeModal = function () {
                $modalInstance.close();
            };
            $scope.FIRST_LAST_NAME_REGEX = /^([A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20}\u002d{1}[A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20}|[A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20})$/;
            $scope.MIDDLE_NAME_REGEX = /^[A-Z\u0410-\u042f\u0407\u0406\u0404']{1}[a-z\u0430-\u044f\u0456\u0457\u0454']{1,20}$/;
            $scope.PNOHE_REGEX_MY = /^[1-9]\d{8}$/;
            $scope.PHONE_REGEX = /^[1-9]\d{8}$/;
            $scope.EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
            //   $log.info(employeeFormData);

        }]);
