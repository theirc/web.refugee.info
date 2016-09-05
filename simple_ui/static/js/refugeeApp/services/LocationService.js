angular.module('refugeeApp').factory('LocationService', function ($http, apiUrl, staticUrl, $cookies, $translate) {
    return {
        getServices: function (location, page, search, typeNumbers) {
            page = page || 1;
            var coords = location.centroid.coordinates;

            return $http({
                method: 'GET',
                url: apiUrl + '/v1/services/search/',
                params: {
                    geographic_region: location.slug,
                    closest: coords[0] + ',' + coords[1],
                    page: page,
                    page_size: 12,
                    search: search,
                    type_numbers: typeNumbers.join()
                },
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getServiceTypes: function () {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/servicetypes/',
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getService: function (serviceId) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/services/search/?format=json&id=' + serviceId,
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getServiceType: function (service) {
            return $http({
                method: 'GET',
                url: service.type,
                headers: {'Accept-Language': $translate.proposedLanguage() || $translate.use()}
            });
        },
        getCountriesJson: function() {
            return $http({
                method: 'GET',
                url: staticUrl + 'data/countries.json'
            });
        }
    };
});
