"""root URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.views.generic import TemplateView

from simple_ui.views import LocationJSONView, LandingPageView

directives_patterns = [
    url(r'^region-choice.html$',
        TemplateView.as_view(template_name='angular/partials/directives/region-choice.html'),
        name='region-choice'),
    url(r'^services-list.html$',
        TemplateView.as_view(template_name='angular/partials/directives/services-list.html'),
        name='services-list'),
    url(r'^service-details.html$',
        TemplateView.as_view(template_name='angular/partials/directives/service-details.html'),
        name='service-details'),
    url(r'^location-buttons.html$',
        TemplateView.as_view(template_name='angular/partials/directives/location-buttons.html'),
        name='location-buttons'),
    url(r'^location-bar.html$',
        TemplateView.as_view(template_name='angular/partials/directives/location-bar.html'),
        name='location-bar'),
    url(r'^search-bar.html$',
        TemplateView.as_view(template_name='angular/partials/directives/search-bar.html'),
        name='search-bar'),
    url(r'^location-selected.html$',
        TemplateView.as_view(template_name='angular/partials/directives/location-selected.html'),
        name='location-selected'),
    url(r'^drawer.html$',
        TemplateView.as_view(template_name='angular/partials/directives/drawer.html'),
        name='drawer'),
    url(r'^quick-links.html$',
        TemplateView.as_view(template_name='angular/partials/directives/quick-links.html'),
        name='quick-links'),
    url(r'^change-location-button.html$',
        TemplateView.as_view(template_name='angular/partials/directives/change-location-button.html'),
        name='change-location-button'),
    url(r'^fb-like.html$',
        TemplateView.as_view(template_name='angular/partials/directives/fb-like.html'),
        name='fb-like'),
    url(r'^rating-thumbs.html$',
        TemplateView.as_view(template_name='angular/partials/directives/rating-thumbs.html'),
        name='rating-thumbs'),
    url(r'^location-info.html$',
        TemplateView.as_view(template_name='angular/partials/directives/location-info.html'),
        name='location-info'),
    url(r'^print-page.html$',
        TemplateView.as_view(template_name='angular/partials/directives/print-page.html'),
        name='print-page'),
]

partial_patterns = [
    url(r'^location.html$', TemplateView.as_view(template_name='angular/partials/location.html'),
        name='location'),
    url(r'^location.home.html$',
        TemplateView.as_view(template_name='angular/partials/location.home.html'),
        name='location_home'),
    url(r'^location.important-information.html$',
        TemplateView.as_view(template_name='angular/partials/location.important-information.html'),
        name='location_important_information'),
    url(r'^location.notifications.html$',
        TemplateView.as_view(template_name='angular/partials/location.notifications.html'),
        name='location_notifications'),
    url(r'^location.services.html$', TemplateView.as_view(template_name='angular/partials/location.services.html'),
        name='location_services'),
    url(r'^location.service-details.html$', TemplateView.as_view(
        template_name='angular/partials/location.service-details.html'
    ), name='service_details'),
    url(r'^general-info.html$', TemplateView.as_view(template_name='angular/partials/general-info.html'),
        name='general_info'),
    url(r'^directives/', include(directives_patterns, namespace='directives'))
]

urlpatterns = [
    url(r'^locations$', LocationJSONView.as_view(), name='location_json_view'),
    url(r'^partials/', include(partial_patterns, namespace='partials')),
    url(r'$', LandingPageView.as_view())
]
