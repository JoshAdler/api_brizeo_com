from rest_framework.views import APIView
from rest_framework.response import Response
from serializers import *
from apps.dashboard.api.v1.utils.api_exceptions import *
from apps.dashboard.api.v1.utils.api_responses import *
from rest_framework.authtoken.models import Token


class APIProfile(APIView):
    permission_classes = ()

    def get(self, request):

        if request.user.is_authenticated():
            profile = CoreMemberSerializer(request.user.member).data
        else:
            profile = None

        content = {
            'profile': profile
        }

        return Response(content)

    def patch(self, request):

        try:

            serializer = APIProfileUpdateSerializer(data=self.request.data)

            if serializer.is_valid():

                id = serializer.validated_data.get('id')

                first_name = serializer.validated_data.get('first_name')

                last_name = serializer.validated_data.get('last_name')

                email = serializer.validated_data.get('email')

                address1 = serializer.validated_data.get('address1')

                address2 = serializer.validated_data.get('address2')

                city = serializer.validated_data.get('city')

                state = serializer.validated_data.get('state')

                country_id = serializer.validated_data.get('country_id')

                phone = serializer.validated_data.get('phone')

                member = CoreMember.objects.get(id=id)

                member.first_name = first_name

                member.last_name = last_name

                member.email = email

                member.phone = phone

                member.address1 = address1

                member.address2 = address2

                member.city = city

                member.state = state

                member.country_id = country_id

                member.phone = phone

                member.save()

                response = response_profile_updated()

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


class APIProfilePassword(APIView):
    def patch(self, request):

        try:

            serializer = APIProfilePasswordSerializer(data=self.request.data, context={'request': request})

            if serializer.is_valid():

                new_password = serializer.validated_data.get('new_password')

                serializer.member.user.set_password(new_password)

                serializer.member.user.save()

                login(request, serializer.member.user)

                # request.user = authenticate(username=serializer.member.user.username, password=new_password)

                response = response_password_updated()

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


class APIProfileAPI(APIView):
    def patch(self, request):

        try:
            # First delete existing token
            if Token.objects.filter(user=request.user).exists():
                api_token = Token.objects.get(user=request.user)
                api_token.delete()

            # Now creating new token.
            Token.objects.get_or_create(user=request.user)

            response = response_token_updated()

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
