import hashlib
import random
import os
import string
from django.contrib.sessions.middleware import SessionMiddleware
# requests is module to make http requests.
import requests
# importing the settings.py file so that we can use some of the settings.
from django.conf import settings
from random import choice
from string import ascii_lowercase, digits
from django.contrib.auth.models import User
import time
import datetime
from apps.dashboard.models import *


def get_md5_hash(string=None):
    md5 = hashlib.md5()

    md5.update(string)

    return md5.hexdigest()


def validate_email(email):
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError

    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


def validate_url(url):
    from django.core.validators import URLValidator
    from django.core.exceptions import ValidationError

    validate = URLValidator()

    try:
        validate(url)
        return True
    except ValidationError:
        return False


def email_present_exclude_own(email, id):
    if User.objects.filter(email=email).exclude(id=id).count():
        return True

    return False


def get_random_password():
    alphabet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    pw_length = 14
    mypw = ""

    for i in range(pw_length):
        next_index = random.randrange(len(alphabet))
        mypw = mypw + alphabet[next_index]

    return mypw


def stripe_get_access_token_from_code(code):
    secret_key = getattr(settings, 'STRIPE_SECRET_KEY')

    data_type = 'JSON'

    api_url = 'https://connect.stripe.com/oauth/token'

    data = {
        "client_secret": secret_key,
        "grant_type": "authorization_code",
        "code": code,
    }

    headers = {'Content-type': 'application/x-www-form-urlencoded'}

    result = requests.post(api_url, data=data, headers=headers)

    return result


def generate_random_email_verification(length=16, chars=ascii_lowercase + digits, split=4, delimiter='-'):
    code = ''.join([choice(chars) for i in xrange(length)])
    if split:
        code = delimiter.join([code[start:start + split] for start in range(0, len(code), split)])

    try:
        if CoreMember.objects.get(email_verification_token=code):
            return generate_random_email_verification(length=length, chars=chars, split=split, delimiter=delimiter)
        else:
            return code
    except CoreMember.DoesNotExist:
        return code


def generate_random_username(length=16, chars=ascii_lowercase + digits, split=4, delimiter='-'):
    username = ''.join([choice(chars) for i in xrange(length)])

    if split:
        username = delimiter.join([username[start:start + split] for start in range(0, len(username), split)])

    try:
        User.objects.get(username=username)
        return generate_random_username(length=length, chars=chars, split=split, delimiter=delimiter)
    except User.DoesNotExist:
        return username


def random_code(model, field='code', length=16, chars=ascii_lowercase + digits, split=4, delimiter='-'):
    code = ''.join([choice(chars) for i in xrange(length)])

    if split:
        code = delimiter.join([code[start:start + split] for start in range(0, len(code), split)])
    try:
        model.objects.get(**{field: code})
        return random_code(model, field=field, length=length, chars=chars, split=split, delimiter=delimiter)
    except model.DoesNotExist:
        return code


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def represents_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False


def get_start_end_of_previous_day(days):
    yesterday = datetime.datetime.now() - datetime.timedelta(days=days)
    yesterday_beginning = datetime.datetime(yesterday.year, yesterday.month, yesterday.day, 0, 0, 0, 0)
    yesterday_beginning_time = int(time.mktime(yesterday_beginning.timetuple()))
    yesterday_end = datetime.datetime(yesterday.year, yesterday.month, yesterday.day, 23, 59, 59, 999)
    yesterday_end_time = int(time.mktime(yesterday_end.timetuple()))

    start_end = dict()

    start_end['start_time'] = yesterday_beginning_time
    start_end['end_time'] = yesterday_end_time

    return start_end


def get_start_end_of_a_day(date_object):
    day_start_end = dict()

    start_time = datetime.datetime(date_object.year, date_object.month, date_object.day, 0, 0, 0, 0)

    end_time = datetime.datetime(date_object.year, date_object.month, date_object.day, 23, 59, 59, 999)

    day_start_end['start_time'] = int(time.mktime(start_time.timetuple()))

    day_start_end['end_time'] = int(time.mktime(end_time.timetuple()))

    return day_start_end


def sizify(value):
    """
    Simple kb/mb/gb size snippet for templates:

    {{ product.file.size|sizify }}
    """
    # value = ing(value)
    if value < 512000:
        value = value / 1024.0
        ext = 'kb'
    elif value < 4194304000:
        value = value / 1048576.0
        ext = 'mb'
    else:
        value = value / 1073741824.0
        ext = 'gb'
    return '%s %s' % (str(round(value, 2)), ext)


def get_coordinates(query, from_sensor=False):
    import urllib
    import json

    googleGeocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?'

    query = query.encode('utf-8')
    params = {
        'address': query,
        'key': 'AIzaSyBvj20P6aP-DowWicCrp3ON-ZzSyXYPOOM',
        'sensor': "true" if from_sensor else "false"
    }
    url = googleGeocodeUrl + urllib.urlencode(params)
    json_response = urllib.urlopen(url)
    response = json.loads(json_response.read())
    if response['results']:
        location = response['results'][0]['geometry']['location']
        latitude, longitude = location['lat'], location['lng']
        print query, latitude, longitude
    else:
        latitude, longitude = None, None
        print query, "<no results>"
    return latitude, longitude


def color_variant(hex_color, brightness_offset=1):
    """ takes a color like #87c95f and produces a lighter or darker variant """
    if len(hex_color) != 7:
        raise Exception("Passed %s into color_variant(), needs to be in #87c95f format." % hex_color)
    rgb_hex = [hex_color[x:x + 2] for x in [1, 3, 5]]
    new_rgb_int = [int(hex_value, 16) + brightness_offset for hex_value in rgb_hex]
    new_rgb_int = [min([255, max([0, i])]) for i in new_rgb_int]  # make sure new values are between 0 and 255
    # hex() produces "0x88", we want just "88"
    return "#" + "".join([hex(i)[2:] for i in new_rgb_int])


def add_session_to_request(request):
    """Annotate a request object with a session"""
    middleware = SessionMiddleware()
    middleware.process_request(request)
    request.session.save()


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
        ]
