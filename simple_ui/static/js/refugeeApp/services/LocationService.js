angular.module('refugeeApp').factory('LocationService', function ($http, apiUrl, staticUrl, $cookies, $translate) {
    return {
        getServices: function (location, page, search, typeNumbers) {
            page = page || 1;

            return $http({
                method: 'GET',
                url: apiUrl + '/v2/services/search/',
                params: {
                    geographic_region: location.slug,
                    page: page,
                    page_size: 100,
                    search: search,
                    type_numbers: typeNumbers.join(),
                    filter: 'with-parents'
                },
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getSameCoordinatesServices(id) {
            return $http({
                method: 'GET',
                url: apiUrl + `/v2/services/${id}/get_same_coordinates_services/`,
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getServiceTypes: function () {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/servicetypes/',
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getAssignedServiceTypes: function (location) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/custom-servicetypes/used_types/',
                params: {
                    geographic_region: location.slug,
                },
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getService: function (serviceId) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/services/search/?format=json&id=' + serviceId,
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getServiceForPreview: function (serviceId) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/services/preview/?format=json&id=' + serviceId,
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getServiceType: function (service) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/servicetypes/' + service.type + '/',
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        }
    };
});
