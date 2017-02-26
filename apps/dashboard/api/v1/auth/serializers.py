from rest_framework import serializers
from django.contrib.auth import authenticate, login, logout
from apps.models import *
import json


class APIAuthLoginSerializer(serializers.Serializer):
    def __init__(self, **kwargs):
        super(APIAuthLoginSerializer, self).__init__(**kwargs)
        self.member = None

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    def member(self, validated_data):
        self.member = CoreMember.objects.get(user__email=validated_data['email'])

    email = serializers.EmailField(required=True, allow_blank=False)

    password = serializers.CharField(max_length=128, required=True, allow_blank=False)

    remember_me = serializers.NullBooleanField()

    @staticmethod
    def validate_email(value):
        """

        :param value:
        :return:
        """
        if CoreMember.objects.filter(email=value).exists() is False:
            raise serializers.ValidationError('email doesn\'t exists')

        elif CoreMember.objects.filter(email=value).exists() is True:

            member = CoreMember.objects.get(email=value)

            if member.status.code == 'pending':
                raise serializers.ValidationError('your account is in pending status. Please confirm your email.')

            elif member.status.code == 'suspended':
                raise serializers.ValidationError(
                    'your account is in suspended status. Please contact your account admin.')

        return value

    def validate_password(self, value):
        """

        :param value:
        :return:
        """
        initial_values = self.get_initial()

        email = initial_values['email']

        if CoreMember.objects.filter(email=email).exists():

            member = CoreMember.objects.get(email=email)

            user = member.user

            if authenticate(username=user.username, password=value) is None:
                raise serializers.ValidationError('wrong email & password combination')
            else:
                user = authenticate(username=user.username, password=value)

                self.member = user.member

                return value
        else:
            raise serializers.ValidationError('wrong email & password combination')


class APIAuthSignupSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    first_name = serializers.CharField(required=True, allow_blank=False)

    last_name = serializers.CharField(required=True, allow_blank=False)

    email = serializers.EmailField(required=True, allow_blank=False)

    password = serializers.CharField(min_length=8, max_length=128, required=True, allow_blank=False)

    password_confirm = serializers.CharField(min_length=8, max_length=128, required=True, allow_blank=False)

    accept_terms = serializers.BooleanField(required=True)

    @staticmethod
    def validate_email(value):
        """
        :param value:
        :return:
        """
        if CoreMember.objects.filter(email=value).exists():
            raise serializers.ValidationError('email already exists')
        return value

    def validate_password(self, value):
        """
        :param value:
        :return:
        """
        initial_values = self.get_initial()

        if value != initial_values['password_confirm']:
            raise serializers.ValidationError('password do not match')
        return value

    def validate_password_confirm(self, value):
        """
        :param value:
        :return:
        """
        initial_values = self.get_initial()

        if value != initial_values['password']:
            raise serializers.ValidationError('password do not match')
        return value

    def validate_accept_terms(self, value):
        """
        :param value:
        :return:
        """
        if value is False:
            raise serializers.ValidationError('please accept terms of services')
        return value


class APIAuthInvite(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    first_name = serializers.CharField(required=True, allow_blank=False)

    last_name = serializers.CharField(required=True, allow_blank=False)

    email = serializers.EmailField(required=True, allow_blank=False)

    @staticmethod
    def validate_email(value):
        """
        :param value:
        :return:
        """
        if CoreInvite.objects.filter(email=value).exists():
            raise serializers.ValidationError('invite already exists')
        return value


class APIAuthResendEmailSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    email = serializers.EmailField(required=True, allow_blank=False)

    @staticmethod
    def validate_email(value):
        if User.objects.filter(email=value).exists() is False:
            raise serializers.ValidationError('email does not exists')

        elif User.objects.filter(email=value).exists() is True:
            member = CoreMember.objects.get(user__email=value)
            if member.status.code != "pending":
                raise serializers.ValidationError('your account is already active')
        return value


class APIAuthResetSerializer(serializers.Serializer):
    def __init__(self, **kwargs):
        super(APIAuthResetSerializer, self).__init__(**kwargs)
        self.member = None

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    email = serializers.EmailField(required=True, allow_blank=False)

    def validate_email(self, value):
        """

        :param value:
        :return:
        """
        if CoreMember.objects.filter(user__email=value).exists() is False:
            raise serializers.ValidationError('email doesn\'t exists')
        elif CoreMember.objects.filter(user__email=value).exists() is True:
            self.member = CoreMember.objects.get(user__email=value)
        return value


class APIAuthResetSaveSerializer(serializers.Serializer):
    def __init__(self, **kwargs):
        super(APIAuthResetSaveSerializer, self).__init__(**kwargs)
        self.member = None

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    password = serializers.CharField(min_length=4, required=True, allow_blank=False)

    password_confirm = serializers.CharField(min_length=4, required=True, allow_blank=False)

    password_reset_token = serializers.CharField(required=True, allow_blank=False)

    def validate_password(self, value):
        """

        :param value:
        :return:
        """
        initial_values = self.get_initial()

        if value != initial_values['password_confirm']:
            raise serializers.ValidationError('password do not match')
        return value

    def validate_password_confirm(self, value):
        """

        :param value:
        :return:
        """
        initial_values = self.get_initial()

        if value != initial_values['password']:
            raise serializers.ValidationError('password do not match')
        return value

    def validate_password_reset_token(self, value):

        if CoreMember.objects.filter(password_reset_token=value).exists() is False:
            raise serializers.ValidationError('wrong password reset token')
        elif CoreMember.objects.filter(password_reset_token=value).exists() is True:
            self.member = CoreMember.objects.get(password_reset_token=value)
        return value
