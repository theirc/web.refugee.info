angular.module('refugeeApp').factory('LocationService', function ($http, apiUrl, staticUrl, $cookies, $translate) {
    return {
        getServices: function (location, page, search) {
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
                    search: search
                },
                headers: {'Accept-Language': $translate.use() || $translate.preferredLanguage()}
            });
        },
        getServiceTypes: function () {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/servicetypes/',
                headers: {'Accept-Language': $translate.use() || $translate.preferredLanguage()}
            });
        },
        getService: function (serviceId) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/services/search/?format=json&id=' + serviceId,
                headers: {'Accept-Language': $translate.use() || $translate.preferredLanguage()}
            });
        },
        getServiceType: function (service) {
            return $http({
                method: 'GET',
                url: service.type,
                headers: {'Accept-Language': $translate.use() || $translate.preferredLanguage()}
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
