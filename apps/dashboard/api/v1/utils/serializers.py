from rest_framework import serializers
from apps.dashboard.models import *
from apps.models import *


class UtilCountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilCountry
        fields = ('id', 'code', 'name',)
