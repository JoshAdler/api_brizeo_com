from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.dashboard.api.v1.utils.api_exceptions import *
from apps.dashboard.api.v1.utils.api_responses import *
from serializers import *
import uuid
import boto3
from django.conf import settings
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser, MultiPartParser, JSONParser
import mimetypes
from apps.dashboard.api.v1.utils.api_helpers import random_code


class APIDealerInventory(APIView):
    def get(self, request):
        try:
            serializer = APIDealerInventoryGetSerializer(data=self.request.query_params)

            if serializer.is_valid():
                page = serializer.validated_data.get('page')

                per_page = serializer.validated_data.get('per_page')

                search = serializer.validated_data.get('search')

                status = serializer.validated_data.get('status')

                code = serializer.validated_data.get('code')

                account = request.user.member.account

                # for inventory in CoreInventory.objects.filter(dealer=account):
                #     if inventory.id != 36 and inventory.id != 46 and inventory.id != 47 and inventory.id != 48:
                #         inventory.delete()

                if code is not None:
                    inventory_data = CoreInventorySerializer(CoreInventory.objects.get(dealer=account, code=code),
                                                             context={'request': request}).data
                    content = {
                        'inventory': inventory_data
                    }

                else:
                    query = Q(status__code=status, dealer=account)

                    if search is not None:
                        query &= (Q(name__icontains=search))

                    inventory_list = CoreInventory.objects.filter(query)

                    paginator = Paginator(inventory_list, per_page)

                    try:
                        inventory = paginator.page(page)

                    except PageNotAnInteger:

                        inventory = paginator.page(1)

                    except EmptyPage:
                        inventory = paginator.page(paginator.num_pages)

                    inventory_data = CoreInventorySerializer(inventory, many=True, context={'request': request}).data

                    if inventory.has_previous():
                        previous_page = inventory.previous_page_number()
                    else:
                        previous_page = 1

                    if inventory.has_next():
                        next_page_number = inventory.next_page_number()
                    else:
                        next_page_number = 1

                    content = {
                        'inventory': inventory_data,
                        'metadata': {
                            'inventory_draft': CoreInventory.objects.filter(dealer=account,
                                                                            status__code='draft').count(),
                            'inventory_pending': CoreInventory.objects.filter(dealer=account,
                                                                              status__code='pending').count(),
                            'inventory_live': CoreInventory.objects.filter(dealer=account, status__code='live').count(),

                            'inventory_sold': CoreInventory.objects.filter(dealer=account,
                                                                           status__code='sold').count(),
                        },
                        'pagination': {
                            'page': page,
                            'search': search,
                            'next_page': next_page_number,
                            'start_index': inventory.start_index(),
                            'end_index': inventory.end_index(),
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
            account = request.user.member.account

            serializer = APIDealerInventoryAddSerializer(data=self.request.data, context={'member_id': account.id})

            if serializer.is_valid():
                name = serializer.validated_data.get('name')

                sku = serializer.validated_data.get('sku')

                quantity = serializer.validated_data.get('quantity')

                price = serializer.validated_data.get('price')

                condition = serializer.validated_data.get('condition')

                shipping_method = serializer.validated_data.get('shipping_method')

                era = serializer.validated_data.get('era')

                style = serializer.validated_data.get('style')

                material = serializer.validated_data.get('material')

                category = serializer.validated_data.get('category')

                sub_category = serializer.validated_data.get('sub_category')

                origin = serializer.validated_data.get('origin')

                description = serializer.validated_data.get('description')

                height = serializer.validated_data.get('height')

                length = serializer.validated_data.get('length')

                width = serializer.validated_data.get('width')

                weight = serializer.validated_data.get('weight')

                diameter = serializer.validated_data.get('diameter')

                tags = serializer.validated_data.get('tags')

                media_list = serializer.validated_data.get('media')

                inventory = CoreInventory()

                inventory.name = name

                inventory.sku = sku

                inventory.quantity = quantity

                inventory.price = price

                inventory.condition_id = condition

                inventory.shipping_method_id = shipping_method

                inventory.era_id = era

                inventory.style_id = style

                inventory.material_id = material

                inventory.category_id = category

                inventory.sub_category_id = sub_category

                inventory.origin = origin

                inventory.description = description

                inventory.height = height

                inventory.length = length

                inventory.width = width

                inventory.weight = weight

                inventory.diameter = diameter

                inventory.status = CoreInventoryStatus.objects.get(code='draft')

                inventory.member_id = account.id

                inventory.save()

                if media_list is not None:
                    for media_dict in media_list:
                        media = CoreInventoryMedia()

                        media.name = media_dict.get('name', None)

                        media.inventory = inventory

                        media.is_primary = True if len(media_list) == 1 else media_dict.get('is_primary', False)

                        media.save()

                if tags is not None:
                    for tag in tags:
                        tag_object = CoreInventoryTags()

                        tag_object.name = tag

                        tag_object.inventory = inventory

                        tag_object.save()

                response = response_inventory_added()

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
            'inventory_id': inventory.id
        }

        return Response(content)

    def patch(self, request):
        try:
            account = request.user.member.account

            serializer = APIDealerInventoryUpdateSerializer(data=self.request.data, context={'member_id': account.id})

            if serializer.is_valid():
                id = serializer.validated_data.get('id')

                name = serializer.validated_data.get('name')

                sku = serializer.validated_data.get('sku')

                quantity = serializer.validated_data.get('quantity')

                price = serializer.validated_data.get('price')

                condition = serializer.validated_data.get('condition')

                shipping_method = serializer.validated_data.get('shipping_method')

                style = serializer.validated_data.get('style')

                material = serializer.validated_data.get('material')

                era = serializer.validated_data.get('era')

                category = serializer.validated_data.get('category')

                sub_category = serializer.validated_data.get('sub_category')

                origin = serializer.validated_data.get('origin')

                description = serializer.validated_data.get('description')

                height = serializer.validated_data.get('height')

                length = serializer.validated_data.get('length')

                width = serializer.validated_data.get('width')

                weight = serializer.validated_data.get('weight')

                diameter = serializer.validated_data.get('diameter')

                tags = serializer.validated_data.get('tags')

                media_list = serializer.validated_data.get('media')

                inventory = CoreInventory.objects.get(id=id)

                inventory.name = name

                inventory.sku = sku

                inventory.quantity = quantity

                inventory.price = price

                inventory.condition_id = condition

                inventory.shipping_method_id = shipping_method

                inventory.era_id = era

                inventory.style_id = style

                inventory.material_id = material

                inventory.category_id = category

                inventory.sub_category_id = sub_category

                inventory.origin = origin

                inventory.description = description

                inventory.height = height

                inventory.length = length

                inventory.width = width

                inventory.weight = weight

                inventory.diameter = diameter

                inventory.status = CoreInventoryStatus.objects.get(code='draft')

                inventory.member_id = account.id

                inventory.save()

                if media_list is not None:

                    for media_dict in media_list:

                        if CoreInventoryMedia.objects.filter(inventory=inventory,
                                                             name=media_dict.get('name')).exists() is False:
                            media = CoreInventoryMedia()

                            media.name = media_dict.get('name', None)

                            media.inventory = inventory

                            media.is_primary = True if len(media_list) == 1 else media_dict.get('is_primary', False)

                            media.save()
                        else:
                            media = CoreInventoryMedia.objects.get(inventory=inventory, name=media_dict.get('name'))

                            media.is_primary = True if len(media_list) == 1 else media_dict.get('is_primary', False)

                            media.save()

                if tags is not None:
                    for old_tag in CoreInventoryTags.objects.filter(inventory=inventory):
                        old_tag.delete()

                    for tag in tags:
                        tag_object = CoreInventoryTags()

                        tag_object.name = tag

                        tag_object.inventory = inventory

                        tag_object.save()

                response = response_inventory_updated()

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
            'inventory_id': inventory.id
        }

        return Response(content)

    def delete(self, request):
        try:
            account = request.user.member.account

            serializer = APIDealerInventoryDeleteSerializer(data=self.request.query_params,
                                                            context={'member_id': account.id})

            if serializer.is_valid():

                inventory_id = serializer.validated_data.get('inventory_id')

                inventory = CoreInventory.objects.get(id=inventory_id)

                for media in CoreInventoryMedia.objects.filter(inventory_id=inventory.id):
                    # Let's use Amazon S3
                    s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                      aws_secret_access_key=settings.AWS_SECRET_KEY)

                    boto_response = s3.delete_object(
                        Bucket=settings.AWS_BUCKET_NAME,
                        Key=media.name,
                    )

                    media.delete()

                inventory.delete()

                response = response_inventory_deleted()

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


class APIDealerInventoryDeleteAll(APIView):
    def get(self, request):
        try:
            account = request.user.member.account

            for inventory in CoreInventory.objects.filter(dealer=account):
                inventory.delete()

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'response': 'ok'
        }

        return Response(content)


class APIDealerInventorySubmit(APIView):
    def post(self, request):
        try:
            account = request.user.member.account

            serializer = APIDealerInventorySubmitSerializer(data=self.request.data, context={'member_id': account.id})

            if serializer.is_valid():
                inventory = serializer.validated_data.get('inventory')

                inventory = CoreInventory.objects.get(id=inventory)

                inventory.status = CoreInventoryStatus.objects.get(code='pending')

                inventory.save()

                response = response_inventory_submitted()

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
            'response': response
        }

        return Response(content)


class APIDealerInventoryCancel(APIView):
    def post(self, request):
        try:
            account = request.user.member.account

            serializer = APIDealerInventoryCancelSerializer(data=self.request.data, context={'member_id': account.id})

            if serializer.is_valid():
                inventory = serializer.validated_data.get('inventory')

                inventory = CoreInventory.objects.get(id=inventory)

                inventory.status = CoreInventoryStatus.objects.get(code='draft')

                inventory.save()

                response = response_inventory_canceled()

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
            'response': response
        }

        return Response(content)


class APIDealerInventoryStatus(APIView):
    def get(self, request):
        try:

            inventory_status = CoreInventoryStatusSerializer(CoreInventoryStatus.objects.all(), many=True).data

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'statuses': inventory_status
        }

        return Response(content)


class APIDealerInventoryMedia(APIView):
    parser_classes = (MultiPartParser, MultiPartParser, JSONParser,)

    def put(self, request):
        try:

            account = request.user.member.account

            serializer = APIDealerInventoryMediaAddSerializer(data=self.request.data, context={'member_id': account.id})

            # check if values are valid.
            if serializer.is_valid():

                inventory_id = serializer.validated_data.get('inventory_id')

                file = serializer.validated_data.get('file')

                extension = os.path.splitext(file.name)[1]

                inventory = CoreInventory.objects.get(id=inventory_id)

                #############################################
                # FILE UPLOAD
                #############################################

                # check if we are using local server or live server
                if ':8' in request.get_host():

                    directory = 'static/uploads/'
                else:
                    directory = '/home/brizeo/django/app_brizeo_com/static/uploads/'

                # create directory if it's not there already.
                if not os.path.exists(directory):
                    os.makedirs(directory)

                # generate random file name
                random_file_name = str(uuid.uuid4()) + extension

                # file with directory.
                media_file = directory + random_file_name

                with open(media_file, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)

                destination.close()

                try:
                    if 'image' in mimetypes.guess_type(media_file, strict=True)[0] or 'video' in \
                            mimetypes.guess_type(media_file, strict=True)[0]:

                        # Let's use Amazon S3
                        s3 = boto3.resource('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                            aws_secret_access_key=settings.AWS_SECRET_KEY)

                        # Upload a new file
                        data = open(media_file, 'rb')

                        s3.Bucket(settings.AWS_BUCKET_NAME).put_object(Key=random_file_name, Body=data, ContentType=
                        mimetypes.guess_type(media_file, strict=True)[0],
                                                                       ACL='public-read')

                        media = CoreInventoryMedia()

                        media.inventory = inventory

                        media.name = random_file_name

                        media.save()
                        # now remove the media file because we don't need it
                        # destination.close()
                        # os.remove(media_file)

                        response = response_media_added()
                    else:
                        # destination.close()
                        # os.remove(media_file)
                        response = response_media_not_supported()

                except Exception as e:
                    # destination.close()
                    # os.remove(media_file)
                    response = e
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
            'media': {
                'name': random_file_name,
                'url': 'https://s3.amazonaws.com/%s/%s' % (settings.AWS_BUCKET_NAME, random_file_name)
            },
        }

        return Response(content)

    def delete(self, request):
        try:
            account = request.user.member.account

            serializer = APIDealerInventoryMediaDeleteSerializer(data=self.request.query_params,
                                                                 context={'member_id': account.id})

            if serializer.is_valid():

                inventory_id = serializer.validated_data.get('inventory_id')

                media_id = serializer.validated_data.get('media_id')

                inventory = CoreInventory.objects.get(id=inventory_id)

                media = CoreInventoryMedia.objects.get(id=media_id)

                # Let's use Amazon S3
                s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY,
                                  aws_secret_access_key=settings.AWS_SECRET_KEY)

                boto_response = s3.delete_object(
                    Bucket=settings.AWS_BUCKET_NAME,
                    Key=media.name,
                )

                media.delete()

                if CoreInventoryMedia.objects.filter(inventory=inventory, is_primary=True).exists() is False:
                    primary_media = CoreInventoryMedia.objects.filter(inventory=inventory).first()
                    primary_media.is_primary = True

                    primary_media.save()

                response = response_media_deleted()

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


class APIDealerInventoryCondition(APIView):
    def get(self, request):
        try:

            inventory_condition = CoreInventoryConditionSerializer(CoreInventoryCondition.objects.all(), many=True).data

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'conditions': inventory_condition
        }

        return Response(content)


class APIDealerInventoryEra(APIView):
    def get(self, request):
        try:

            inventory_era = CoreInventoryEraSerializer(CoreInventoryEra.objects.all(), many=True).data

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'era': inventory_era
        }

        return Response(content)


class APIDealerInventoryCirca(APIView):
    def get(self, request):
        try:

            inventory_circa = CoreInventoryCircaSerializer(CoreInventoryCirca.objects.all(), many=True).data

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'circa': inventory_circa
        }

        return Response(content)


class APIDealerInventoryShippingMethod(APIView):
    def get(self, request):
        try:

            inventory_shipping_method = CoreInventoryShippingMethodSerializer(CoreInventoryShippingMethod.objects.all(),
                                                                              many=True).data

        except Exception as e:

            if hasattr(e, 'detail'):

                response = e.detail

            else:
                response = dict()
                response['message'] = str(e.message)
                response['status'] = 'error'

            raise ExceptionDefault(detail=response)

        content = {
            'shipping_methods': inventory_shipping_method
        }

        return Response(content)


class APIDealerInventoryCategory(APIView):
    def get(self, request):
        try:
            serializer = APIDealerInventoryCategoryGetSerializer(data=self.request.query_params)

            if serializer.is_valid():
                page = serializer.validated_data.get('page')

                per_page = serializer.validated_data.get('per_page')

                search = serializer.validated_data.get('search')

                query = Q()

                if search is not None:
                    query &= (Q(name__icontains=search) | Q(description__icontains=search))

                category_list = CoreInventoryCategory.objects.filter(query)

                paginator = Paginator(category_list, per_page)

                try:
                    categories = paginator.page(page)

                except PageNotAnInteger:

                    categories = paginator.page(1)

                except EmptyPage:
                    categories = paginator.page(paginator.num_pages)

                categories_data = CoreInventoryCategorySerializer(categories, many=True,
                                                                  context={'request': request}).data

                if categories.has_previous():
                    previous_page = categories.previous_page_number()
                else:
                    previous_page = 1

                if categories.has_next():
                    next_page_number = categories.next_page_number()
                else:
                    next_page_number = 1

                content = {
                    'categories': categories_data,
                    'pagination': {
                        'page': page,
                        'search': search,
                        'next_page': next_page_number,
                        'start_index': categories.start_index(),
                        'end_index': categories.end_index(),
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


class APIDealerInventoryStyle(APIView):
    def get(self, request):
        try:
            serializer = APIDealerInventoryStyleGetSerializer(data=self.request.query_params)

            if serializer.is_valid():
                page = serializer.validated_data.get('page')

                per_page = serializer.validated_data.get('per_page')

                search = serializer.validated_data.get('search')

                query = Q()

                if search is not None:
                    query &= (Q(name__icontains=search) | Q(description__icontains=search))

                style_list = CoreInventoryStyle.objects.filter(query)

                paginator = Paginator(style_list, per_page)

                try:
                    styles = paginator.page(page)

                except PageNotAnInteger:

                    styles = paginator.page(1)

                except EmptyPage:
                    styles = paginator.page(paginator.num_pages)

                styles_data = CoreInventoryStyleSerializer(styles, many=True, context={'request': request}).data

                if styles.has_previous():
                    previous_page = styles.previous_page_number()
                else:
                    previous_page = 1

                if styles.has_next():
                    next_page_number = styles.next_page_number()
                else:
                    next_page_number = 1

                content = {
                    'styles': styles_data,
                    'pagination': {
                        'page': page,
                        'search': search,
                        'next_page': next_page_number,
                        'start_index': styles.start_index(),
                        'end_index': styles.end_index(),
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


class APIDealerInventoryMaterial(APIView):
    def get(self, request):
        try:
            serializer = APIDealerInventoryMaterialGetSerializer(data=self.request.query_params)

            if serializer.is_valid():
                page = serializer.validated_data.get('page')

                per_page = serializer.validated_data.get('per_page')

                search = serializer.validated_data.get('search')

                query = Q()

                if search is not None:
                    query &= (Q(name__icontains=search) | Q(description__icontains=search))

                material_list = CoreInventoryMaterial.objects.filter(query)

                paginator = Paginator(material_list, per_page)

                try:
                    materials = paginator.page(page)

                except PageNotAnInteger:

                    materials = paginator.page(1)

                except EmptyPage:
                    materials = paginator.page(paginator.num_pages)

                materials_data = CoreInventoryMaterialSerializer(materials, many=True,
                                                                 context={'request': request}).data

                if materials.has_previous():
                    previous_page = materials.previous_page_number()
                else:
                    previous_page = 1

                if materials.has_next():
                    next_page_number = materials.next_page_number()
                else:
                    next_page_number = 1

                content = {
                    'materials': materials_data,
                    'pagination': {
                        'page': page,
                        'search': search,
                        'next_page': next_page_number,
                        'start_index': materials.start_index(),
                        'end_index': materials.end_index(),
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


class APIDealerInventorySubCategory(APIView):
    def get(self, request):
        try:
            serializer = APIDealerInventorySubCategoryGetSerializer(data=self.request.query_params)

            if serializer.is_valid():

                category_id = serializer.validated_data.get('category_id')

                page = serializer.validated_data.get('page')

                per_page = serializer.validated_data.get('per_page')

                search = serializer.validated_data.get('search')

                query = Q(category_id=category_id)

                if search is not None:
                    query &= (Q(name__icontains=search) | Q(description__icontains=search))

                sub_category_list = CoreInventorySubCategory.objects.filter(query)

                paginator = Paginator(sub_category_list, per_page)

                try:
                    sub_categories = paginator.page(page)

                except PageNotAnInteger:

                    sub_categories = paginator.page(1)

                except EmptyPage:
                    sub_categories = paginator.page(paginator.num_pages)

                sub_categories_data = CoreInventorySubCategorySerializer(sub_categories, many=True,
                                                                         context={'request': request}).data

                if sub_categories.has_previous():
                    previous_page = sub_categories.previous_page_number()
                else:
                    previous_page = 1

                if sub_categories.has_next():
                    next_page_number = sub_categories.next_page_number()
                else:
                    next_page_number = 1

                content = {
                    'sub_categories': sub_categories_data,
                    'pagination': {
                        'page': page,
                        'search': search,
                        'next_page': next_page_number,
                        'start_index': sub_categories.start_index(),
                        'end_index': sub_categories.end_index(),
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
