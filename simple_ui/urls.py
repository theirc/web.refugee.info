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
from django.conf.urls import url, patterns, include
from django.views.generic import TemplateView

from simple_ui.views import LocationJSONView, LandingPageView
from . import views

directives_patterns = [
    url(r'^region-choice.html$',
        TemplateView.as_view(template_name='angular/partials/directives/region-choice.html'),
        name='region-choice'),
    url(r'^services-list.html$',
        TemplateView.as_view(template_name='angular/partials/directives/services-list.html'),
        name='services-list'),
    url(r'^service-details.html$',
        TemplateView.as_view(template_name='angular/partials/directives/service-details.html'),
        name='service-details')
]

partial_patterns = [
    url(r'^location.html$', TemplateView.as_view(template_name='angular/partials/location.html'),
        name='location'),
    url(r'^location.details.html$', TemplateView.as_view(template_name='angular/partials/location.details.html'),
        name='location_details'),
    url(r'^location.important-information.html$',
        TemplateView.as_view(template_name='angular/partials/location.important-information.html'),
        name='location_important_information'),
    url(r'^location.services.html$', TemplateView.as_view(template_name='angular/partials/location.services.html'),
        name='location_services'),
    url(r'^location.service-details.html$', TemplateView.as_view(
        template_name='angular/partials/location.service-details.html'
    ), name='service_details'),
    url(r'^directives/', include(directives_patterns, namespace='directives'))
]

urlpatterns = [
    url(r'acknowledgements/$', views.acknowledgements, ),
    url(r'^locations$', LocationJSONView.as_view(), name='location_json_view'),

    url(r'^(?P<slug>[a-zA-Z\-0-9]+)/?$', views.content, ),
    url(r'^(?P<slug>[a-zA-Z\-0-9]+)/(?P<language>[a-zA-Z\-0-9]+)/?$', views.content, ),
    url(r'^partials/', include(partial_patterns, namespace='partials')),

    url(r'$', LandingPageView.as_view())
]
