# # importing the settings.py file so that we can use some of the settings.
# from django.conf import settings
#
# # importing some helper methods
# from apps.api.v1.utils.helpers import *
#
# # requests is module to make http requests.
# import requ
# # we will use json to format our data before sending it to kazoo api.
# import json
#
# # get default system settings
# core_settings = CoreSettings.objects.get(is_active=True)
#
# # get kazoo api url from settings file.
# NEXMOaPI_KEY = core_settings.nexmoapi_key
# NEXMOaPI_SECRET = core_settings.nexmoapi_secret
# NEXMO_PHONE_NUMBER = core_settings.nexmo_phone_number
#
# data_type = 'JSON'
#
#
# def nexmo_send_message(to, text):
#     api_url = 'https://rest.nexmo.com/sms/json'
#
#     data = {
#         "api_key": NEXMOaPI_KEY,
#         "api_secret": NEXMOaPI_SECRET,
#         "from": NEXMO_PHONE_NUMBER,
#         "to": to,
#         "text": text,
#     }
#
#     headers = {'Content-type': 'application/x-www-form-urlencoded'}
#
#     result = requests.post(api_url, data=data, headers=headers)
#
#     return result
#
#
# def nexmo_call(to, answer_url):
#     api_url = 'https://rest.nexmo.com/call/json'
#
#     data = {
#         "api_key": NEXMOaPI_KEY,
#         "api_secret": NEXMOaPI_SECRET,
#         "from": NEXMO_PHONE_NUMBER,
#         "to": to,
#         "answer_url": answer_url,
#     }
#
#     headers = {'Content-type': 'application/x-www-form-urlencoded'}
#
#     result = requests.post(api_url, data=data, headers=headers)
#
#     return result
#
#
# def nexmo_verify_request(number):
#     api_url = 'https://api.nexmo.com/verify/json'
#
#     data = {
#         "api_key": NEXMOaPI_KEY,
#         "api_secret": NEXMOaPI_SECRET,
#         "number": number,
#         "brand": 'Artwork Network',
#     }
#
#     headers = {'Content-type': 'application/x-www-form-urlencoded'}
#
#     result = requests.post(api_url, data=data, headers=headers)
#
#     return result
#
#
# def nexmo_check_request(code, request_id):
#
#     api_url = 'https://api.nexmo.com/verify/check/json'
#
#     data = {
#         "api_key": NEXMOaPI_KEY,
#         "api_secret": NEXMOaPI_SECRET,
#         "code": code,
#         "request_id": request_id,
#     }
#
#     headers = {'Content-type': 'application/x-www-form-urlencoded'}
#
#     result = requests.post(api_url, data=data, headers=headers)
#
#     return result
#
#
