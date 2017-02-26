# importing the settings.py file so that we can use some of the settings.
from django.conf import settings

# importing some helper methods
from apps.api.v1.utils.api_helpers import *

# requests is module to make http requests.
import requests

# we will use json to format our data before sending it to kazoo api.
import json

import pusher

artnet_settings = ArtnetSettings.objects.get(is_active=True)

# # get kazoo api url from settings file.
# NEXMO_YOURaPI_KEY = getattr(settings, 'NEXMO_YOURaPI_KEY')
# NEXMO_YOURaPI_SECRET = getattr(settings, 'NEXMO_YOURaPI_SECRET')
# NEXMO_PHONE_NUMBER = getattr(settings, 'NEXMO_PHONE_NUMBER')

data_type = 'JSON'


def pusher_send_message(channel=None, event=None, message=None):

    p = pusher.Pusher(
        app_id=artnet_settings.pusher_app_id.encode("utf-8"),
        key=artnet_settings.pusher_key.encode("utf-8"),
        secret=artnet_settings.pusher_secret.encode("utf-8")
    )

    p[channel].trigger(event, message)

    return ''