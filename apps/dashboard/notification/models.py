from apps.dashboard.account.models import CoreAccount
from apps.dashboard.models import *
import time


class CoreNotificationType(models.Model):
	code = models.CharField(max_length=64, unique=True)

	description = models.TextField(null=True)

	name = models.CharField(max_length=256, null=True)

	class Meta:
		db_table = 'core_notification_type'


class CoreNotification(models.Model):
	title = models.CharField(max_length=255)

	description = models.TextField(null=True)

	account = models.ForeignKey(CoreAccount, related_name='notifications', null=True, on_delete=models.SET_NULL)

	type = models.ForeignKey(CoreNotificationType, related_name='notifications', null=True, on_delete=models.SET_NULL)

	created = models.BigIntegerField(null=True)

	modified = models.BigIntegerField(null=True)

	read = models.BooleanField(default=False)

	class Meta:
		db_table = 'core_notification'

	def save(self, *args, **kwargs):
		""" On save, update timestamps """
		if not self.id:
			self.created = int(time.time())
		self.modified = int(time.time())
		return super(CoreNotification, self).save(*args, **kwargs)
