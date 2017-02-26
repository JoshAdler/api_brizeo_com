from rest_framework import serializers
from django.contrib.auth.models import User
from apps.models import *
import phonenumbers
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token


class CoreBillingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreBilling


class CoreAccountSerializer(serializers.ModelSerializer):
    billing = CoreBillingSerializer()

    class Meta:
        model = CoreAccount


class APIProfileUpdateSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    id = serializers.IntegerField(allow_null=False)

    first_name = serializers.CharField(required=True, allow_blank=True, max_length=64)

    last_name = serializers.CharField(required=True, allow_blank=True, max_length=64)

    email = serializers.EmailField(required=True, allow_blank=False)

    phone = serializers.CharField(allow_null=True, allow_blank=True, max_length=32)

    address1 = serializers.CharField(allow_null=True, allow_blank=True, max_length=1024)

    address2 = serializers.CharField(allow_null=True, allow_blank=True, max_length=1024)

    city = serializers.CharField(allow_null=True, allow_blank=True, max_length=128)

    state = serializers.CharField(allow_null=True, allow_blank=True, max_length=128)

    country_id = serializers.IntegerField(allow_null=False, required=True)

    @staticmethod
    def validate_id(value):
        if CoreMember.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('dealer id does not exists')
        return value

    @staticmethod
    def validate_country_id(value):
        if UtilCountry.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('country id does not exists')
        return value

    @staticmethod
    def validate_phone(value):
        if value is not None:
            if phonenumbers.is_possible_number_string(value, None) is False:
                raise serializers.ValidationError('phone number format must be like: +19051112222')
        return value

    def validate_email(self, value):

        initial_values = self.get_initial()

        id = initial_values['id']

        member = CoreMember.objects.get(id=id)

        if member.email != value and CoreMember.objects.filter(email=value).exists():
            raise serializers.ValidationError('dealer with same email already exists')
        return value


class APIProfilePasswordSerializer(serializers.Serializer):
    def __init__(self, **kwargs):
        super(APIProfilePasswordSerializer, self).__init__(**kwargs)
        self.member = None

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    current_password = serializers.CharField(required=True, max_length=64)

    new_password = serializers.CharField(required=True, min_length=5, max_length=64)

    confirm_password = serializers.CharField(required=True, min_length=5, max_length=64)

    def validate_current_password(self, value):

        request = self.context['request']

        if authenticate(username=request.user.username, password=value):
            self.member = request.user.member
        else:
            raise serializers.ValidationError('invalid password')

        return value

    def validate_new_password(self, value):

        initial_values = self.get_initial()

        if value != initial_values['confirm_password']:
            raise serializers.ValidationError('password do not match')
        return value

    def validate_confirm_password(self, value):

        initial_values = self.get_initial()

        if value != initial_values['new_password']:
            raise serializers.ValidationError('password do not match')
        return value


class CoreAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreAccount
        fields = ('id', 'business_name',)


class CoreMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    api_token = serializers.SerializerMethodField()
    account = CoreAccountSerializer()
    total_inventory = serializers.SerializerMethodField()
    total_orders = serializers.SerializerMethodField()
    total_sales = serializers.SerializerMethodField()
    total_views = serializers.SerializerMethodField()

    class Meta:
        model = CoreMember
        fields = (
            'id', 'user', 'api_token', 'email', 'first_name', 'last_name', 'address1', 'address2', 'city', 'state',
            'phone',
            'full_name',
            'account',
            'total_inventory',
            'total_orders',
            'total_sales',
            'total_views',
            'country',)

    @staticmethod
    def get_full_name(obj):
        return (obj.first_name or '') + ' ' + (obj.last_name or '')

    @staticmethod
    def get_api_token(obj):
        if Token.objects.filter(user=obj.user).exists():
            api_token = Token.objects.get(user=obj.user).key
        else:
            api_token = ''

        return api_token

    @staticmethod
    def get_total_inventory(obj):
        return CoreInventory.objects.filter(dealer=obj.account, status__code='live').count()

    @staticmethod
    def get_total_orders(obj):
        return 0

    @staticmethod
    def get_total_sales(obj):
        return 0

    @staticmethod
    def get_total_views(obj):
        return 0
