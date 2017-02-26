from django.db import models
from django.contrib.auth.models import User
from apps.dashboard.account.models import CoreAccount
from apps.dashboard.utils.models import UtilCountry
import time


class CoreMember(models.Model):
	user = models.OneToOneField(User, related_name='member')

	email = models.EmailField(unique=True)

	first_name = models.CharField(max_length=30, blank=True)

	last_name = models.CharField(max_length=30, blank=True)

	account = models.ForeignKey(CoreAccount, related_name='members', null=True, on_delete=models.SET_NULL)

	phone = models.CharField(max_length=32, null=True)

	email_verification_token = models.CharField(null=True, max_length=128)

	password_reset_token = models.CharField(null=True, max_length=128)

	created = models.BigIntegerField(null=True)

	modified = models.BigIntegerField(null=True)

	class Meta:
		db_table = 'core_member'

	def save(self, *args, **kwargs):
		""" On save, update timestamps """
		if not self.id:
			self.created = int(time.time())
		self.modified = int(time.time())
		return super(CoreMember, self).save(*args, **kwargs)
