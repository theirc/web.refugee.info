import os

import requests
from django.conf import settings
from django.http import Http404
from django.shortcuts import render
from django.template import RequestContext
from django.utils.translation import activate


def home(request):
    """

    :param request:
    :return:
    """
    if 'language' in request:
        user_language = request['language'][0:2]
    elif 'HTTP_ACCEPT_LANGUAGE' in request.META:
        accept_language = request.META['HTTP_ACCEPT_LANGUAGE'].split(',')
        user_language = accept_language[0].split('-')

        if user_language:
            user_language = user_language[0]
    else:
        user_language = 'en'

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    # Url is actually a filter in the regions for the slug we are looking for
    url = "{}".format(os.path.join(settings.API_URL, 'v1/region/'))

    r = requests.get(
        url,
        headers={
            'accept-language': user_language,
            'accept': 'application/json',
            'x-requested-for': ip,
        })
    regions = r.json()

    parents = [r for r in regions if 'parent' not in r or not r['parent']]
    for p in parents:
        p['children'] = [r for r in regions if r['id'] != p['id'] and r['full_slug'].startswith(p['slug'])]

    return render(
        request,
        "home-cih.html",
        {
            'regions': parents
        },
        RequestContext(request)
    )


def content(request, slug, language=None):
    """
    Main view of the system. All it does is try to figure out which language is more appropriate and passes it over to
    the api.

    :param request:
    :param slug:
    :param language:
    :return:
    """
    if language:
        user_language = language[0:2]
    elif 'HTTP_ACCEPT_LANGUAGE' in request.META:
        accept_language = request.META['HTTP_ACCEPT_LANGUAGE'].split(',')
        user_language = accept_language[0].split('-')

        if user_language:
            user_language = user_language[0]
    else:
        user_language = 'en'

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

    activate(user_language)

    # Anything that is not a 200 in the API will become a 404 here
    if int(r.status_code / 100) != 2:
        raise Http404

    regions = r.json()

    if not regions:
        raise Http404

    region = regions[0]

    return render(
        request,
        "content/index-cih.html",
        {
            'feedback_url': settings.FEEDBACK_URL[user_language],
            'location': region,
            'has_important': True if [r for r in region['content'] if r['important']] else False,
        },
        RequestContext(request)
    )
