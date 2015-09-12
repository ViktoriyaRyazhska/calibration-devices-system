angular
    .module('employeeModule')
    .factory('VerificationServiceCalibrator', ['$http', '$log', function ($http, $log) {

        return {
            getArchivalVerificationDetails: function (verificationId) {
                return getData('verifications/archive/' + verificationId);
            },
            getNewVerifications: function (currentPage, itemsPerPage, search, sortCriteria, sortOrder) {
                return getDataWithParams('calibrator/verifications/new/' + currentPage + '/' + itemsPerPage + '/' + sortCriteria + '/' + sortOrder, search);
            },
            getArchiveVerifications: function (currentPage, itemsPerPage, search, sortCriteria, sortOrder) {
                return getDataWithParams('calibrator/verifications/archive/' + currentPage + '/' + itemsPerPage + '/' + sortCriteria + '/' + sortOrder, search);
            },
            getNewVerificationDetails: function (verificationId) {
                return getData('verifications/new/' + verificationId);
            },
            getVerificators: function (url) {
                return getData('verifications/new/verificators');
            },
            sendVerificationsToCalibrator: function (data) {
                return updateData('new/update', data);
            },
            sendInitiatedVerification: function (form) {
                return sendData("send", form);
            },
            getCalibratorsCorrespondingProvider: function (url) {
                return getData("applications/calibrators");
            },
            getLocalitiesCorrespondingProvider: function (url) {
                return getData("applications/localities");
            },
            getStreetsCorrespondingLocality: function (selectedLocality) {
                return getData("applications/streets/" + selectedLocality.id);
            },
            getBuildingsCorrespondingStreet: function (selectedBuilding) {
                return getData("applications/buildings/" + selectedBuilding.id);
            },
            getCountOfNewVerifications: function (url) {
                return getData('verifications/new/count/calibrator');
            },
            markVerificationAsRead: function (data) {
                return updateData('new/read', data);
            },
            cancelUploadFile: function (idVerification) {
                return getData('verifications/find/uploadFile?idVerification=' + idVerification);
            },
            deleteBbiProtocol: function (idVerification) {
                return sendDataProtocol("deleteBbiprotocol?idVerification="+ idVerification);
            },
            getCalibrators: function (url) {
                return getEmployeeData('new/calibratorEmployees');
            },
            sendEmployeeCalibrator: function (data) {
                return employeeUpdateData('assign/calibratorEmployee', data);
            },
            cleanCalibratorEmployeeField:function (data) {
                return employeeUpdateData('remove/calibratorEmployee', data);
            },

            getNewVerificationEarliestDate: function () {
                return getData('verifications/new/earliest_date/calibrator');
            },
            getArchivalVerificationEarliestDate: function () {
                return getData('verifications/archive/earliest_date/calibrator');
            }
        };

        function getData(url) {
            return $http.get('calibrator/' + url)
                .success(function (data) {
                    return data;
                })
                .error(function (err) {
                    return err;
                });
        }

        function getDataWithParams(url, params) {
            return $http.get(url, {
                params: params
            }).success(function (data) {
                return data;
            }).error(function (err) {
                return err;
            });
        }

        function updateData(url, data) {
            return $http.put('calibrator/verifications/' + url, data)
                .success(function (responseData) {
                    return responseData;
                })
                .error(function (err) {
                    return err;
                });
        }

        function employeeUpdateData(url, data) {
            return $http.put('calibrator/admin/users/' + url, data)
                .success(function (responseData) {
                    return responseData;
                })
                .error(function (err) {
                    return err;
                });
        }
        function getEmployeeData(url) {
            return $http.get('calibrator/admin/users/' + url)
                .success(function (data) {
                    return data;
                })
                .error(function (err) {
                    return err;
                });
        }
        function sendData(url, data) {
            return $http.post('calibrator/applications/' + url, data)
                .success(function (responseData) {
                    return responseData;
                })
                .error(function (err) {
                    return err;
                });
        }
        function sendDataProtocol(url, data) {
            return $http.put('calibrator/verifications/' + url, data)
                .success(function (responseData) {
                    return responseData;
                })
                .error(function (err) {
                    return err;
                });
        }

    }]);
