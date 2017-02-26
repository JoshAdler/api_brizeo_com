from rest_framework.views import APIView
from rest_framework.response import Response
from serializers import *
from apps.dashboard.api.v1.utils.api_exceptions import *
from apps.dashboard.api.v1.utils.api_responses import *
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, MultiPartParser, JSONParser
import mimetypes
from apps.dashboard.api.v1.utils.api_helpers import random_code
import uuid
import boto3


class APIAccount(APIView):
    permission_classes = ()

    def get(self, request):

        if request.user.is_authenticated():
            account = CoreAccountSerializer(request.user.member.account).data
        else:
            account = None

        content = {
            'account': account
        }

        return Response(content)

    def patch(self, request):

        try:

            account = request.user.member.account

            serializer = APIAccountUpdateSerializer(data=self.request.data, context={'member_id': account.id})

            if serializer.is_valid():

                business_name = serializer.validated_data.get('business_name')

                tax_id = serializer.validated_data.get('tax_id')

                trade_discount = serializer.validated_data.get('trade_discount')

                business_email = serializer.validated_data.get('business_email')

                phone = serializer.validated_data.get('phone')

                address1 = serializer.validated_data.get('address1')

                address2 = serializer.validated_data.get('address2')

                city = serializer.validated_data.get('city')

                state = serializer.validated_data.get('state')

                country = serializer.validated_data.get('country')

                latitude = serializer.validated_data.get('latitude')

                longitude = serializer.validated_data.get('longitude')

                contact_email = serializer.validated_data.get('contact_email')

                store_url = serializer.validated_data.get('store_url')

                facebook = serializer.validated_data.get('facebook')

                twitter = serializer.validated_data.get('twitter')

                google = serializer.validated_data.get('google')

                instagram = serializer.validated_data.get('instagram')

                description = serializer.validated_data.get('description')

                account.business_name = business_name

                account.tax_id = tax_id

                account.trade_discount = trade_discount

                account.business_email = business_email

                account.phone = phone

                account.address1 = address1

                account.address2 = address2

                account.city = city

                account.state = state

                account.country_id = country

                account.latitude = latitude

                account.longitude = longitude

                account.contact_email = contact_email

                account.store_url = store_url

                account.facebook = facebook

                account.twitter = twitter

                account.google = google

                account.instagram = instagram

                account.description = description

                account.save()

                response = response_account_updated()

            else:
                raise ExceptionDefault(detail=response_action_failed(errors=serializer.errors))

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'response': response,
        }

        return Response(content)


class APIAccountBusinessLogo(APIView):
    parser_classes = (MultiPartParser, MultiPartParser, JSONParser,)

    def put(self, request):
        try:

            serializer = APIAccountBusinessLogoSerializer(data=self.request.data)

            # check if values are valid.
            if serializer.is_valid():

                file = serializer.validated_data.get('file')

                extension = os.path.splitext(file.name)[1]

                #############################################
                # FILE UPLOAD
                #############################################

                # check if we are using local server or live server
                if ':8' in request.get_host():

                    directory = 'static/uploads/'
                else:
                    directory = '/home/brizeo/django/app_brizeo_com/static/uploads/'

                # create directory if it's not there already.
                if not os.path.exists(directory):
                    os.makedirs(directory)

                # generate random file name
                random_file_name = str(uuid.uuid4()) + extension

                # file with directory.
                media_file = directory + random_file_name

                with open(media_file, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)

                destination.close()

                if 'image' in mimetypes.guess_type(media_file, strict=True)[0] or 'video' in \
                        mimetypes.guess_type(media_file, strict=True)[0]:

                    # Let's use Amazon S3
                    s3 = boto3.resource('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                        aws_secret_access_key=settings.AWS_SECRET_KEY)

                    # Upload a new file
                    data = open(media_file, 'rb')

                    s3.Bucket(settings.AWS_BUCKET_NAME).put_object(Key=random_file_name, Body=data, ContentType=
                    mimetypes.guess_type(media_file, strict=True)[0],
                                                                   ACL='public-read')

                    # now remove the media file because we don't need it
                    # destination.close()
                    # os.remove(media_file)

                    account = request.user.member.account

                    # remove previous logo
                    if account.business_logo is not None:
                        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                          aws_secret_access_key=settings.AWS_SECRET_KEY)
                        boto_response = s3.delete_object(
                            Bucket=settings.AWS_BUCKET_NAME,
                            Key=account.business_logo,
                        )

                    account.business_logo = random_file_name

                    account.save()

                    response = response_business_logo_added()
                else:
                    # destination.close()
                    # os.remove(media_file)
                    response = response_business_logo_not_supported()

            else:
                raise ExceptionDefault(detail=response_action_failed(errors=serializer.errors))

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'response': response,
            'media': {
                'name': random_file_name,
                'url': 'https://s3.amazonaws.com/%s/%s' % (settings.AWS_BUCKET_NAME, random_file_name)
            },
        }

        return Response(content)

    def delete(self, request):
        try:
            account = request.user.member.account

            # Let's use Amazon S3
            s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                              aws_secret_access_key=settings.AWS_SECRET_KEY)

            if account.business_logo is not None:
                boto_response = s3.delete_object(
                    Bucket=settings.AWS_BUCKET_NAME,
                    Key=account.business_logo,
                )

                account.business_logo = None

                account.save()

            response = response_business_logo_deleted()

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'response': response,
        }

        return Response(content)


class APIAccountStoreLogo(APIView):
    parser_classes = (MultiPartParser, MultiPartParser, JSONParser,)

    def put(self, request):
        try:

            serializer = APIAccountStoreLogoSerializer(data=self.request.data)

            # check if values are valid.
            if serializer.is_valid():

                file = serializer.validated_data.get('file')

                extension = os.path.splitext(file.name)[1]

                #############################################
                # FILE UPLOAD
                #############################################

                # check if we are using local server or live server
                if ':8' in request.get_host():

                    directory = 'static/uploads/'
                else:
                    directory = '/home/brizeo/django/app_brizeo_com/static/uploads/'

                # create directory if it's not there already.
                if not os.path.exists(directory):
                    os.makedirs(directory)

                # generate random file name
                random_file_name = str(uuid.uuid4()) + extension

                # file with directory.
                media_file = directory + random_file_name

                with open(media_file, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)

                destination.close()

                if 'image' in mimetypes.guess_type(media_file, strict=True)[0] or 'video' in \
                        mimetypes.guess_type(media_file, strict=True)[0]:

                    # Let's use Amazon S3
                    s3 = boto3.resource('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                        aws_secret_access_key=settings.AWS_SECRET_KEY)

                    # Upload a new file
                    data = open(media_file, 'rb')

                    s3.Bucket(settings.AWS_BUCKET_NAME).put_object(Key=random_file_name, Body=data, ContentType=
                    mimetypes.guess_type(media_file, strict=True)[0],
                                                                   ACL='public-read')

                    # now remove the media file because we don't need it
                    # destination.close()
                    # os.remove(media_file)

                    account = request.user.member.account

                    # remove previous logo
                    if account.store_logo is not None:
                        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                          aws_secret_access_key=settings.AWS_SECRET_KEY)
                        boto_response = s3.delete_object(
                            Bucket=settings.AWS_BUCKET_NAME,
                            Key=account.store_logo,
                        )

                    account.store_logo = random_file_name

                    account.save()

                    response = response_store_logo_added()
                else:
                    # destination.close()
                    # os.remove(media_file)
                    response = response_store_logo_not_supported()

            else:
                raise ExceptionDefault(detail=response_action_failed(errors=serializer.errors))

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'response': response,
            'media': {
                'name': random_file_name,
                'url': 'https://s3.amazonaws.com/%s/%s' % (settings.AWS_BUCKET_NAME, random_file_name)
            },
        }

        return Response(content)

    def delete(self, request):
        try:
            account = request.user.member.account

            # Let's use Amazon S3
            s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                              aws_secret_access_key=settings.AWS_SECRET_KEY)

            if account.store_logo is not None:
                boto_response = s3.delete_object(
                    Bucket=settings.AWS_BUCKET_NAME,
                    Key=account.store_logo,
                )

                account.store_logo = None

                account.save()

            response = response_store_logo_deleted()

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'response': response,
        }

        return Response(content)
