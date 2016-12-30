import os
from urllib.parse import quote_plus

import requests
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.http import Http404
from django.template.defaultfilters import date
from django.templatetags.l10n import localize
from django.templatetags.tz import utc
from django.utils.translation import activate
from dateutil import parser
from django.views.generic.base import View, TemplateView
from djng.views.mixins import JSONResponseMixin, allow_remote_invocation


def find_language(request, language=None):
    if language:
        user_language = language[0:2]
    elif 'NG_TRANSLATE_LANG_KEY' in request.COOKIES:
        user_language = request.COOKIES['NG_TRANSLATE_LANG_KEY'][3:-3]
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
        language = in_data.get('language')
        user_language = find_language(request, language=language)

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

        def check_status_codes(codes):
            # Anything that is not a 200 in the API will become a 404 here
            codes_list = [int(a / 100) for a in codes]
            if 2 not in codes_list:
                raise Http404

        r = __request(region_url, user_language, ip)
        info_r = __request(information_url, user_language, ip)

        status_codes = [r.status_code, info_r.status_code]
        check_status_codes(status_codes)
        regions = sorted(r.json(), key=lambda j: j['parent'] or -1)
        information = sorted(info_r.json(), key=lambda j: j['region'] or -1)

        if not regions and not information:
            raise Http404

        region = regions[0] if regions else information[0] if information else {}
        if 'content' not in region and not region['content']:
            r_en = __request(region_url, 'en', ip)
            info_r_en = __request(information_url, 'en', ip)
            status_codes = [r_en.status_code, info_r_en.status_code]
            check_status_codes(status_codes)
            information_en = sorted(info_r_en.json(), key=lambda j: j['region'] or -1)
            regions_en = sorted(r_en.json(), key=lambda j: j['parent'] or -1)
            if not regions_en and not information_en:
                raise Http404
            region_en = regions_en[0] if regions_en else information_en[0] if information_en else {}
            region = region_en

        base_url = request.build_absolute_uri('/') + slug
        for content in region['content']:
            site_address = base_url
            site_address += '/?language={}'.format(user_language) if user_language != 'en' else '/'
            site_address += '#{}'.format(content["anchor_name"]) if content["anchor_name"] \
                else '#info{}'.format(content["index"])

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content['section'], 'html.parser')
            images = soup.find_all('img')
            for i in images:
                i['data-src'] = i['src']
                del i['src']


            content['section'] = soup.prettify() + \
                                 '<div class="share-thumbs-container">' \
                                 '<div class="fb-share-button" data-href="' + site_address + '" ' \
                                 'data-layout="button"></div>' \
                                 '<rating-thumbs class="rating-thumbs" index="' + str(content["index"]) + '">' \
                                 '</rating-thumbs>' \
                                 '</div>'

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
