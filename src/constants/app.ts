// ثوابت التطبيق: أنواع وحالات العمليات، حدود الترقيم، وقوالب النماذج الفارغة

import { Subscriber, Operation } from '@/types';
import { todayStr } from '@/lib/random';

export const OPERATION_TYPES = ['توزيع ارباح', 'اشتراك جديد', 'تنشيط النظام', 'سحب ارباح', 'تحويل'];

export const OPERATION_STATUSES = ['مكتمل', 'اشتراك جديد', 'تنشيط النظام', 'قيد المعالجة'];

export const SUBSCRIBER_STATUSES = ['نشط', 'مشترك جديد', 'رسوم مستحقة', 'توزيع أرباح', 'معلق', 'موقوف'];

export const EMPTY_SUB: Omit<Subscriber, 'id'> = {
  name: '', phone: '', iban: '', subscriptionAmount: 0, profits: 0, systemFees: 0,
  systemAccount: '', walletAddress: '', bankName: '', joinDate: '',
  subscriberStatus: 'نشط', notes: '', withdrawalText: '', currency: '', platform: '',
  phoneCountryCode: '+966', phoneCountryIso: 'SA', phoneVisible: true,
  ibanVisible: true, accountNumber: '', accountNumberVisible: true,
  subscriptionCurrency: 'SAR', subscriptionCurrencySymbol: '﷼',
  profitsCurrency: 'SAR', profitsCurrencySymbol: '﷼',
  systemFeesCurrency: 'SAR', systemFeesCurrencySymbol: '﷼',
  systemAccountType: 'manual', systemAccountWalletType: '', systemAccountNetwork: '', systemAccountValue: '',
  walletPlatform: '', walletCurrency: '', walletNetwork: '', walletAddressValue: '',
  bankCountry: '', bankType: 'commercial', bankLogoUrl: '', bankDomain: '', bankSwift: '',
};

export const EMPTY_OP: Omit<Operation, 'id'> = {
  subscriberName: '', operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل',
};

export const OPS_PER_PAGE = 8;

export const ADMIN_OPS_PER_PAGE = 12;

export const SUBS_PER_PAGE = 10;
