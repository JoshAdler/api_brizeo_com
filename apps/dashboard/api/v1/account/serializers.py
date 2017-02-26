from rest_framework import serializers
from django.contrib.auth.models import User
from apps.models import *
import phonenumbers
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token


class APIAccountUpdateSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    business_name = serializers.CharField(required=True, allow_blank=True, max_length=64)

    tax_id = serializers.CharField(required=False, allow_blank=True, max_length=64)

    trade_discount = serializers.FloatField(required=False)

    business_email = serializers.EmailField(required=True, allow_blank=False)

    phone = serializers.CharField(required=True, allow_blank=False, max_length=16)

    address1 = serializers.CharField(allow_null=False, allow_blank=True, max_length=128)

    address2 = serializers.CharField(allow_null=True, allow_blank=True, max_length=128)

    city = serializers.CharField(allow_null=False, allow_blank=True, max_length=32)

    state = serializers.CharField(allow_null=False, allow_blank=True, max_length=32)

    country = serializers.IntegerField(allow_null=False, required=True)

    latitude = serializers.FloatField(required=False, allow_null=True)

    longitude = serializers.FloatField(required=False, allow_null=True)

    contact_email = serializers.EmailField(allow_null=False, allow_blank=True)

    store_url = serializers.CharField(allow_null=False, allow_blank=True, max_length=64)

    facebook = serializers.CharField(allow_null=True, allow_blank=True, max_length=64)

    twitter = serializers.CharField(allow_null=True, allow_blank=True, max_length=64)

    google = serializers.CharField(allow_null=True, allow_blank=True, max_length=64)

    instagram = serializers.CharField(allow_null=True, allow_blank=True, max_length=64)

    description = serializers.CharField(allow_null=True, allow_blank=True, max_length=1024)

    store_enabled = serializers.BooleanField()

    def validate_store_url(self, value):

        dealer = CoreAccount.objects.get(id=self.context['member_id'])

        if dashboard.store_url != value and CoreAccount.objects.filter(store_url__iexact=value).exists() is True:
            raise serializers.ValidationError('dealer with store url already exists')
        return value

    @staticmethod
    def validate_country(value):
        if UtilCountry.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('country id does not exists')
        return value

    @staticmethod
    def validate_phone(value):
        if value is not None:
            if phonenumbers.is_possible_number_string(value, None) is False:
                raise serializers.ValidationError('phone number format must be like: +19051112222')
        return value

    @staticmethod
    def validate_trade_discount(value):
        if value is not None:
            if value < 0 or value > 99:
                raise serializers.ValidationError('trade discount must be between 0% and 99%')
        return value


class APIAccountBusinessLogoSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    file = serializers.FileField(required=True, allow_null=False)


class APIAccountStoreLogoSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    file = serializers.FileField(required=True, allow_null=False)


class CoreAccountSerializer(serializers.ModelSerializer):
    business_logo_url = serializers.SerializerMethodField()

    store_logo_url = serializers.SerializerMethodField()

    full_store_url = serializers.SerializerMethodField()

    class Meta:
        model = CoreAccount
        fields = '__all__'

    @staticmethod
    def get_full_store_url(obj):
        if obj.store_url is not None:
            return 'http://%s/%s' % (settings.STORE_DOMAIN, obj.store_url.lower())

    @staticmethod
    def get_business_logo_url(obj):
        if obj.business_logo is not None:
            return 'https://s3.amazonaws.com/%s/%s' % (settings.AWS_BUCKET_NAME, obj.business_logo)

    @staticmethod
    def get_store_logo_url(obj):
        if obj.store_logo is not None:
            return 'https://s3.amazonaws.com/%s/%s' % (settings.AWS_BUCKET_NAME, obj.store_logo)
