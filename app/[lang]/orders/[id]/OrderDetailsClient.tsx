'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SiteSettings } from '@/types/database'
import { formatCurrency } from '@/i18n/utils'

interface OrderItem {
  id: string;
  product_id: string;
  quantity_grams: number;
  price_per_kg: number;
  selected_color?: string;
  option_details?: string | null;
  product: {
    id: string;
    name: string;
    product_image: string;
    kg_price?: boolean;
    price_chart?: {
      tiers: Array<{ min: number; price: number }>;
    };
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  subtotal_amount?: string;
  currency?: string;
  currency_rate?: number;
  base_amount?: number;
  vat_number?: string;
  fees?: number;
  vat?: number;
  freight_ex_vat?: number;
  shipping_address: {
    address_line1: string;
    address_line2?: string;
    company_name?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    gln?: string;
    pharmacy_license?: string;
    btm_license?: string;
    responsible_person?: string;
    delivery_time_window?: string;
  };
  billing_address?: {
    address_line1: string;
    address_line2?: string;
    company_name?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  order_items: OrderItem[];
  payment_method: string;
  coupon?: string;
  coupon_discount?: number;
  loyalty_discount_percentage?: number;
  loyalty_discount_amount?: number;
  guest_email?: string;
}

interface OrderDetailsClientProps {
  order: Order
  siteSettings: SiteSettings
  isB2B?: boolean
  lang: string
  dict: any
  userEmail?: string
  demoMode?: boolean
}


interface PaymentMethodDetails {
  type: string;
  details: Record<string, unknown>;
}

interface TrackingData {
  trackingNumber: string;
}

function getPaymentType(paymentMethod: string | PaymentMethodDetails): string {
  if (typeof paymentMethod === 'string') return paymentMethod;
  if (typeof paymentMethod === 'object' && paymentMethod?.type) return paymentMethod.type;
  return '';
}

function getOrderItemImageUrl(item: OrderItem): string | null {
  try {
    if (!item || !item.product) {
      return null;
    }

    if (typeof item.option_details === 'string' && item.option_details.length > 0) {
      return item.option_details;
    }

    return item.product.product_image || null;
  } catch {
    return item?.product?.product_image || null;
  }
}


function getOrderItemDisplayPrice(item: OrderItem, order: Order, isB2B = false): number {
  
  const rawPrice = item.quantity_grams * item.price_per_kg;
    
  const converted = order.currency_rate ? rawPrice * order.currency_rate : rawPrice;

  if (getPaymentType(order.payment_method) === 'crypto') return converted;

  if (isB2B) return converted;

  if (order.vat_number && order.vat_number.trim().length > 0) {
    return converted / 1.19;
  }

  return converted;
}

interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
}

function TabNavigation({ activeTab, setActiveTab, tabs }: TabProps) {
  return (
    <div className="flex border-b border-slate-100 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex w-full items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
            ? 'border-b-2 border-secondary text-black'
            : 'text-black hover:text-text-main'
            }`}
        >
          {tab.icon}
          <span className="ml-2">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

interface InvoiceDownloadProps {
  orderId: string;
  locale: string;
  token?: string | null;
  t: any;
  invoice?: boolean;
}

function InvoiceDownload({ t, invoice = false }: InvoiceDownloadProps) {

  const invoiceUrl = `/docs/sample-ledger.pdf`;

  return (
    <div className="mt-4 pt-4">
      <a
        href={invoiceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs md:text-sm flex items-center justify-center w-full py-3 px-4 bg-static-black hover:underline hover:bg-secondary text-static-white font-semibold uppercase tracking-widest rounded-none transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        {invoice ? (t.sections.payment.downloadInvoice || 'Download Invoice') : (t.sections.payment.downloadReceipt || 'Download Receipt')}
      </a>
      <p className="text-black text-[10px] mt-2 uppercase tracking-widest text-center">
        {invoice ? (t.sections.payment.invoiceNote || 'Your invoice includes all the purchase details and can be used for tax purposes.') : (t.sections.payment.receiptNote || 'Download Receipt')}
      </p>
    </div>
  );
}

interface PaymentMethodDisplayProps {
  paymentMethod: string | PaymentMethodDetails;
  t: any;
  orderId: string;
  locale: string;
  token?: string | null;
}

function PaymentMethodDisplay({ paymentMethod, t, orderId, locale, token }: PaymentMethodDisplayProps) {
  const paymentType = getPaymentType(paymentMethod);

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'invoice_30':
        return (
          <svg className="w-6 md:w-8 h-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 md:w-8 h-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getPaymentMethodName = (type: string, t: any) => {
    switch (type) {
      case 'sepa':
        return t.sections.payment.methods.sepa;
      case 'invoice_30':
        return t.sections.payment.methods.invoice_30;
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center p-4 bg-white/60 rounded-none">
        <div className="p-2 md:p-3 rounded-full bg-secondary/30 flex items-center justify-center mr-4 text-black">
          {getPaymentMethodIcon(paymentType)}
        </div>
        <div>
          <h3 className="text-sm md:text-base font-semibold text-text-main">{getPaymentMethodName(paymentType, t)}</h3>
        </div>
      </div>

      <InvoiceDownload orderId={orderId} locale={locale} token={token} t={t} invoice={true} />
    </div>
  );
}

interface ShippingTrackingProps {
  orderId: string;
  status: string;
  t: any;
}

function ShippingTracking({ orderId, status, t }: ShippingTrackingProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const fetchTrackingInfo = async () => {
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await fetch(`/api/tracking/${orderId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch tracking information');
      }

      const data = await response.json();

      if (data.tracking_number) {
        setTrackingData({ trackingNumber: data.tracking_number });
      } else {
        setTrackingData({ trackingNumber: '' });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    setCopiedOrderId(true)
    setTimeout(() => setCopiedOrderId(false), 1500)
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'processing':
        return (
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shipped':
        return (
          <svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="text-lg font-semibold text-text-main">
              {t.sections.statuses[status.toLowerCase()] || status}
            </h3>
            <p className="text-black text-xs">
              <span className='text-black uppercase tracking-widest'>{t.sections.orderInfo.orderId}</span>{' '}
              <span 
                className='hover:underline cursor-pointer relative inline-flex items-center group'
                onClick={handleCopyOrderId}
                title={t.sections.payment.clickToCopy || 'Click to copy'}
              >
                {orderId}
                <svg 
                  className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-12a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {copiedOrderId && (
                  <span className="absolute bottom-8 sm:bottom-4 right-0 sm:right-4 text-xs uppercase z-10 text-status-success font-bold tracking-wider whitespace-nowrap">
                    {t.sections.payment.copied || 'Copied!'}
                  </span>
                )}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchTrackingInfo}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-black rounded-none hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-8 h-8 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>



      {!loading && (
        <>
          {trackingData ? (
            trackingData.trackingNumber ? (
              <div className="p-4 bg-white/60 rounded-none">
                <h4 className="font-semibold text-text-main mb-2">{t.sections.shipping.trackingInformation}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black">{t.sections.shipping.trackingNumber}:</span>
                    <span className="text-text-main font-mono">{trackingData.trackingNumber}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/60 rounded-none text-center">
                <p className="text-black uppercase tracking-widest text-xs">{t.sections.shipping.notShippedYet}</p>
              </div>
            )
          ) : (
            <div className="p-4 bg-white/60 rounded-none text-center">
              <p className="text-black text-sm">
                {t.sections.shipping.clickRefresh}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OrderDetailsClient({ order: initialOrder, siteSettings, isB2B = false, lang, dict, userEmail }: OrderDetailsClientProps) {
  const t = dict.orderDetails;
  const locale = lang;
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [translatedNames, setTranslatedNames] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('payment')
  const [order, setOrder] = useState<Order>(initialOrder)

  useEffect(() => {
    const isDemo = searchParams.get('demo') === 'true';
    if (isDemo) {
      const orderId = params.id as string;
      const storedData = sessionStorage.getItem(`demo_order_${orderId}`);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          const demoOrder: Order = {
            id: orderId,
            status: 'processing',
            total_amount: parsed.total,
            subtotal_amount: String(parsed.subtotal),
            currency: parsed.currency,
            currency_rate: 1,
            vat_number: parsed.shippingAddress.vat_number,
            fees: parsed.feeAmount,
            vat: 0,
            freight_ex_vat: parsed.shippingCost,
            payment_method: parsed.paymentMethod,
            guest_email: parsed.userEmail,
            shipping_address: parsed.shippingAddress,
            order_items: parsed.cartItems.map((item: any, index: number) => {
              let tieredPrice = 0;
              const tiers = item.product.price_chart?.tiers;
              if (tiers && tiers.length > 0) {
                const sortedTiers = [...tiers].sort((a, b) => b.min - a.min);
                const applicableTier = sortedTiers.find((t: any) => item.quantityGrams >= t.min);
                tieredPrice = applicableTier ? applicableTier.price : sortedTiers[sortedTiers.length - 1].price;
              }

              return {
                id: `item-${index}`,
                product_id: item.product.id,
                quantity_grams: item.quantityGrams,
                price_per_kg: tieredPrice,
                product: {
                  id: item.product.id,
                  name: item.product.name,
                  product_image: item.product.product_image,
                  kg_price: item.product.kg_price !== false,
                  price_chart: item.product.price_chart
                }
              };
            })
          };
          console.log(demoOrder)
          setOrder(demoOrder);
        } catch (e) {
          console.error("Failed to parse demo order data", e);
        }
      }
    }
  }, [params.id, searchParams]);


  const tabs = [
    {
      id: 'payment',
      label: t.sections.payment.title || 'Payment',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'shipping',
      label: t.sections.shipping.tracking || 'Shipping',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const orderId = params.id as string
    const token = searchParams.get('token')

    if (!token) {
      const storedToken = localStorage.getItem(`order_token_${orderId}`)

      if (storedToken) {
        router.push(`/${locale}/orders/${orderId}?token=${encodeURIComponent(storedToken)}`)
      }
    } else {
      localStorage.setItem(`order_token_${orderId}`, token)

      sessionStorage.setItem(`order_token_${orderId}`, token)
    }
  }, [params.id, searchParams, router, locale])

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-status-info/40 font-semibold text-status-info';
      case 'shipped':
        return 'bg-status-success/40 font-semibold text-status-success';
      case 'delivered':
        return 'bg-secondary/40 font-bold text-black';
      case 'cancelled':
        return 'bg-status-error/40 font-semibold text-status-error';
      default:
        return 'bg-status-warning/40 font-semibold text-status-warning';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-0">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:!flex-row justify-between items-start md:items-center">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-semibold font-merriweather-main text-static-black tracking-wide">
                {t.title}
              </h1>
              <p className="text-xs md:text-lg text-black mt-1"><strong className='uppercase font-semilight tracking-widest'>{t.sections.orderInfo.orderId}</strong> {order.id}</p>
            </div>

            <div className={`mt-2 md:mt-0 px-4 py-2 rounded-none self-start ${getStatusStyle(order.status)}`}>
              <div className="flex text-xs md:text-lg items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${order.status.toLowerCase() === 'processing' ? 'bg-status-info' :
                    order.status.toLowerCase() === 'delivered' ? 'bg-secondary' :
                      order.status.toLowerCase() === 'cancelled' ? 'bg-status-error' :
                        order.status.toLowerCase() === 'shipped' ? 'bg-status-success' :
                          'bg-status-warning'
                    } opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${order.status.toLowerCase() === 'processing' ? 'bg-status-info' :
                    order.status.toLowerCase() === 'delivered' ? 'bg-secondary' :
                      order.status.toLowerCase() === 'cancelled' ? 'bg-status-error' :
                        order.status.toLowerCase() === 'shipped' ? 'bg-status-success' :
                          'bg-status-warning'
                    }`}></span>
                </span>
                <span>{t.sections.statuses[order.status.toLowerCase()] || order.status}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6">
            <div className="lg:col-span-2 space-y-2 md:space-y-6">
              <div className="bg-slate-50 rounded-none overflow-hidden">
                <div className="p-4 pb-0 md:p-6">
                  <h2 className="text-2xl font-semibold text-black flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {t.sections.items.title}
                  </h2>
                </div>

                <div>
                  {order.order_items.map((item) => {
                    const isKgBased = item.product.kg_price !== false;

                    return (
                      <div key={item.id} className="p-4 md:p-6 transition-colors">
                        <div className="flex items-center justify-between min-w-0">
                          <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center text-primary">
                              {getOrderItemImageUrl(item) ? (
                                <Image src={getOrderItemImageUrl(item)!} alt={item.product.name} width={48} height={48} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 ">
                              <Link href={`/${locale}/products/${item.product.id}`} className="transition-colors">
                                <h3 className="text-xs md:text-lg font-medium tracking-wide font-merriweather-main text-static-black hover:text-black hover:underline truncate">
                                  {translatedNames[item.product.id] || item.product.name}
                                </h3>
                              </Link>
                              <div className="flex flex-col sm:!flex-row sm:items-center text-[8px] md:text-xs text-black sm:space-x-3">
                                <span className="flex-shrink-0 uppercase tracking-wider"><span className='font-semibold'>{t.sections.items.quantity}:</span> {
                                  isKgBased
                                    ? `${item.quantity_grams}g`
                                    : `${item.quantity_grams} ${item.quantity_grams === 1 ? t.sections.orderInfo.unit : t.sections.orderInfo.units}`
                                }</span>
                                {item.selected_color && (
                                  <span className="flex items-center min-w-0">
                                    <span className="flex-shrink-0 font-semibold uppercase tracking-wider">{t.sections.items.color}: </span>
                                    <span className="truncate ml-1 uppercase tracking-wider">{item.selected_color}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <p className="text-[10px] md:text-lg text-black tracking-wide font-medium text-right">
                              {formatCurrency(getOrderItemDisplayPrice(item, order, isB2B), locale, order.currency || 'EUR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-white mx-4 md:mx-6 rounded-none flex-col text-xs space-y-4">
                  <div className="flex justify-between items-center uppercase">
                    <span className="text-black">{t.sections.orderInfo.subtotal}</span>
                    <span className="text-black font-semibold tracking-wide">
                      {formatCurrency(Number(order.subtotal_amount || 0), locale, order.currency || 'EUR')}
                    </span>
                  </div>
                  {order.loyalty_discount_amount && order.loyalty_discount_amount > 0 && (
                    <div className="flex justify-between items-center uppercase">
                      <span className="text-black">
                        {t.sections.orderInfo.loyaltyDiscount} ({order.loyalty_discount_percentage || 0}%)
                      </span>
                      <span className="text-black font-semibold tracking-wide">
                        -{formatCurrency(
                          Number(order.loyalty_discount_amount),
                          locale,
                          order.currency || 'EUR'
                        )}
                      </span>
                    </div>
                  )}
                  {typeof order.freight_ex_vat === 'number' && order.freight_ex_vat > 0 && (
                    <div className="flex justify-between items-center uppercase">
                      <span className="text-black">{t.sections.orderInfo.shipping || 'Shipping'}</span>
                      <span className="text-black font-semibold tracking-wide">
                        {formatCurrency(order.freight_ex_vat, locale, order.currency || 'EUR')}
                      </span>
                    </div>
                  )}
                  {(order.vat && order.vat > 0) ? (
                    <div className="flex justify-between items-center uppercase">
                      <span className="text-black">{t.sections.orderInfo.vat}</span>
                      <span className="text-black font-semibold tracking-wide">
                        {formatCurrency(order.vat, locale, order.currency || 'EUR')}
                      </span>
                    </div>
                  ) : null}
                  {typeof order.fees === 'number' && order.fees > 0 && (
                    <div className="flex justify-between items-center uppercase">
                      <span className="text-black">{t.sections.orderInfo.transactionFee || 'Transaction Fee'}</span>
                      <span className="text-black font-semibold tracking-wide">
                        {formatCurrency(order.fees, locale, order.currency || 'EUR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex justify-between text-lg uppercase font-semibold">
                    <span className="text-text-main">{t.sections.orderInfo.total}</span>
                    <span className="text-black font-semibold tracking-wide">
                      {formatCurrency(order.total_amount, locale, order.currency || 'EUR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-none ">
                <div className="p-4 pb-0 md:p-6 md:!pb-0">
                  <h2 className="text-base md:text-2xl font-semibold text-black flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.sections.shipping.title}
                  </h2>
                </div>

                <div className="p-4 md:p-6">
                  <div className="bg-white/60 rounded-none p-3 md:p-4">
                    {order.shipping_address.company_name ? (
                      <p className="text-text-main font-semibold text-sm md:text-lg">{order.shipping_address.company_name}</p>
                    ) : null}
                    {order.vat_number && (
                      <p className="text-black text-xs md:text-sm mb-2">{t.sections.shipping.vat}: {order.vat_number}</p>
                    )}
                    <div className="mt-2 space-y-1 text-xs md:text-base text-text-main">
                      <p>{order.shipping_address.address_line1}</p>
                      {order.shipping_address.address_line2 && (
                        <p>{order.shipping_address.address_line2}</p>
                      )}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-secondary/10 space-y-3">
                      <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">{t.sections.compliance.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-black font-bold">{t.sections.compliance.responsiblePerson}</p>
                          <p className="text-xs md:text-sm text-text-main font-medium">{order.shipping_address.responsible_person || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-black font-bold">{t.sections.compliance.gln}</p>
                          <p className="text-xs md:text-sm text-text-main font-medium">{order.shipping_address.gln || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-black font-bold">{t.sections.compliance.pharmacyLicense}</p>
                          <p className="text-xs md:text-sm text-text-main font-medium font-mono">{order.shipping_address.pharmacy_license || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-black font-bold">{t.sections.compliance.btmLicense}</p>
                          <p className="text-xs md:text-sm text-text-main font-medium font-mono">{order.shipping_address.btm_license || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-black font-bold">{t.sections.compliance.deliveryWindow}</p>
                          <p className="text-xs md:text-sm text-text-main font-medium uppercase">{order.shipping_address.delivery_time_window || 'Standard'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {order.billing_address && (
                <div className="bg-slate-50 rounded-none mt-6">
                  <div className="p-4 pb-0 md:p-6 md:!pb-0">
                    <h2 className="text-base md:text-2xl font-semibold text-black flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      {t.sections.billing.title || 'Billing Address'}
                    </h2>
                  </div>

                  <div className="p-4 md:p-6">
                    <div className="bg-white/60 rounded-none p-3 md:p-4">
                      {order.billing_address.company_name ? (
                        <p className="text-text-main font-semibold text-sm md:text-lg">{order.billing_address.company_name}</p>
                      ) : null}
                      {order.vat_number && (
                        <p className="text-black text-xs md:text-sm mb-2">{t.sections.billing.vat}: {order.vat_number}</p>
                      )}
                      <div className="mt-2 space-y-1 text-xs md:text-base text-text-main">
                        <p>{order.billing_address.address_line1}</p>
                        {order.billing_address.address_line2 && (
                          <p>{order.billing_address.address_line2}</p>
                        )}
                        <p>
                          {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                        </p>
                        <p>{order.billing_address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 rounded-none">
                <div className="px-4 pt-4 pb-0">
                  <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
                </div>

                <div className="p-4 pt-0">
                  {activeTab === 'payment' && (
                    <PaymentMethodDisplay
                      paymentMethod={order.payment_method}
                      orderId={order.id}
                      locale={locale}
                      token={searchParams.get('token') || ''}
                      t={t}
                    />
                  )}

                  {activeTab === 'shipping' && (
                    <ShippingTracking
                      orderId={order.id}
                      status={order.status}
                      t={t}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
