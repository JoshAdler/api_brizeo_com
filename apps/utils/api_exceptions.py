from rest_framework import status
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
import json
import ast

# custom exception handler used by django rest framework.  Configured in settings.py
# this is used to handle all error message and add additional
# details if required.


def custom_exception_handler(exc, context):
    # calling default handler to extract data.
    response = exception_handler(exc=exc, context=context)

    # this dictionary will hold api specific information.
    api = dict()

    api['version'] = 'v1'
    api['path'] = '/api/v1/'

    # Now add the HTTP status code to the response.
    if response is not None:

        api_response = dict()

        api_response['code'] = response.data.get('code', None)

        api_response['detail'] = response.data.get('detail', None)

        api_response['message'] = response.data.get('message', None)

        api_response['status'] = response.data.get('status', None)

        api_response['errors'] = response.data.get('errors', None)

        api_response['status_code'] = response.status_code

        response.data = {'response': api_response, 'api': api}

    return response


# exception for failed authentication.
class AuthenticationFailed(APIException):
    # we can override response by adding a message dict and then assigning it to "default_details"
    # message = dict()
    #
    # message['status_code'] = status.HTTP_401_UNAUTHORIZED
    #
    # message['result'] = 'error'
    #
    # message['info'] = 'Invalid username or password.'

    # http status code we need to send.
    status_code = status.HTTP_401_UNAUTHORIZED


# default_detail = message


# exception if any field is missing.
class ExceptionDefault(APIException):
    status_code = status.HTTP_400_BAD_REQUEST

    default_detail = 'A server error occurred.'

    def __init__(self, detail=None):
        if detail is not None:
            self.detail = detail
        else:
            self.detail = self.default_detail

    def __str__(self):
        return self.detail


# exception if any field is missing.
class ExceptionMissingFields(APIException):
    status_code = status.HTTP_200_OK


# exception when user is not a reseller
class ExceptionNotReseller(APIException):
    status_code = status.HTTP_200_OK


# exception if email entered is not valid.
class ExceptionEmailNotValid(APIException):
    status_code = status.HTTP_200_OK


# exception if username is already used by another user.
class ExceptionUsernameAlreadyExists(APIException):
    status_code = status.HTTP_200_OK


# exception if email is already used by another user.
class ExceptionEmailAlreadyExists(APIException):
    status_code = status.HTTP_200_OK


# exception for situation if we are not able to add new user for some reason.
class ExceptionUnableToAddUser(APIException):
    status_code = status.HTTP_200_OK


# exception when unable to get account details from kazoo server.
class ExceptionUnableToGetAccountDetailsFromKazoo(APIException):
    status_code = status.HTTP_200_OK


# exception if any field is missing.
class ExceptionUnknownError(APIException):
    status_code = status.HTTP_200_OK
