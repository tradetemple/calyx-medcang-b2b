/* eslint-disable @typescript-eslint/no-explicit-any */
import OrderDetailsClient from './OrderDetailsClient'
import { getSiteSettings } from '@/app/[lang]/utils/site-settings'
import { getDictionary } from '@/app/[lang]/dictionaries';
import { getProductsForListView } from '@/lib/optimized-products';

interface OrderItem {
  id: string;
  product_id: string;
  quantity_grams: number;
  price_per_kg: number;
  selected_color?: string;
  option_details?: string;
  product: {
    id: string;
    name: string;
    product_image: string;
    kg_price?: boolean;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  subtotal_amount?: string;
  currency?: string;
  currency_rate?: number;
  base_currency?: string;
  base_amount?: number;
  vat_number?: string;
  fees?: number;
  vat?: number;
  freight_ex_vat?: number;
  coupon?: string;
  coupon_discount?: number;
  loyalty_discount_percentage?: number;
  loyalty_discount_amount?: number;
  shipping_address: {
    company_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    // Compliance fields
    gln?: string;
    pharmacy_license?: string;
    btm_license?: string;
    responsible_person?: string;
    delivery_time_window?: string;
  };
  billing_address?: {
    company_name?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  order_items: OrderItem[];
  payment_method: string;
  user_id?: string;
  guest_email?: string;
}

const OrderDetailsPage = async (props: any) => {
  const { params } = props;
  const { lang, id } = await params;

  // Mock data for demonstration purposes
  const orderData: any = {
    id: id || 'DEMO-123456',
    status: 'processing',
    total_amount: 1450.50,
    subtotal_amount: '1350.00',
    currency: 'EUR',
    currency_rate: 1,
    vat_number: 'DE123456789',
    fees: 15.50,
    vat: 0,
    freight_ex_vat: 85.00,
    payment_method: 'invoice_30',
    guest_email: 'demo@demecan.de',
    shipping_address: {
      company_name: 'Demecan Partners GmbH',
      address_line1: 'Marienstraße 10',
      address_line2: 'Building B',
      city: 'Berlin',
      state: 'Berlin',
      postal_code: '10117',
      country: 'DE',
      gln: '4000001000005',
      pharmacy_license: 'AZ-74-abc-12345',
      btm_license: 'BtM-E-12345',
      responsible_person: 'Dr. Max Mustermann',
      delivery_time_window: 'morning'
    },
    order_items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        quantity_grams: 500,
        price_per_kg: 2500,
        product: {
          id: 'prod-1',
          name: 'Medical Cannabis Flower - Strain A',
          product_image: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=400',
          kg_price: true
        }
      },
      {
        id: 'item-2',
        product_id: 'prod-2',
        quantity_grams: 200,
        price_per_kg: 3000,
        product: {
          id: 'prod-2',
          name: 'Medical Cannabis Flower - Strain B',
          product_image: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=400',
          kg_price: true
        }
      }
    ]
  };

  const transformedOrder: Order = {
    ...orderData,
    order_items: orderData.order_items.map((item: any) => ({
      ...item,
      product: {
        ...item.product
      }
    }))
  };

  const siteSettings = await getSiteSettings()
  if (!siteSettings) {
    throw new Error('Site settings not found')
  }
  const dict = await getDictionary(lang);

  const allOptimizedProducts = await getProductsForListView(lang, 8);

  const categoryMap: Record<string, string> = {};
  allOptimizedProducts.forEach(product => {
    if (product.processedCategories) {
      product.processedCategories.forEach(cat => {
        categoryMap[cat.originalSlug] = cat.name;
      });
    }
  });

  return (
    <div className='bg-white pb-12'>
      <OrderDetailsClient
        order={transformedOrder}
        siteSettings={siteSettings}
        isB2B={true}
        lang={lang}
        dict={dict}
        userEmail="demo@demecan.de"
        demoMode={true}
      />
    </div>
  );
};

export default OrderDetailsPage;
