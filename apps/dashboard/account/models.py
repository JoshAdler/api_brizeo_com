from django.db import models
import time
from apps.dashboard.billing.models import CoreBilling
from apps.dashboard.utils.models import UtilCountry
from apps.dashboard.api.v1.utils.api_helpers import random_code


class CoreAccountStatus(models.Model):
	code = models.CharField(max_length=64, unique=True)

	name = models.CharField(max_length=255)

	description = models.TextField(null=True)

	class Meta:
		db_table = 'core_account_status'


class CoreAccount(models.Model):
	code = models.CharField(max_length=128, unique=True)

	status = models.ForeignKey(CoreAccountStatus, null=True, related_name='accounts', on_delete=models.SET_NULL)

	billing = models.ForeignKey(CoreBilling, null=True, related_name='accounts', on_delete=models.SET_NULL)

	created = models.BigIntegerField(null=True)

	modified = models.BigIntegerField(null=True)

	class Meta:
		db_table = 'core_account'

	def save(self, *args, **kwargs):
		""" On save, update timestamps """
		if not self.id:
			self.created = int(time.time())
			self.code = random_code(CoreAccount)
		self.modified = int(time.time())
		if self.store_url is not None:
			self.store_url = self.store_url.strip()
		return super(CoreAccount, self).save(*args, **kwargs)
