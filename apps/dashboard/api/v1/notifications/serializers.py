from __future__ import division
from rest_framework import serializers
from apps.dashboard.api.v1.utils.serializers import *
import phonenumbers
from django.db.models import *
from django.db.models import Max
from apps.models import *


class APINotificationsGetSerializer(serializers.Serializer):
	def update(self, instance, validated_data):
		pass

	def create(self, validated_data):
		pass

	search = serializers.CharField(required=False, allow_blank=True, max_length=256)

	read = serializers.NullBooleanField(required=False)

	page = serializers.IntegerField(default=1)

	per_page = serializers.IntegerField(default=10)

	no_pagination = serializers.NullBooleanField(required=False)

	def validate_account_id(self, value):
		if value is not None:
			if CoreAccount.objects.filter(id=value).exists() is False:
				raise serializers.ValidationError('account id does not exists')
		return value


class APINotificationsPostSerializer(serializers.Serializer):
	def update(self, instance, validated_data):
		pass

	def create(self, validated_data):
		pass

	title = serializers.CharField(required=True, allow_blank=False, max_length=256)

	description = serializers.CharField(required=False, allow_blank=True, max_length=1024)

	restaurant_id = serializers.IntegerField(required=False, min_value=1, allow_null=True)

	account_id = serializers.IntegerField(required=False, min_value=1, allow_null=True)

	read = serializers.NullBooleanField(required=False)

	people = serializers.IntegerField(required=False, min_value=1)

	uuid = serializers.CharField(required=False, allow_blank=True, max_length=255)

	def validate_restaurant_id(self, value):
		if value is not None:
			if CoreRestaurant.objects.filter(id=value).exists() is False:
				raise serializers.ValidationError('restaurant id does not exists')
		return value

	def validate_account_id(self, value):
		if value is not None:
			if CoreAccount.objects.filter(id=value).exists() is False:
				raise serializers.ValidationError('account id does not exists')
		return value


class APINotificationsDeleteSerializer(serializers.Serializer):
	def update(self, instance, validated_data):
		pass

	def create(self, validated_data):
		pass

	id = serializers.IntegerField(allow_null=False)

	@staticmethod
	def validate_id(value):
		if CoreNotification.objects.filter(id=value).exists() is False:
			raise serializers.ValidationError('notification id does not exists')

		return value


class CoreNotificationSerializer(serializers.ModelSerializer):
	class Meta:
		model = CoreNotification
