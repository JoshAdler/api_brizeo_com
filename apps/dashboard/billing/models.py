from django.db import models
import time


class CoreBilling(models.Model):
	stripe_customer_id = models.CharField(max_length=256, null=True)

	stripe_subscription_id = models.CharField(max_length=256, null=True)

	stripe_cc_id = models.CharField(max_length=256, null=True)

	stripe_cc_last4 = models.CharField(max_length=4, null=True)

	stripe_cc_name = models.CharField(max_length=64, null=True)

	stripe_cc_brand = models.CharField(max_length=64, null=True)

	stripe_cc_exp_month = models.CharField(max_length=2, null=True)

	stripe_cc_exp_year = models.CharField(max_length=4, null=True)

	stripe_cc_cvc = models.CharField(default='***', max_length=4, null=True)

	plan = models.ForeignKey('CorePlan', related_name='billing', null=True, on_delete=models.SET_NULL)

	start_date = models.BigIntegerField(default=int(time.time()))

	class Meta:
		db_table = 'core_billing'


class CoreDealerInvoice(models.Model):
	title = models.CharField(max_length=255, null=True)

	notes = models.TextField(null=True)

	stripe_charge_id = models.CharField(max_length=255, null=True)

	stripe_balance_transaction = models.CharField(max_length=255, null=True)

	stripe_cc_id = models.CharField(max_length=256, null=True)

	stripe_cc_last4 = models.CharField(max_length=4, null=True)

	stripe_cc_name = models.CharField(max_length=64, null=True)

	stripe_cc_brand = models.CharField(max_length=64, null=True)

	stripe_cc_exp_month = models.CharField(max_length=2, null=True)

	stripe_cc_exp_year = models.CharField(max_length=4, null=True)

	amount = models.DecimalField(null=True, max_digits=7, decimal_places=3)

	plan = models.ForeignKey('CorePlan', related_name='invoices', null=True, on_delete=models.SET_NULL)

	properties_billed = models.IntegerField(null=True)

	rate_applied = models.DecimalField(default=True, max_digits=5, decimal_places=3)

	created = models.BigIntegerField(default=int(time.time()), null=True)

	paid = models.NullBooleanField(default=False)

	refunded = models.NullBooleanField(default=False)

	class Meta:
		db_table = 'core_invoice'


class CorePlan(models.Model):
	code = models.CharField(max_length=255, unique=True)

	name = models.CharField(max_length=255)

	description = models.CharField(max_length=255)

	monthly_fee = models.IntegerField(default=0)

	is_active = models.NullBooleanField(default=True)

	class Meta:
		db_table = 'core_plan'
