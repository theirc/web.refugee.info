angular.module('refugeeApp').directive('locationBar', function () {
    return {
        restrict: 'E',
        scope: {},
        template: '<div class="row location-bar-header"> \
    <div class="col-sm-4 col-sm-offset-4 col-xs-6 location-bar-center no-padding">Your location:</div> \
    <div class="col-sm-4 col-xs-6 location-bar-right no-padding"> \
        <a href="" ui-sref="location({force: true})" class="change-location-button">Change location \
            <i class="material-icons">my_location</i></a> \
    </div> \
</div>'
    };
});
