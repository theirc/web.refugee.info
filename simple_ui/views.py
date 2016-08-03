import os
from urllib.parse import quote_plus

import requests
from django.conf import settings
from django.http import Http404
from django.shortcuts import render
from django.template import RequestContext
from django.template.defaultfilters import date
from django.templatetags.l10n import localize
from django.templatetags.tz import utc
from django.utils.translation import activate
from django.views.decorators.cache import cache_page
from dateutil import parser
from django.views.generic.base import View, TemplateView
from djng.views.mixins import JSONResponseMixin, allow_remote_invocation

CACHE_LENGTH = getattr(settings, 'CACHE_LENGTH', 15) * 60


def home(request):
    """

    :param request:
    :return:
    """
    user_language = find_language(request)

    activate(user_language)

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    # Url is actually a filter in the regions for the slug we are looking for
    url = "{}".format(os.path.join(settings.API_URL, 'v1/region/?no_content=true'))

    closest_url = "{}".format(os.path.join(settings.API_URL, 'v1/region/closest/?no_content=true&hidden=False'))

    r = requests.get(
        url,
        headers={
            'accept-language': user_language,
            'accept': 'application/json',
            'x-requested-for': ip,
        })
    regions = r.json()

    r = requests.get(
        closest_url,
        headers={
            'accept-language': user_language,
            'accept': 'application/json',
            'x-requested-for': ip,
        })
    closest = r.json()
    language_key = 'title_{}'.format(user_language)

    if closest:
        closest = closest[0]
        closest['title'] = closest[language_key] if language_key in closest else closest['title_en']

    for r in regions:
        r['title'] = r[language_key] if language_key in r else r['title_en']


    parents = [r for r in regions if ('parent' not in r or not r['parent'])]
    for p in parents:
        p['children'] = [r for r in regions if
                         r['id'] != p['id'] and
                         r['full_slug'].startswith(p['slug']) and
                         r['level'] != 2 and
                         ('hidden' not in r or not r['hidden'])
                         ]

    response = render(
        request,
        "home-cih.html",
        {
            'national_languages': [(k, v) for k, v in settings.LANGUAGES if k not in ('ar', 'fa', 'en')],
            'regions': parents,
            'closest': closest,
            'API_URL': settings.API_URL,
        },
        RequestContext(request)
    )
    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, user_language)
    return response


def content(request, slug, language=None):
    """
    Main view of the system. All it does is try to figure out which language is more appropriate and passes it over to
    the api.

    :param request:
    :param slug:
    :param language:
    :return:
    """
    user_language = find_language(request, language=language)

    activate(user_language)

    is_blue = slug in settings.BLUE_PAGES

    # Handling Meraki:
    context = {
    }

    if 'source' in request.GET:
        context['is_captive'] = True

    if 'base_grant_url' in request.GET:
        context['is_captive'] = True
        context['is_meraki'] = True
        context['next'] = "{}?continue_url={}".format(
            request.GET['base_grant_url'],
            quote_plus(request.GET['user_continue_url'])
        )

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    # Url is actually a filter in the regions for the slug we are looking for
    region_url = "{}?slug={}".format(os.path.join(settings.API_URL, 'v1/region/'), slug)
    information_url = "{}?slug={}".format(os.path.join(settings.API_URL, 'v1/important-information/'), slug)

    def __request(url, language, ip):
        return requests.get(
            url,
            headers={
                'accept-language': language,
                'accept': 'application/json',
                'x-requested-for': ip,
            })

    r = __request(region_url, user_language, ip)
    r_en = __request(region_url, 'en', ip)
    info_r = __request(information_url, user_language, ip)
    info_r_en = __request(information_url, 'en', ip)

    # Anything that is not a 200 in the API will become a 404 here
    status_codes = [r.status_code, r_en.status_code, info_r.status_code, info_r_en.status_code]
    status_codes = [int(a / 100) for a in status_codes]

    if 2 not in status_codes:
        raise Http404

    regions = sorted(r.json(), key=lambda j: j['parent'] or -1)
    regions_en = sorted(r_en.json(), key=lambda j: j['parent'] or -1)
    information = sorted(info_r.json(), key=lambda j: j['region'] or -1)
    information_en = sorted(info_r_en.json(), key=lambda j: j['region'] or -1)

    if not regions and not regions_en and not information and not information_en:
        raise Http404

    region = regions[0] if regions else information[0] if information else {}
    region_en = regions_en[0] if regions_en else information_en[0] if information_en else {}

    region = region if 'content' in region and region['content'] else region_en

    feedback_url = ""
    try:
        feedback_url = settings.FEEDBACK_URL.get(user_language, settings.FEEDBACK_URL.get('en', '/'))
        feedback_url = feedback_url.format(region['slug'])
    except:
        pass

    publication_date = None
    try:
        if 'metadata' in region and 'last_updated' in region['metadata']:
            publication_date = parser.parse(region['metadata']['last_updated'])
    except:
        pass

    context.update(
        {
            'national_languages': [(k, v) for k, v in settings.LANGUAGES if 'languages_available' in region and
                                   k in region['languages_available'] and k not in ['en', 'ar', 'fa']],
            'feedback_url': feedback_url,
            'location': region,
            'publication_date': publication_date,
            'is_blue': is_blue,
            'has_important': True if [r for r in region['content'] if r['important']] else False,
        }
    )

    response = render(
        request,
        "content/index-cih.html",
        context,
        RequestContext(request)
    )
    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, user_language)
    return response


@cache_page(CACHE_LENGTH * 4)
def acknowledgements(request):
    user_language = find_language(request)

    activate(user_language)

    response = render(
        request,
        "acknowledgements-cih.html",
        {
        },
        RequestContext(request)
    )
    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, user_language)
    return response


def find_language(request, language=None):
    if language:
        user_language = language[0:2]
    elif 'language' in request.GET:
        user_language = request.GET['language'][0:2]
    elif 'HTTP_ACCEPT_LANGUAGE' in request.META:
        accept_language = request.META['HTTP_ACCEPT_LANGUAGE'].split(',')
        user_language = accept_language[0].split('-')

        if user_language:
            user_language = user_language[0]
    else:
        user_language = 'en'
    return user_language


class LocationJSONView(JSONResponseMixin, View):

    @allow_remote_invocation
    def get_regions(self, in_data):
        request = self.request
        user_language = find_language(request)

        activate(user_language)

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Url is actually a filter in the regions for the slug we are looking for
        url = "{}".format(os.path.join(settings.API_URL, 'v1/region/?no_content=true'))

        closest_url = "{}".format(
            os.path.join(settings.API_URL, 'v1/region/closest/?no_content=true&hidden=False'))

        r = requests.get(
            url,
            headers={
                'accept-language': user_language,
                'accept': 'application/json',
                'x-requested-for': ip,
            })
        regions = r.json()

        r = requests.get(
            closest_url,
            headers={
                'accept-language': user_language,
                'accept': 'application/json',
                'x-requested-for': ip,
            })
        closest = r.json()
        language_key = 'title_{}'.format(user_language)

        if closest:
            closest = closest[0]
            closest['title'] = closest[language_key] if language_key in closest else closest['title_en']

        for r in regions:
            r['title'] = r[language_key] if language_key in r else r['title_en']

        parents = [r for r in regions if ('parent' not in r or not r['parent'])]
        for p in parents:
            p['children'] = [r for r in regions if
                             r['id'] != p['id'] and
                             r['full_slug'].startswith(p['slug']) and
                             r['level'] != 2 and
                             ('hidden' not in r or not r['hidden'])
                             ]

        return {
            'national_languages': [(k, v) for k, v in settings.LANGUAGES if k not in ('ar', 'fa', 'en')],
            'regions': parents,
            'closest': closest,
            'API_URL': settings.API_URL,
        }

    @allow_remote_invocation
    def get_details(self, in_data):
        language = in_data.get('language')
        slug = in_data['slug']
        request = self.request

        user_language = find_language(request, language=language)

        activate(user_language)

        is_blue = slug in settings.BLUE_PAGES

        # Handling Meraki:
        context = {}

        if 'source' in request.GET:
            context['is_captive'] = True

        if 'base_grant_url' in request.GET:
            context['is_captive'] = True
            context['is_meraki'] = True
            context['next'] = "{}?continue_url={}".format(
                request.GET['base_grant_url'],
                quote_plus(request.GET['user_continue_url'])
            )

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Url is actually a filter in the regions for the slug we are looking for
        region_url = "{}?slug={}".format(os.path.join(settings.API_URL, 'v1/region/'), slug)
        information_url = "{}?slug={}".format(os.path.join(settings.API_URL, 'v1/important-information/'), slug)

        def __request(url, language, ip):
            return requests.get(
                url,
                headers={
                    'accept-language': language,
                    'accept': 'application/json',
                    'x-requested-for': ip,
                })

        r = __request(region_url, user_language, ip)
        r_en = __request(region_url, 'en', ip)
        info_r = __request(information_url, user_language, ip)
        info_r_en = __request(information_url, 'en', ip)

        # Anything that is not a 200 in the API will become a 404 here
        status_codes = [r.status_code, r_en.status_code, info_r.status_code, info_r_en.status_code]
        status_codes = [int(a / 100) for a in status_codes]

        if 2 not in status_codes:
            raise Http404

        regions = sorted(r.json(), key=lambda j: j['parent'] or -1)
        regions_en = sorted(r_en.json(), key=lambda j: j['parent'] or -1)
        information = sorted(info_r.json(), key=lambda j: j['region'] or -1)
        information_en = sorted(info_r_en.json(), key=lambda j: j['region'] or -1)

        if not regions and not regions_en and not information and not information_en:
            raise Http404

        region = regions[0] if regions else information[0] if information else {}
        region_en = regions_en[0] if regions_en else information_en[0] if information_en else {}

        region = region if 'content' in region and region['content'] else region_en

        feedback_url = ""
        try:
            feedback_url = settings.FEEDBACK_URL.get(user_language, settings.FEEDBACK_URL.get('en', '/'))
            feedback_url = feedback_url.format(region['slug'])
        except:
            pass

        publication_date = None
        localized_date = None
        try:
            if 'metadata' in region and 'last_updated' in region['metadata']:
                publication_date = date(utc(parser.parse(region['metadata']['last_updated'])), 'c')
                localized_date = localize(utc(parser.parse(region['metadata']['last_updated'])))
        except:
            pass

        context.update(
            {
                'national_languages': [(k, v) for k, v in settings.LANGUAGES if 'languages_available' in region and
                                       k in region['languages_available'] and k not in ['en', 'ar', 'fa']],
                'feedback_url': feedback_url,
                'location': region,
                'publication_date': publication_date,
                'localized_date': localized_date,
                'is_blue': is_blue,
                'has_important': True if [r for r in region['content'] if r['important']] else False,
            }
        )
        return context


class LandingPageView(TemplateView):

    template_name = 'landing_page.html'

    def get_context_data(self, **kwargs):
        kwargs['API_URL'] = settings.API_URL
        return super(LandingPageView, self).get_context_data(**kwargs)
