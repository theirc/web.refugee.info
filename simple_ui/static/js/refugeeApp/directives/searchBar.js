angular.module('refugeeApp').directive('searchBar', function() {
    return {
        restrict: 'E',
        scope: {
            search: '='
        },
        template: '<div class="search-bar row"> \
            <div class="col-sm-6"> \
                <p class="form-control-static title">Nearest Services To Your Location</p> \
            </div> \
            <div class="col-sm-6"> \
                <div class="input-group col-md-12"> \
                    <div class="input-group-addon"><i class="fa fa-search"></i></div> \
                    <input ng-model-options="{ debounce: 500 }" ng-model="search" type="text" class="form-control" placeholder="Search"> \
                </div> \
            </div> \
        </div>'
    };
});
