import os
from urllib.parse import quote_plus

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
    user_language = find_language(request)

    activate(user_language)

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    # Url is actually a filter in the regions for the slug we are looking for
    url = "{}".format(os.path.join(settings.API_URL, 'v1/region/'))

    closest = "{}".format(os.path.join(settings.API_URL, 'v1/region/closest/'))

    r = requests.get(
        url,
        headers={
            'accept-language': user_language,
            'accept': 'application/json',
            'x-requested-for': ip,
        })
    regions = r.json()

    r = requests.get(
        url,
        headers={
            'accept-language': user_language,
            'accept': 'application/json',
            'x-requested-for': ip,
        })
    closest = r.json()

    if closest:
        closest = closest[0]

    parents = [r for r in regions if ('parent' not in r or not r['parent']) and ('hidden' not in r or not r['hidden'])]
    for p in parents:
        p['children'] = [r for r in regions if r['id'] != p['id'] and r['full_slug'].startswith(p['slug']) and r['level'] != 2]

    response = render(
        request,
        "home-cih.html",
        {
            'national_languages': [(k, v) for k, v in settings.LANGUAGES if k not in ('ar', 'fa', 'en')],
            'regions': parents,
            'closest': closest,
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
    url = "{}?slug={}".format(os.path.join(settings.API_URL, 'v1/region/'), slug)

    r = requests.get(
        url,
        headers={
            'accept-language': user_language,
            'accept': 'application/json',
            'x-requested-for': ip,
        })

    # Anything that is not a 200 in the API will become a 404 here
    if int(r.status_code / 100) != 2:
        raise Http404

    regions = r.json()

    if not regions:
        raise Http404

    region = regions[0]

    context.update(
        {
            'national_languages': [(k, v) for k, v in settings.LANGUAGES if
                                   k in region['languages_available'] and k not in ['en', 'ar', 'fa']],
            'feedback_url': settings.FEEDBACK_URL.get(user_language, settings.FEEDBACK_URL.get('en', '/')),
            'location': region,
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
