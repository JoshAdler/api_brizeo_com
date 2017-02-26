from django.conf.urls import url
from views import *

urlpatterns = [
    url(r'^inventory/?$', APIDealerInventory.as_view()),
    url(r'^inventory/delete_all/?$', APIDealerInventoryDeleteAll.as_view()),
    url(r'^inventory/submit/?$', APIDealerInventorySubmit.as_view()),
    url(r'^inventory/cancel/?$', APIDealerInventoryCancel.as_view()),
    url(r'^inventory/status/?$', APIDealerInventoryStatus.as_view()),
    url(r'^inventory/media/?$', APIDealerInventoryMedia.as_view()),
    url(r'^inventory/condition/?$', APIDealerInventoryCondition.as_view()),
    url(r'^inventory/era/?$', APIDealerInventoryEra.as_view()),
    url(r'^inventory/circa/?$', APIDealerInventoryCirca.as_view()),
    url(r'^inventory/shipping_method/?$', APIDealerInventoryShippingMethod.as_view()),
    url(r'^inventory/category/?$', APIDealerInventoryCategory.as_view()),
    url(r'^inventory/style/?$', APIDealerInventoryStyle.as_view()),
    url(r'^inventory/material/?$', APIDealerInventoryMaterial.as_view()),
    url(r'^inventory/sub_category/?$', APIDealerInventorySubCategory.as_view()),

]
