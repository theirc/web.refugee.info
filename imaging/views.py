import os

import requests

from django.conf import settings
from django.conf import settings
from django.contrib.gis.geos import fromstr
from django.core.cache import cache
from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect
from django.template import RequestContext
from django.utils import translation
from django.views.decorators.cache import cache_page
import random
from django.utils.translation import activate

from PIL import Image

CACHE_LENGTH = getattr(settings, 'CACHE_LENGTH', 60 * 15)
@cache_page(CACHE_LENGTH)
def logo(request):
    logos = os.path.join(settings.BASE_DIR, 'imaging', 'static', 'logos')

    images = [x for x in os.listdir(logos) if x != 'bar.png' and x[-3:].lower() == 'png']
    img = Image.open(os.path.join(logos, 'bar.png'))
    logo_imgs = [Image.open(os.path.join(logos, i)) for i in images]

    random.shuffle(logo_imgs)
    for i, image in enumerate(logo_imgs):
        x = 38 * i
        img.paste(image.convert('RGBA'), (x, 0))

    response = HttpResponse(content_type="image/png")
    img.save(response, "PNG")
    return response