bower install; \
sass simple_ui/static/scss/main.scss > simple_ui/static/scss/main.css; \
python manage.py collectstatic --noinput; \
gunicorn root.wsgi --log-file -
