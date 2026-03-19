
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

// Función para intentar cargar claves desde el archivo JSON de configuración
const getStripeConfig = () => {
  try {
    const configPath = path.join(process.cwd(), 'src', 'lib', 'settings-data.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return {
        secretKey: config.stripeSecretKey || process.env.STRIPE_SECRET_KEY,
        webhookSecret: config.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET,
      };
    }
  } catch (error) {
    console.error("Error loading stripe config from file:", error);
  }
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
};

const config = getStripeConfig();

export const stripe = new Stripe(config.secretKey as string, {
  apiVersion: '2024-06-20',
});

export interface StripeProduct extends Stripe.Product {
  priceInCents: number;
  price: string;
  defaultPriceId: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
  image: string;
  size?: string;
}

export interface StripeOrder {
  id: string;
  fullDate: Date;
  date: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  total: string;
  totalInCents: number;
  items: OrderItem[];
  shippingAddress: Stripe.Address | null;
}

export const getStripeProducts = async (): Promise<StripeProduct[]> => {
  try {
    const productsResponse = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price'],
    });

    return productsResponse.data.map((product) => {
      const price = product.default_price as Stripe.Price;
      return {
        ...product,
        priceInCents: price?.unit_amount || 0,
        defaultPriceId: price?.id || '',
        price: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: price?.currency || 'eur',
        }).format((price?.unit_amount || 0) / 100),
      };
    });
  } catch (error) {
    console.error("Error fetching products from Stripe:", error);
    return [];
  }
};

export const createStripeProduct = async (data: {
  name: string;
  description?: string;
  images?: string[];
  priceInCents: number;
  metadata: Record<string, string>;
}) => {
  return await stripe.products.create({
    name: data.name,
    description: data.description,
    images: data.images,
    metadata: data.metadata,
    default_price_data: {
      currency: 'eur',
      unit_amount: data.priceInCents,
    },
  });
};

export const updateStripeProduct = async (productId: string, data: {
  name?: string;
  description?: string;
  images?: string[];
  priceInCents?: number;
  metadata?: Record<string, string>;
}) => {
  const updateData: Stripe.ProductUpdateParams = {
    name: data.name,
    description: data.description,
    images: data.images,
    metadata: data.metadata,
  };

  if (data.priceInCents !== undefined) {
    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: data.priceInCents,
      currency: 'eur',
    });
    updateData.default_price = newPrice.id;
  }

  return await stripe.products.update(productId, updateData);
};

export const archiveStripeProduct = async (productId: string) => {
  return await stripe.products.update(productId, { active: false });
};

export const getStripeOrders = async (): Promise<StripeOrder[]> => {
  try {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items.data.price', 'data.customer'],
      status: 'complete',
    });
    
    const productIds = sessions.data.flatMap(session => 
        session.line_items?.data.map(item => item.price?.product).filter((id): id is string => !!id) || []
    );
    
    const uniqueProductIds = [...new Set(productIds)];
    
    let allProducts: Stripe.Product[] = [];
    if (uniqueProductIds.length > 0) {
        const productPromises = [];
        for (let i = 0; i < uniqueProductIds.length; i += 50) {
            const chunk = uniqueProductIds.slice(i, i + 50);
            productPromises.push(stripe.products.list({ ids: chunk, limit: 50 }));
        }
        const productResponses = await Promise.all(productPromises);
        allProducts = productResponses.flatMap(res => res.data);
    }

    return sessions.data.map(session => {
      const lineItems = session.line_items?.data || [];
      const customer = session.customer as Stripe.Customer | null;

      const orderItems: OrderItem[] = lineItems.map(item => {
        const productId = item.price?.product as string;
        const product = allProducts.find(p => p.id === productId);
        const sizeMatch = item.description?.match(/Talla: (.*?)$/);
        
        return {
          id: product?.id || item.price?.id || 'unknown',
          name: product?.name || item.description || 'Producto',
          quantity: item.quantity || 0,
          price: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'eur' }).format((item.price?.unit_amount || 0) / 100),
          image: product?.images?.[0] || '',
          size: sizeMatch ? sizeMatch[1] : undefined,
        }
      });
      
      const orderDate = new Date(session.created * 1000);

      return {
        id: session.id,
        fullDate: orderDate,
        date: orderDate.toLocaleDateString('es-ES'),
        customerName: customer?.name || session.customer_details?.name || 'Invitado',
        customerEmail: customer?.email || session.customer_details?.email || 'N/A',
        paymentStatus: session.payment_status,
        total: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'eur' }).format((session.amount_total || 0) / 100),
        totalInCents: session.amount_total || 0,
        items: orderItems,
        shippingAddress: session.shipping_details?.address || null,
      };
    });
  } catch (error) {
    console.error("Error fetching orders from Stripe:", error);
    return [];
  }
};

export const getStripeOrder = async (sessionId: string): Promise<StripeOrder | null> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'line_items.data.price', 'shipping_details'],
    });

    const productIds = session.line_items?.data.map(item => item.price?.product).filter((id): id is string => !!id) || [];
    let products: Stripe.Product[] = [];
    if (productIds.length > 0) {
      const res = await stripe.products.list({ ids: productIds });
      products = res.data;
    }

    const orderItems: OrderItem[] = (session.line_items?.data || []).map(item => {
      const product = products.find(p => p.id === item.price?.product);
      const sizeMatch = item.description?.match(/Talla: (.*?)$/);
      return {
        id: product?.id || 'unknown',
        name: product?.name || item.description || 'Producto',
        quantity: item.quantity || 0,
        price: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'eur' }).format((item.price?.unit_amount || 0) / 100),
        image: product?.images?.[0] || '',
        size: sizeMatch ? sizeMatch[1] : undefined,
      };
    });

    return {
      id: session.id,
      fullDate: new Date(session.created * 1000),
      date: new Date(session.created * 1000).toLocaleDateString('es-ES'),
      customerName: session.customer_details?.name || 'N/A',
      customerEmail: session.customer_details?.email || 'N/A',
      paymentStatus: session.payment_status,
      total: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'eur' }).format((session.amount_total || 0) / 100),
      totalInCents: session.amount_total || 0,
      items: orderItems,
      shippingAddress: session.shipping_details?.address || null,
    };
  } catch (error) {
    console.error("Error fetching single order:", error);
    return null;
  }
};
