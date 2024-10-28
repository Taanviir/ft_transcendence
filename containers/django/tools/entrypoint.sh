#!/bin/sh

black .

python3 pong-backend/manage.py makemigrations users game

python3 pong-backend/manage.py migrate

python3 pong-backend/manage.py collectstatic --noinput

python3 pong-backend/manage.py create_superuser

python3 pong-backend/manage.py create_user

exec "$@"
