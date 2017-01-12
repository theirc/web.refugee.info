import os
from urllib.parse import quote_plus

import requests
import logging
from django.conf import settings
from django.http import Http404
from django.template.defaultfilters import date
from django.templatetags.l10n import localize
from django.templatetags.tz import utc
from django.utils.translation import activate
from dateutil import parser
from django.views.generic.base import View, TemplateView
from djng.views.mixins import JSONResponseMixin, allow_remote_invocation

logger = logging.getLogger(__name__)


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


def is_alkhadamat(request):
    if 'alkhadamat' in request.META.get('HTTP_HOST', ''):
        return True
    else:
        return False


class LocationJSONView(JSONResponseMixin, View):

    @allow_remote_invocation
    def get_regions(self, in_data):
        try:
            request = self.request
            language = in_data.get('language')
            user_language = find_language(request, language=language)

            activate(user_language)

            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            url = "{}".format(os.path.join(settings.API_URL, 'v2/region/?no_content&hidden=False&language=%s'
                                           % user_language))

            r = requests.get(
                url,
                headers={
                    'accept-language': user_language,
                    'accept': 'application/json',
                    'x-requested-for': ip,
                })
            regions = r.json()

            parents = [r for r in regions if ('parent' not in r or not r['parent'])]
            for p in parents:
                p['children'] = [r for r in regions if
                                 r['id'] != p['id'] and
                                 r['full_slug'].startswith(p['slug']) and
                                 r['level'] != 2]

            if is_alkhadamat(self.request):
                parents = [x for x in parents if x['code'] == 'LB']
                closest_url = "{}".format(
                    os.path.join(settings.API_URL,
                                 'v2/region/closest/?no_content=true&hidden=False&language=%s&is_child_of=%s'
                                 % (user_language, parents[0]['id'])))
            else:
                closest_url = "{}".format(
                    os.path.join(settings.API_URL, 'v2/region/closest/?no_content=true&hidden=False&language=%s'
                                 % user_language))
            r = requests.get(
                closest_url,
                headers={
                    'accept-language': user_language,
                    'accept': 'application/json',
                    'x-requested-for': ip,
                })
            closest = r.json()
            if closest:
                closest = closest[0]
            return {
                'national_languages': [(k, v) for k, v in settings.LANGUAGES if k not in ('ar', 'fa', 'en')],
                'regions': parents,
                'closest': closest,
                'API_URL': settings.API_URL,
            }
        except Exception:
            logger.exception('Error while getting regions.', exc_info=True)

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
        region_url = "{}?slug={}&language={}".format(os.path.join(settings.API_URL, 'v2/region/'), slug, user_language)
        information_url = "{}?slug={}".format(os.path.join(settings.API_URL, 'v2/important-information/'), slug)

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
        regions = sorted(r.json(), key=lambda j: j.get('parent') or -1)
        information = sorted(info_r.json(), key=lambda j: j.get('region') or -1)

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
            site_address += '#{}'.format(content['slug'])

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content['html'], 'html.parser')
            images = soup.find_all('img')
            for i in images:
                i['data-src'] = i['src']
                del i['src']

            content['html'] = soup.prettify() + \
                              '<div class="share-thumbs-container">' \
                              '<div class="fb-share-button" data-href="' + site_address + '" ' \
                              'data-layout="button"></div>' \
                              '<rating-thumbs class="rating-thumbs" index="' + str(content["slug"]) + '" item="p">' \
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
                'has_important': True if [r for r in region['important']] else False,
            }
        )
        return context


class LandingPageView(TemplateView):

    template_name = 'landing_page.html'

    def get_context_data(self, **kwargs):
        kwargs['API_URL'] = settings.API_URL
        kwargs['IS_ALKHADAMAT'] = is_alkhadamat(self.request)
        return super(LandingPageView, self).get_context_data(**kwargs)
