# # importing the settings.py file so that we can use some of the settings.
#
# # importing some helper methods
# from apps.api.v1.utils.helpers import *
#
# # requests is module to make http requests.
#
# # we will use json to format our data before sending it to kazoo api.
#
# import pusher
#
# # get default system settings
# core_settings = CoreSettings.objects.get(is_active=True)
#
# PUSHER_APP_ID = core_settings.pusher_app_id
# PUSHER_KEY = core_settings.pusher_key
# PUSHER_SECRET = core_settings.pusher_secret
# PUSHER_DEFAULT_EVENT = core_settings.pusher_default_event
#
# data_type = 'JSON'
#
#
# def pusher_send_message(channel=None, event=None, message=None):
#     p = pusher.Pusher(
#             app_id=PUSHER_APP_ID.encode("utf-8"),
#             key=PUSHER_KEY.encode("utf-8"),
#             secret=PUSHER_SECRET.encode("utf-8")
#     )
#
#     p[channel].trigger(event, message)
#
#     return ''
