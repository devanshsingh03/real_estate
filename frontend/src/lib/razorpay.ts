declare global {
  interface Window {
    Razorpay: any;
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name: string;
  description: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
}

export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions) {
  await loadRazorpayScript();
  const rzp = new window.Razorpay({
    key: opts.keyId,
    amount: opts.amount,
    currency: opts.currency,
    name: 'Real Estate Bros',
    description: opts.description,
    order_id: opts.orderId,
    prefill: {
      name: opts.prefillName,
      email: opts.prefillEmail,
      contact: opts.prefillContact,
    },
    theme: { color: '#102B25' },
    handler: (response: any) => opts.onSuccess(response),
    modal: {
      ondismiss: () => opts.onDismiss?.(),
    },
  });
  rzp.open();
}
