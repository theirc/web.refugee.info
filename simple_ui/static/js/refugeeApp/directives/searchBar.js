angular.module('refugeeApp').directive('searchBar', function() {
    return {
        restrict: 'E',
        scope: {
            search: '='
        },
        template: '<div class="form-inline search-bar row"> \
            <div class="form-group col-md-5"> \
                <p class="form-control-static title">Nearest Services To Your Location</p> \
            </div> \
            <div class="form-group col-md-6"> \
                <div class="input-group col-md-12"> \
                    <div class="input-group-addon"><i class="fa fa-search"></i></div> \
                    <input ng-model-options="{ debounce: 500 }" ng-model="search" type="text" class="form-control" placeholder="Search"> \
                </div> \
            </div> \
        </div>'
    };
});
