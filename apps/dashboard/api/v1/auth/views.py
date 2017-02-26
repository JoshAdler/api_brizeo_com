import stripe
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.dashboard.api.v1.utils.api_helpers import generate_random_email_verification
from apps.dashboard.api.v1.utils.api_mail import *
from apps.dashboard.api.v1.utils.api_responses import *
from apps.dashboard.api.v1.utils.api_exceptions import *
from serializers import *


class APIAuthLogin(APIView):
    permission_classes = ()

    def post(self, request):

        try:

            serializer = APIAuthLoginSerializer(data=self.request.data)

            if serializer.is_valid():

                token, created = Token.objects.get_or_create(user=serializer.member.user)

                login(request, serializer.member.user)

                response = response_login_successful()

            else:
                raise ExceptionDefault(detail=response_login_failed(errors=serializer.errors))

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
            'api_token': token.key,
        }

        # sending final response.
        return Response(content)


class APIAuthLogout(APIView):
    permission_classes = ()

    def get(self, request):

        try:

            logout(request)

            response = response_logout_successful()

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


class APIAuthSignup(APIView):
    permission_classes = ()

    def post(self, request):

        try:

            serializer = APIAuthSignupSerializer(data=self.request.data)

            if serializer.is_valid():

                app_settings = CoreSetting.objects.get(is_active=True)

                email = serializer.validated_data.get('email').lower()

                first_name = serializer.validated_data.get('first_name')

                last_name = serializer.validated_data.get('last_name')

                '''
                Create USER
                '''
                user = User.objects.create_user(generate_random_username(), email,
                                                serializer.validated_data.get('password'))

                user.first_name = first_name

                user.last_name = last_name

                user.save()

                Token.objects.get_or_create(user=user)

                '''
                Adding Account
                '''
                account = CoreAccount()

                account.status = CoreAccountStatus.objects.get(code='pending')

                account.save()

                '''
                Create Generic MEMBER
                '''
                member = CoreMember()

                member.user = user

                member.email = email

                member.first_name = first_name

                member.last_name = last_name

                member.status = CoreMemberStatus.objects.get(code='active')

                member.account = account

                member.email_verification_token = generate_random_email_verification()

                '''
                Adding ROLES
                '''
                role = CoreMemberRole.objects.get(code='standard')

                member.role = role

                member.save()

                '''
                Creating Billing
                '''
                # creating customer in stripe
                stripe.api_key = app_settings.stripe_secret_key

                # first we will create customer and then subscription otherwise attaching customer
                # to paid plan will result in failure
                customer = stripe.Customer.create(
                    description=member.first_name + ' ' + member.last_name,
                    email=member.email,
                    account_balance=0,
                    plan=app_settings.stripe_default_dashboard_plan_id,
                    quantity=0,
                )

                billing = CoreBilling()

                billing.stripe_subscription_id = customer.subscriptions.data[0]['id']

                billing.stripe_customer_id = customer.id

                billing.plan = CorePlan.objects.get(code=app_settings.stripe_default_dashboard_plan_id)

                billing.save()

                account.billing = billing

                account.save()

                '''
                Now sending email verification
                '''
                action_url = 'https://' if request.is_secure() else 'http://' + request.get_host() + '/dashboard/signup/verify/' + member.email_verification_token

                send_mail = SendEmail()

                send_mail.email_address_validation(recipient=member.email, ACTION_URL=action_url, FIRST_NAME=member.first_name, LAST_NAME=member.last_name)
                send_mail.robot_message(
                    MESSAGE='Congratulations, a user %s %s with email (%s) just registered.' % (
                        user.first_name, user.last_name, user.email))

                response = response_signup_successful()

            else:
                raise ExceptionDefault(detail=response_signup_failed(errors=serializer.errors))

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {'response': response}

        return Response(content)


class APIAuthInvite(APIView):
    permission_classes = ()

    def post(self, request):

        try:

            serializer = APIAuthInvite(data=self.request.data)

            if serializer.is_valid():

                email = serializer.validated_data.get('email').lower()

                first_name = serializer.validated_data.get('first_name')

                last_name = serializer.validated_data.get('last_name')

                '''
                Create USER
                '''
                user = User.objects.create_user(generate_random_username(), email,
                                                serializer.validated_data.get('password'))

                user.first_name = first_name

                user.last_name = last_name

                user.save()

                Token.objects.get_or_create(user=user)

                '''
                Adding ORGANIZATION
                '''
                # organization = CoreOrganization()
                #
                # organization.name = org_name
                #
                # organization.save()

                '''
                Create Generic MEMBER
                '''
                member = CoreMember()

                member.user = user

                member.status = CoreMemberStatus.objects.get(code='pending')

                member.role = CoreMemberRole.objects.get(code='standard')

                member.email_verification_token = generate_random_email_verification()

                member.save()

                '''
                Now sending email verification
                '''
                action_url = 'https://' if request.is_secure() else 'http://' + request.get_host() + '/signup/verify/' + member.email_verification_token

                send_mail = SendEmail()

                send_mail.email_address_validation(recipient=user.email, ACTION_URL=action_url,
                                                   FIRST_NAME=user.first_name,
                                                   LAST_NAME=user.last_name)
                send_mail.robot_message(
                    MESSAGE='Congratulations, a user %s %s with email (%s) just registered.' % (
                        user.first_name, user.last_name, user.email))

                response = response_signup_successful()

            else:
                raise ExceptionDefault(detail=response_signup_failed(errors=serializer.errors))

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {'response': response}

        return Response(content)


class APIAuthResendEmail(APIView):
    permission_classes = ()

    def post(self, request):

        serializer = APIAuthResendEmailSerializer(data=self.request.data)

        try:
            if serializer.is_valid():

                email = serializer.validated_data.get('email').lower()

                member = CoreMember.objects.get(user__email=email)

                member.email_verification_token = generate_random_email_verification()

                member.save()

                '''
                Now sending email verification
                '''
                action_url = 'https://' if request.is_secure() else 'http://' + request.get_host() + '/signup/verify/' + member.email_verification_token

                send_mail = SendEmail()

                send_mail.email_address_validation(recipient=member.user.email, ACTION_URL=action_url,
                                                   FIRST_NAME=member.user.first_name,
                                                   LAST_NAME=member.user.last_name)

                response = response_verification_email_sent()

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

        content = {'response': response, }

        # sending final response.
        return Response(content)


class APIAuthReset(APIView, APIException):
    permission_classes = ()

    def post(self, request):

        try:

            serializer = APIAuthResetSerializer(data=self.request.data)

            if serializer.is_valid():

                member = serializer.member

                member.password_reset_token = generate_password_reset_token()

                member.save()

                action_url = 'https://' if request.is_secure() else 'http://' + request.get_host() + '/reset/' + member.password_reset_token

                send_mail = SendEmail()

                send_mail.password_reset(recipient=member.user.email, ACTION_URL=action_url,
                                         IP_ADDRESS=get_client_ip(request),
                                         FIRST_NAME=member.user.first_name,
                                         LAST_NAME=member.user.last_name
                                         )

                response = response_password_reset()
            else:
                raise ExceptionDefault(detail=response_signup_failed(errors=serializer.errors))

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {'response': response}

        # sending final response.
        return Response(content)


class APIAuthResetSave(APIView, APIException):
    permission_classes = ()

    def post(self, request):

        try:

            serializer = APIAuthResetSaveSerializer(data=self.request.data)

            if serializer.is_valid():

                password = serializer.validated_data.get('password')

                member = serializer.member

                member.user.set_password(password)

                member.password_reset_token = None

                member.save()

                response = response_password_updated()

            else:
                raise ExceptionDefault(detail=response_signup_failed(errors=serializer.errors))

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'response': response
        }

        return Response(content)
