angular.module('refugeeApp').factory('LocationService', function ($http, apiUrl, staticUrl) {
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
        },
        getCountriesJson: function() {
            return $http({
                method: 'GET',
                url: staticUrl + 'data/countries.json'
            });
        }
    };
});
