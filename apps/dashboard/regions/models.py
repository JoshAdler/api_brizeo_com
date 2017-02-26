from django.db import models
import time


class CoreRegion(models.Model):
	name = models.CharField(max_length=256)

	region = models.CharField(max_length=256)

	endpoint = models.CharField(max_length=256)

	is_active = models.BooleanField(default=True)

	class Meta:
		db_table = 'core_region'
