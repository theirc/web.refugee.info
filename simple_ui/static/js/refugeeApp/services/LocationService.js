angular.module('refugeeApp').factory('LocationService', function ($http, apiUrl, staticUrl, $cookies, $translate) {
    return {
        getServices: function (location, page, search, typeNumbers) {
            page = page || 1;

            return $http({
                method: 'GET',
                url: apiUrl + '/v1/services/search/',
                params: {
                    geographic_region: location.slug,
                    page: page,
                    page_size: 100,
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
        getRating: function (contentSlug) {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/page/' + contentSlug + '/rate/'
            });
        },
        setRating: function (contentSlug, rating, ratingId) {
            return $http({
                method: 'POST',
                url: apiUrl + '/v2/page/' + contentSlug + '/rate/',
                data: {
                    slug: contentSlug,
                    rating: rating,
                    rating_id: ratingId
                }
            });
        }
    };
});
