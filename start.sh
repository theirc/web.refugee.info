bower install; \
python manage.py compress; \
python manage.py collectstatic --noinput; \
gunicorn root.wsgi --log-file -
