from urllib.parse import urlparse

from django.conf import settings
from django.core.files.storage import get_storage_class
from storages.backends.s3boto import S3BotoStorage
from storages.backends.s3boto import S3BotoStorage

__author__ = 'reyrodrigues'


class CachedS3BotoStorage(S3BotoStorage):
    """
    S3 storage backend that saves the files locally, too.
    """

    def __init__(self, *args, **kwargs):
        super(CachedS3BotoStorage, self).__init__(*args, **kwargs)
        self.local_storage = get_storage_class(
            "compressor.storage.CompressorFileStorage")()

    def save(self, name, content):
        self.local_storage._save(name, content)
        super().save(name, self.local_storage._open(name))
        return name


def domain(url):
    return urlparse(url).hostname


class MediaFilesStorage(S3BotoStorage):
    location = settings.MEDIAFILES_LOCATION

    def __init__(self, *args, **kwargs):
        kwargs['bucket'] = settings.AWS_STORAGE_BUCKET_NAME
        kwargs['custom_domain'] = domain(settings.MEDIA_URL)
        super().__init__(*args, **kwargs)


class StaticFilesStorage(S3BotoStorage):
    def __init__(self, *args, **kwargs):
        kwargs['bucket'] = settings.AWS_STORAGE_BUCKET_NAME
        kwargs['custom_domain'] = domain(settings.STATIC_URL)
        super().__init__(*args, **kwargs)
