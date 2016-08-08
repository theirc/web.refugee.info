angular.module('refugeeApp').factory('LocationService', function ($http, apiUrl) {
    return {
        getLocationBySlug: function (locationSlug) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/region/',
                params: {
                    slug: locationSlug
                }
            });
        },
        getServices: function (locationSlug, page, search) {
            page = page || 1;
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/services/search/',
                params: {
                    geographicRegion: locationSlug,
                    page: page,
                    page_size: 12,
                    search: search
                }
            });
        },
        getServiceTypes: function () {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/servicetypes/'
            });
        },
        getService: function (serviceId) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/services/search/?format=json&id=' + serviceId
            });
        },
        getServiceType: function (service) {
            return $http({
                method: 'GET',
                url: service.type
            });
        }
    };
});
