from __future__ import division
from rest_framework import serializers
from apps.dashboard.api.v1.utils.serializers import *
import phonenumbers
from django.db.models import *
from django.db.models import Max
from apps.models import *


class APIDealerInventoryGetSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    status = serializers.CharField(required=False, allow_blank=True, max_length=64)

    search = serializers.CharField(required=False, allow_blank=True, max_length=256)

    code = serializers.CharField(required=False, allow_blank=True, max_length=256)

    page = serializers.IntegerField(default=1)

    per_page = serializers.IntegerField(default=10)

    @staticmethod
    def validate_status(value):
        if CoreInventoryStatus.objects.filter(code=value).exists() is False:
            raise serializers.ValidationError('status does not exists')

        return value


class APIDealerInventorySubmitSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    inventory = serializers.IntegerField(required=True, allow_null=False)

    def validate_inventory(self, value):
        if CoreInventory.objects.filter(id=value, member_id=self.context['member_id']).exists() is False:
            raise serializers.ValidationError('inventory id does not exists')
        else:
            inventory = CoreInventory.objects.get(id=value, member_id=self.context['member_id'])

            # if inventory.status.code == "draft":
            #     raise serializers.ValidationError('inventory is already in draft mode.')

        return value


class APIDealerInventoryCancelSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    inventory = serializers.IntegerField(required=True, allow_null=False)

    def validate_inventory(self, value):
        if CoreInventory.objects.filter(id=value, member_id=self.context['member_id']).exists() is False:
            raise serializers.ValidationError('inventory id does not exists')
        else:
            inventory = CoreInventory.objects.get(id=value, member_id=self.context['member_id'])
            #
            # if inventory.status.code != "pending":
            #     raise serializers.ValidationError(
            #         'sorry you can only cancel inventory review if it\'s in pending mode.')

        return value


class APIDealerInventoryAddSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    name = serializers.CharField(required=True, allow_null=False)

    sku = serializers.CharField(required=False, allow_null=True)

    quantity = serializers.IntegerField(required=True, allow_null=False)

    price = serializers.IntegerField(required=True, allow_null=False)

    condition = serializers.IntegerField(required=True, allow_null=False)

    shipping_method = serializers.IntegerField(required=True, allow_null=False)

    era = serializers.IntegerField(required=True, allow_null=False)

    style = serializers.IntegerField(required=False, allow_null=True)

    material = serializers.IntegerField(required=False, allow_null=True)

    category = serializers.IntegerField(required=True, allow_null=False)

    sub_category = serializers.IntegerField(required=True, allow_null=False)

    origin = serializers.CharField(max_length=1024)

    description = serializers.CharField(max_length=1024)

    height = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    length = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    width = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    weight = serializers.FloatField(required=True, allow_null=False, min_value=0.0)

    diameter = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    tags = serializers.ListField(required=False, allow_null=True)

    media = serializers.ListField(required=False, allow_null=True)

    def validate_name(self, value):
        if CoreInventory.objects.filter(name=value, member_id=self.context['member_id']).exists() is True:
            raise serializers.ValidationError('inventory with same product name already exists')

        return value

    def validate_sku(self, value):
        if value is not None and CoreInventory.objects.filter(sku=value,
                                                              member_id=self.context['member_id']).exists() is True:
            raise serializers.ValidationError('inventory with same sku already exists')

        return value

    @staticmethod
    def validate_quantity(value):
        if value < 0:
            raise serializers.ValidationError('quantity must be equal to or more than 0')

        return value

    @staticmethod
    def validate_price(value):
        if value < 10:
            raise serializers.ValidationError('price must be equal to or more than 10 USD')

        return value

    @staticmethod
    def validate_condition(value):
        if CoreInventoryCondition.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('condition_id does not exists')

        return value

    @staticmethod
    def validate_shipping_method(value):
        if CoreInventoryShippingMethod.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('shipping_id does not exists')

        return value

    @staticmethod
    def validate_era(value):
        if CoreInventoryEra.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('era_id does not exists')

        return value

    @staticmethod
    def validate_style(value):
        if value is not None and CoreInventoryStyle.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('style id does not exists')

        return value

    @staticmethod
    def validate_material(value):
        if value is not None and CoreInventoryMaterial.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('material id does not exists')

        return value

    @staticmethod
    def validate_category(value):
        if CoreInventoryCategory.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('category_id does not exists')

        return value

    @staticmethod
    def validate_sub_category(value):
        if CoreInventorySubCategory.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('sub_category_id does not exists')

        return value


class APIDealerInventoryUpdateSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    id = serializers.CharField(required=True, allow_null=False)

    name = serializers.CharField(required=True, allow_null=False)

    sku = serializers.CharField(required=False, allow_null=True)

    quantity = serializers.IntegerField(required=True, allow_null=False)

    price = serializers.IntegerField(required=True, allow_null=False)

    condition = serializers.IntegerField(required=True, allow_null=False)

    shipping_method = serializers.IntegerField(required=True, allow_null=False)

    era = serializers.IntegerField(required=True, allow_null=False)

    style = serializers.IntegerField(required=False, allow_null=True)

    material = serializers.IntegerField(required=False, allow_null=True)

    category = serializers.IntegerField(required=True, allow_null=False)

    sub_category = serializers.IntegerField(required=True, allow_null=False)

    origin = serializers.CharField(max_length=1024)

    description = serializers.CharField(max_length=1024)

    height = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    length = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    width = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    weight = serializers.FloatField(required=True, allow_null=False, min_value=0.0)

    diameter = serializers.FloatField(required=False, allow_null=True, min_value=0.0)

    tags = serializers.ListField(required=False, allow_null=True)

    media = serializers.ListField(required=False, allow_null=True)

    def validate_id(self, value):

        if CoreInventory.objects.filter(name=value, member_id=self.context['member_id']).exists() is True:
            raise serializers.ValidationError('inventory with same product name already exists')

        return value

    def validate_name(self, value):

        initial_values = self.get_initial()

        inventory = CoreInventory.objects.get(id=initial_values['id'])

        if inventory.name != value and CoreInventory.objects.filter(name=value, member_id=self.context[
            'member_id']).exists() is True:
            raise serializers.ValidationError('inventory with same product name already exists')

        return value

    def validate_sku(self, value):
        initial_values = self.get_initial()

        inventory = CoreInventory.objects.get(id=initial_values['id'])

        if value is not None:
            if inventory.sku != value and CoreInventory.objects.filter(sku=value, member_id=self.context[
                'member_id']).exists() is True:
                raise serializers.ValidationError('inventory with same product sku already exists')

            return value

    @staticmethod
    def validate_quantity(value):
        if value < 0:
            raise serializers.ValidationError('quantity must be equal to or more than 0')

        return value

    @staticmethod
    def validate_price(value):
        if value < 10:
            raise serializers.ValidationError('price must be equal to or more than 10 USD')

        return value

    @staticmethod
    def validate_condition(value):
        if CoreInventoryCondition.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('condition_id does not exists')

        return value

    @staticmethod
    def validate_shipping_method(value):
        if CoreInventoryShippingMethod.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('shipping_id does not exists')

        return value

    @staticmethod
    def validate_era(value):
        if CoreInventoryEra.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('era_id does not exists')

        return value

    @staticmethod
    def validate_style(value):
        if value is not None and CoreInventoryStyle.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('style id does not exists')

        return value

    @staticmethod
    def validate_material(value):
        if value is not None and CoreInventoryMaterial.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('material id does not exists')

        return value

    @staticmethod
    def validate_category(value):
        if CoreInventoryCategory.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('category_id does not exists')

        return value

    @staticmethod
    def validate_sub_category(value):
        if CoreInventorySubCategory.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('sub_category_id does not exists')

        return value


class APIDealerInventoryDeleteSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    inventory_id = serializers.IntegerField(required=True, allow_null=False)

    def validate_inventory_id(self, value):
        if CoreInventory.objects.filter(id=value, member_id=self.context['member_id']).exists() is False:
            raise serializers.ValidationError('inventory does not exists')

        return value


class APIDealerInventoryCategoryGetSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    page = serializers.IntegerField(default=1)

    per_page = serializers.IntegerField(default=10)

    search = serializers.CharField(required=False, allow_blank=True, max_length=256)

    no_pagination = serializers.NullBooleanField(required=False)


class APIDealerInventoryStyleGetSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    page = serializers.IntegerField(default=1)

    per_page = serializers.IntegerField(default=10)

    search = serializers.CharField(required=False, allow_blank=True, max_length=256)

    no_pagination = serializers.NullBooleanField(required=False)


class APIDealerInventoryMaterialGetSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    page = serializers.IntegerField(default=1)

    per_page = serializers.IntegerField(default=10)

    search = serializers.CharField(required=False, allow_blank=True, max_length=256)

    no_pagination = serializers.NullBooleanField(required=False)


class APIDealerInventorySubCategoryGetSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    category_id = serializers.IntegerField(required=True, allow_null=False)

    page = serializers.IntegerField(default=1)

    per_page = serializers.IntegerField(default=10)

    search = serializers.CharField(required=False, allow_blank=True, max_length=256)

    no_pagination = serializers.NullBooleanField(required=False)

    @staticmethod
    def validate_category_id(value):
        if CoreInventoryCategory.objects.filter(id=value).exists() is False:
            raise serializers.ValidationError('category id does not exists')

        return value


class APIDealerInventoryMediaGetSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    page = serializers.IntegerField(default=1)

    per_page = serializers.IntegerField(default=10)

    search = serializers.CharField(required=False, allow_blank=True, max_length=256)

    inventory_id = serializers.IntegerField(required=True, allow_null=False)

    def validate_inventory_id(self, value):
        if CoreInventory.objects.filter(id=value, member_id=self.context['member_id']).exists() is False:
            raise serializers.ValidationError('inventory id does not exists')

        return value


class APIDealerInventoryMediaDeleteSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    inventory_id = serializers.IntegerField(required=True, allow_null=False)

    media_id = serializers.IntegerField(required=True, allow_null=False)

    def validate_inventory_id(self, value):
        if CoreInventory.objects.filter(id=value, member_id=self.context['member_id']).exists() is False:
            raise serializers.ValidationError('inventory id does not exists')

        return value

    def validate_media_id(self, value):
        if value is not None:
            initial_values = self.get_initial()
            if CoreInventoryMedia.objects.filter(id=value,
                                                 inventory_id=initial_values['inventory_id']).exists() is False:
                raise serializers.ValidationError('media id does not exists')

        return value


class APIDealerInventoryMediaUpdateSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    inventory_id = serializers.IntegerField(required=True, allow_null=False)

    media_id = serializers.IntegerField(required=True, allow_null=False)

    is_primary = serializers.NullBooleanField(required=False)

    def validate_inventory_id(self, value):
        if CoreInventory.objects.filter(id=value, member_id=self.context['member_id']).exists() is False:
            raise serializers.ValidationError('inventory id does not exists')

        return value

    def validate_media_id(self, value):
        if value is not None:
            initial_values = self.get_initial()
            if CoreInventoryMedia.objects.filter(id=value,
                                                 inventory_id=initial_values['inventory_id']).exists() is False:
                raise serializers.ValidationError('media id does not exists')

        return value


class APIDealerInventoryMediaAddSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    inventory_id = serializers.IntegerField(required=True, allow_null=False)

    file = serializers.FileField(required=True, allow_null=False)

    def validate_inventory_id(self, value):
        if CoreInventory.objects.filter(id=value, member_id=self.context['member_id']).exists() is False:
            raise serializers.ValidationError('inventory id does not exists')

        return value


class CoreInventoryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryStatus
        fields = ('id', 'name')


class CoreInventoryConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryCondition
        fields = ('id', 'name')


class CoreInventoryEraSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryEra
        fields = ('id', 'name')


class CoreInventoryStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryStyle
        fields = ('id', 'name')


class CoreInventoryMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryMaterial
        fields = ('id', 'name')


class CoreInventoryCircaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryCirca
        fields = ('id', 'name')


class CoreInventoryShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryShippingMethod
        fields = ('id', 'name')


class CoreInventoryMediaTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryMediaType
        fields = '__all__'


class CoreInventoryMediaSerializer(serializers.ModelSerializer):
    type = CoreInventoryMediaTypeSerializer()
    url = serializers.SerializerMethodField()

    class Meta:
        model = CoreInventoryMedia
        fields = '__all__'

    @staticmethod
    def get_url(obj):
        return 'https://s3.amazonaws.com/%s/%s' % (settings.AWS_BUCKET_NAME, obj.name)


class CoreInventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryCategory
        fields = '__all__'


class CoreInventorySubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventorySubCategory
        fields = '__all__'


class CoreInventoryTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryTags
        fields = '__all__'


class CoreInventoryConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryCondition
        fields = '__all__'


class CoreInventoryEraSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryEra
        fields = '__all__'


class CoreInventoryShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryShippingMethod
        fields = '__all__'


class CoreInventoryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreInventoryStatus
        fields = '__all__'


class CoreInventorySerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    condition = CoreInventoryConditionSerializer()
    era = CoreInventoryEraSerializer()
    style = CoreInventoryStyleSerializer()
    material = CoreInventoryMaterialSerializer()
    shipping_method = CoreInventoryShippingMethodSerializer()
    category = CoreInventoryCategorySerializer()
    sub_category = CoreInventoryCategorySerializer()
    status = CoreInventoryStatusSerializer()
    dashboard_store_url = serializers.SerializerMethodField()
    inventory_url = serializers.SerializerMethodField()

    class Meta:
        model = CoreInventory
        fields = '__all__'

    @staticmethod
    def get_media(obj):
        return CoreInventoryMediaSerializer(CoreInventoryMedia.objects.filter(inventory=obj).order_by('-is_primary'),
                                            many=True).data

    @staticmethod
    def get_tags(obj):
        tags = []
        for tag in CoreInventoryTags.objects.filter(inventory=obj):
            tags.append(tag.name)
        return tags

    @staticmethod
    def get_inventory_url(obj):
        if obj.dealer.store_url is not None:
            return 'http://%s/%s/%s' % (settings.STORE_DOMAIN, obj.dealer.store_url.lower(), obj.seo_name)

    @staticmethod
    def get_dashboard_store_url(obj):
        if obj.dealer.store_url is not None:
            return 'http://%s/%s' % (settings.STORE_DOMAIN, obj.dealer.store_url.lower())
