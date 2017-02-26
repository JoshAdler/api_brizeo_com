from rest_framework.response import Response
from rest_framework.views import APIView
from apps.dashboard.api.v1.utils.api_exceptions import *
from serializers import *


class APIUtilsCountries(APIView):
    permission_classes = ()

    def get(self, request):
        try:

            countries_list = UtilCountry.objects.filter().order_by('-priority', 'name')

            countries_serializer = UtilCountrySerializer(countries_list, many=True)

        except Exception as e:

            if hasattr(e, 'detail'):
                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'countries': countries_serializer.data,
        }
        return Response(content)
