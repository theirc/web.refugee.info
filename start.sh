bower install; \
python manage.py collectstatic --noinput; \
gunicorn root.wsgi --log-file -
