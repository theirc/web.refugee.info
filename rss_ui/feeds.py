import os

import requests
from django.conf import settings
from django.contrib.syndication.views import Feed
from django.http import Http404
from django.utils.translation import activate


class RssFeed(Feed):
    def get_object(self, request, slug, language='en'):
        user_language = find_language(request, language=language)

        activate(user_language)

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Url is actually a filter in the regions for the slug we are looking for
        url = "{}?slug={}".format(os.path.join(settings.API_URL, 'v1/region/'), slug)

        r = requests.get(
            url,
            headers={
                'accept-language': user_language,
                'accept': 'application/json',
                'x-requested-for': ip,
            })

        r_en = requests.get(
            url,
            headers={
                'accept-language': 'en',
                'accept': 'application/json',
                'x-requested-for': ip,
            })

        # Anything that is not a 200 in the API will become a 404 here
        if int(r.status_code / 100) != 2:
            raise Http404

        regions = r.json()
        regions_en = r_en.json()

        if not regions and not regions_en:
            raise Http404

        region = regions[0]
        region_en = regions_en[0]

        region = region if 'content' in region and region['content'] else region_en

        return region

    def title(self, obj):
        return obj['metadata']['page_title']

    def link(self, obj):
        return "https://refugeeinfo.eu/%s/" % obj['slug']

    def description(self, obj):
        return obj['metadata']['page_title']

    def items(self, obj):
        return obj['content']

    def item_link(self, item):
        return ""

    def item_description(self, item):
        return item['section']

    def item_title(self, item):
        return item['title']



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
