import csv
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.dashboard.api.v1.utils.api_exceptions import *
from apps.dashboard.api.v1.utils.api_responses import *
from serializers import *
from apps.dashboard.api.v1.utils.api_helpers import *
from django.db.models import Count
from collections import *
from geopy.geocoders import Nominatim, GoogleV3
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from rest_framework.decorators import permission_classes
from rest_framework.permissions import *
from apps.dashboard.api.v1.utils.api_permissions import *
import stripe


class APINotifications(APIView):
	def get(self, request):
		try:

			serializer = APINotificationsGetSerializer(data=self.request.query_params)

			if serializer.is_valid():

				page = serializer.validated_data.get('search')

				per_page = serializer.validated_data.get('search')

				search = serializer.validated_data.get('search')

				read = serializer.validated_data.get('read')

				no_pagination = serializer.validated_data.get('no_pagination')

				account = request.user.member.account

				query = Q()

				query &= Q(account=account)

				if search is not None:
					query &= (
						Q(title__icontains=search) | Q(uuid__icontains=search) | Q(description__icontains=search) | Q(
							people=search))

				if read is not None:
					query &= Q(read=read)

				notifications_list = CoreNotification.objects.filter(query)

				if no_pagination is True:
					notifications_data = CoreNotificationSerializer(notifications_list, many=True, context={'request': request}).data
					content = {
						'notifications': notifications_data,
						'total_unread_notifications': account.notifications.filter(read=False).count()
					}
				else:
					paginator = Paginator(notifications_list, per_page)

					try:
						notifications = paginator.page(page)

					except PageNotAnInteger:

						notifications = paginator.page(1)

					except EmptyPage:
						notifications = paginator.page(paginator.num_pages)

					notifications_data = CoreNotificationSerializer(notifications, many=True,
					                                                context={'request': request}).data

					if notifications.has_previous():
						previous_page = notifications.previous_page_number()
					else:
						previous_page = 1

					if notifications.has_next():
						next_page_number = notifications.next_page_number()
					else:
						next_page_number = 1

					content = {
						'notifications': notifications_data,
						'total_unread_notifications': account.notifications.filter(read=False).count(),
						'pagination': {
							'page': page,
							'search': search,
							'next_page': next_page_number,
							'start_index': notifications.start_index(),
							'end_index': notifications.end_index(),
							'previous_page': previous_page,
							'total_pages': paginator.num_pages,
							'total_count': paginator.count,
						},
					}

			else:
				raise ExceptionDefault(detail=response_action_failed(errors=serializer.errors))

		except Exception as e:

			if hasattr(e, 'detail'):

				response = e.detail

			else:
				response = dict()
				response['message'] = str(e.message)
				response['status'] = 'error'

			raise ExceptionDefault(detail=response)

		content = content

		return Response(content)

	def post(self, request):
		try:
			serializer = APINotificationsPostSerializer(data=self.request.data)

			if serializer.is_valid():
				title = serializer.validated_data.get('title')

				description = serializer.validated_data.get('description')

				restaurant_id = serializer.validated_data.get('restaurant_id')

				account_id = serializer.validated_data.get('account_id')

				read = serializer.validated_data.get('read')

				people = serializer.validated_data.get('people')

				uuid = serializer.validated_data.get('uuid')

				notification = CoreNotification()

				notification.title = title

				notification.description = description

				notification.restaurant_id = restaurant_id

				notification.account_id = account_id

				notification.read = read

				notification.people = people

				notification.uuid = uuid

				notification.save()

				response = response_notification_added()

			else:
				raise ExceptionDefault(detail=response_action_failed(errors=serializer.errors))

		except Exception as e:

			if hasattr(e, 'detail'):

				response = e.detail

			else:
				response = dict()
				response['message'] = str(e.message)
				response['status'] = 'error'

			raise ExceptionDefault(detail=response)

		content = {
			'response': response,
		}

		return Response(content)

	def delete(self, request):
		try:

			serializer = APINotificationsDeleteSerializer(data=self.request.query_params)

			if serializer.is_valid():
				id = serializer.validated_data.get('id')

				notification = CoreNotification.objects.get(id=id)

				notification.delete()

				response = response_notification_delete()

			else:
				raise ExceptionDefault(detail=response_action_failed(errors=serializer.errors))

		except Exception as e:

			if hasattr(e, 'detail'):

				response = e.detail

			else:
				response = dict()
				response['message'] = str(e.message)
				response['status'] = 'error'

			raise ExceptionDefault(detail=response)

		content = {
			'response': response,
		}

		return Response(content)
