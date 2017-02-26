from django.db import models


class UtilCountry(models.Model):
    code = models.CharField(max_length=2, null=True)

    name = models.CharField(max_length=45, null=True)

    iso_alpha3 = models.CharField(max_length=3, null=True)

    priority = models.IntegerField(default=0)

    class Meta:
        db_table = 'util_country'
