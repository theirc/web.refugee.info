angular.module('refugeeApp').factory('LocationService', function ($http, apiUrl, staticUrl, $cookies) {
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
                headers: {'Accept-Language': $cookies.get('django_language')}
            });
        },
        getServiceTypes: function () {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/servicetypes/',
                headers: {'Accept-Language': $cookies.get('django_language')}
            });
        },
        getService: function (serviceId) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v1/services/search/?format=json&id=' + serviceId,
                headers: {'Accept-Language': $cookies.get('django_language')}
            });
        },
        getServiceType: function (service) {
            return $http({
                method: 'GET',
                url: service.type,
                headers: {'Accept-Language': $cookies.get('django_language')}
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
