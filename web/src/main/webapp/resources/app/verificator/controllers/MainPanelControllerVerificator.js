angular
    .module('employeeModule')
    .controller('MainPanelControllerVerificator', ['$rootScope', '$scope', '$log','VerificationServiceVerificator','ngTableParams','$modal', 'UserServiceVerificator', '$controller', '$filter', '$translate',
        function ($rootScope, $scope, $log, verificationServiceVerificator, ngTableParams, $modal, userServiceVerificator, $controller, $filter, $translate) {
    		$log.debug('inside main panel contr calibr');

            /**
             *  Date picker and formatter setup
             *
             */
            $scope.toMaxDate = new Date();

            $scope.myDatePicker = {};
            $scope.myDatePicker.pickerDate = null;
            $scope.defaultDate = null;

            $scope.initDatePicker = function (date) {

                $scope.myDatePicker.pickerDate = {
                    startDate: moment().startOf('year'),
                    endDate: moment().endOf('year')
                };

                if ($scope.defaultDate == null) {
                    //copy of original daterange
                    $scope.defaultDate = angular.copy($scope.myDatePicker.pickerDate);
                }

                $scope.setTypeDataLangDatePicker = function () {
                    var lang = $translate.use();
                    if (lang === 'ukr') {
                        moment.locale('uk'); //setting locale for momentjs library (to get monday as first day of the week in ranges)
                    } else {
                        moment.locale('en'); //setting locale for momentjs library (to get monday as first day of the week in ranges)
                    }
                    $scope.opts = {
                        format: 'DD-MM-YYYY',
                        showDropdowns: true,
                        locale: {
                            firstDay: 1,
                            fromLabel: $filter('translate')('FROM_LABEL'),
                            toLabel: $filter('translate')('TO_LABEL'),
                            applyLabel: $filter('translate')('APPLY_LABEL'),
                            cancelLabel: $filter('translate')('CANCEL_LABEL'),
                            customRangeLabel: $filter('translate')('CUSTOM_RANGE_LABEL')
                        },
                        ranges: {},
                        eventHandlers: {}
                    };
                };

                $scope.setTypeDataLanguage = function () {
                    $scope.setTypeDataLangDatePicker();
                };

                $scope.setTypeDataLanguage();
            };

            $scope.showPicker = function ($event) {
                angular.element("#datepickerfield").trigger("click");
            };

            $scope.isDateDefault = function () {
                var pickerDate = $scope.myDatePicker.pickerDate;

                if (pickerDate == null || $scope.defaultDate == null) { //moment when page is just loaded
                    return true;
                }
                if (pickerDate.startDate.isSame($scope.defaultDate.startDate, 'day') //compare by day
                    && pickerDate.endDate.isSame($scope.defaultDate.endDate, 'day')) {
                    return true;
                }
                return false;
            };

            $scope.clearDate = function () {
                //daterangepicker doesn't support null dates
                $scope.myDatePicker.pickerDate = $scope.defaultDate;
            };

            $scope.initDatePicker();
    		
    		/**
             * Redraw charts on language change
             */
            $rootScope.$on('$translateChangeEnd', function(event){
                $scope.setTypeDataLanguage();
            	verificator();
            });
    		
    		
    		/**
             * Role
             */

                var organizationTypeProvider = false;
                var organizationTypeCalibrator = false;
                var organizationTypeVerificator = false;
                var thereIsProvider = 0;
                var thereIsCalibrator = 0;
                var thereIsStateVerificator = 0;

                userServiceVerificator.isAdmin()
                    .success(function (response) {
                        var roles = response + '';
                        var role = roles.split(',');
                        for (var i = 0; i < role.length; i++) {
                            if (role[i] === 'PROVIDER_ADMIN' || role[i] === 'PROVIDER_EMPLOYEE')
                                thereIsProvider++;
                            if (role[i] === 'CALIBRATOR_ADMIN' || role[i] === 'CALIBRATOR_EMPLOYEE')
                            	thereIsCalibrator++;   
                            if (role[i] === 'STATE_VERIFICATOR_ADMIN' || role[i] === 'STATE_VERIFICATOR_EMPLOYEE')
                                thereIsStateVerificator++;
                            if (thereIsProvider > 0)
                                $scope.providerViews = true;
                            if (thereIsCalibrator > 0) {
                            	$scope.calibratorViews = true;
                            }
                            if (thereIsStateVerificator > 0)
                                $scope.stateVerificatorViews = true;
                                verificator();
                        }
                    });


                /**
                 * Graph of verifications
                 */
                var me = $scope;
                $controller('GraphicEmployeeVerificatorMainPanel', {
                    $scope: $scope
                });

                $scope.formattedDate = null;
                $scope.fcalendar = null;
                $scope.acalendar = null;
                var date1 = new Date(new Date().getFullYear(), 0, 1);
                var date2 = new Date();
                $scope.dataToSearch = {
                    fromDate: date1,
                    toDate: date2
                };


                $scope.cancel = function () {
                    $modal.dismiss();
                };

                $scope.showGrafic = function () {         	              	
	                    var dataToSearch = {
                            fromDate: $scope.changeDateToSend($scope.myDatePicker.pickerDate.startDate.format("YYYY-MM-DD")),
                            toDate: $scope.changeDateToSend($scope.myDatePicker.pickerDate.endDate.format("YYYY-MM-DD"))
	                    };
	                    userServiceVerificator.getGraficDataMainPanel(dataToSearch)
	                        .success(function (data) {
	                            return me.displayGrafic(data);
	                        });
                };
                
                $scope.changeDateToSend = function (value) {
                    if ($scope.myDatePicker.pickerDate.endDate.format("YYYY-MM-DD") != null) {
                        $scope.fromMaxDate = $scope.myDatePicker.pickerDate.endDate.format("YYYY-MM-DD");
                    } else {
                        $scope.fromMaxDate = new Date();
                    }

                    $scope.toMinDate = $scope.myDatePicker.pickerDate.startDate.format("YYYY-MM-DD");
                    if (angular.isUndefined(value)) {
                        return null;

                    } else {

                        return $filter('date')(value, 'dd-MM-yyyy');
                    }
                };
                
                var verificator = function() {
                    $scope.showGrafic();
                    $scope.showGraficTwo();
                };
                
                /**
                 * Pie of sent and accepted
                 */
                var mo = $scope;
                $controller('PieVerificatorEmployee', {
                    $scope: $scope
                });


                $scope.showGraficTwo = function () {
                    userServiceVerificator.getPieDataMainPanel()
                        .success(function (data) {
                            return mo.displayGraficPipe(data);
                        });
                };

            $scope.checkIfNewVerificationsAvailable = function () {
                return $scope.resultsCount != 0;

            };
                /**
                 * Table of unread verifications
                 */
                $scope.tableParamsVerifications = new ngTableParams({
                    page: 1,
                    count: 5
                }, {
                    total: 0,
                    getData: function ($defer, params) {

                        verificationServiceVerificator.getNewVerificationsForMainPanel(params.page(), params.count(), $scope.search)
                            .success(function (result) {
                                $scope.resultsCount = result.totalItems;
                                $defer.resolve(result.content);
                                params.total(result.totalItems);
                            }, function (result) {
                                $log.debug('error fetching data:', result);
                            });
                    }
                });

            $scope.addVerificatorEmployee = function (verifId, verificatorEmployee) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'resources/app/verificator/views/employee/assigning-verificatorEmployee.html',
                    controller: 'VerificatorEmployeeControllerVerificator',
                    size: 'md',
                    windowClass: 'xx-dialog',
                    resolve: {
                        verificatorEmployee: function () {
                            return verificationServiceVerificator.getVerificators()
                                .success(function (verificators) {
                                    return verificators;
                                }
                            );
                        }
                    }
                });
                    /**
                     * executes when modal closing
                     */
                    modalInstance.result.then(function (formData) {
                        idVerification = 0;
                        var dataToSend = {
                            idVerification: verifId,
                            employeeVerificator: formData.provider
                        };
                        $log.info(dataToSend);
                        verificationServiceVerificator
                            .sendEmployeeVerificator(dataToSend)
                            .success(function () {
                                $scope.tableParamsVerifications.reload();
                                $scope.tableParamsEmployee.reload();
                                $scope.showGraficTwo();
                            });
                    });
                };
                
                /**
                 * Table of employee
                 */
                $scope.tableParamsEmployee = new ngTableParams({
                    page: 1,
                    count: 5,
                    sorting: {
                        lastName: 'asc'     // initial sorting
                    },
                }, {
                    total: 0,
                    getData: function ($defer, params) {
                        userServiceVerificator.getPage(params.page(), params.count(), params.filter(), params.sorting())
                            .success(function (result) {
                                $scope.totalEmployee = result.totalItems;
                                $defer.resolve(result.content);
                                params.total(result.totalItems);
                            }, function (result) {
                                $log.debug('error fetching data:', result);
                            });
                    }
                });

                $scope.showCapacity = function (username) {

                    $modal.open({
                        animation: true,
                        templateUrl: 'resources/app/verificator/views/employee/capacity-verificatorEmployee.html',
                        controller: 'CapacityEmployeeControllerVerificator',
                        size: 'lg',
                        resolve: {

                            capacity: function () {
                                return userServiceVerificator.getCapacityOfWork(username)
                                    .success(function (verifications) {
                                        return verifications;
                                    });
                            }
                        }
                    });
                };
    }]);