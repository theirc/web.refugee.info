angular.module('refugeeApp').directive('searchBar', function() {
    return {
        restrict: 'E',
        scope: {
            search: '=',
            direction: '='
        },
        controller: function ($scope) {
            $scope.serviceTypes = $scope.$parent.ctrl.serviceTypes;
            var parentCtrl = $scope.$parent.ctrl;
            $scope.setSelectedType = function () {
                var type = this.type.url;
                var index = parentCtrl.filterTypes.indexOf(type);
                if (index > -1){
                    parentCtrl.filterTypes.splice(index,1);
                } else {
                    parentCtrl.filterTypes.push(type);
                }
                return false;
            };

            $scope.isChecked = function (id) {
                if ($scope.$parent.ctrl.filterTypes.indexOf(id) !== -1) {
                    return 'fa fa-check';
                }
                return false;
            };
        },
        template: '<div class="search-bar row">\
                        <div class="col-sm-6">\
                            <p class="form-control-static title">Nearest Services To Your Location</p>\
                        </div>\
                        <div class="col-sm-6">\
                            <div class="input-group">\
                                    <div class="input-group-addon">\
                                        <i class="fa fa-search"></i>\
                                    </div> \
                                    <input ng-model-options="{ debounce: 500 }" ng-model="search" type="text" class="form-control" placeholder="Search"> \
                                    <div class="input-group-btn" data-ng-class="{open: open}"> \
                                        <button class="btn dropdown-toggle" data-ng-click="open=!open">\
                                            <i class="fa fa-filter"></i>\
                                        </button>\
                                        <ul class="dropdown-menu services-filter-list" ng-class="direction" aria-labelledby="dropdownMenu" style="width: -moz-max-content">\
                                            <li class="dropdown-header">Filter services by type</li>\
                                            <li class="line" data-ng-repeat="type in serviceTypes" style="cursor: pointer;">\
                                                <a data-ng-click="setSelectedType()" style="white-space: normal">\
                                                <div class="services-filter-list-icon-container">\
                                                <i class="fa {$ type.vector_icon $}"></i>\
                                                </div> {{type.name}} <i data-ng-class="isChecked(type.url)"></i></a>\
                                            </li>\
                                        </ul>\
                                    </div> \
                            </div> \
                        </div> \
                    </div>'
    };
});
