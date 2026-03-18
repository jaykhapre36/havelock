import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var Razorpay: any;

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  /**
   * Open Razorpay checkout with a given amount (in rupees).
   * No backend order creation required.
   * Resolves with razorpay_payment_id on success.
   * Rejects with Error('cancelled') if user dismisses, or payment error message.
   */
  openCheckout(
    amountRupees: number,
    prefill: { name: string; email: string; contact: string },
    description: string
  ): Promise<RazorpayPaymentResult> {
    return new Promise((resolve, reject) => {
      const options = {
        key: environment.razorpayKeyId,
        amount: amountRupees * 100,   // convert to paise
        currency: 'INR',
        name: 'Havelock Water Park',
        description,
        prefill: {
          name: prefill.name,
          email: prefill.email,
          contact: prefill.contact
        },
        config: {
          display: {
            blocks: {
              pay: {
                name: 'Pay using UPI or Card',
                instruments: [
                  { method: 'upi' },
                  { method: 'card' }
                ]
              }
            },
            sequence: ['block.pay'],
            preferences: { show_default_blocks: false }
          }
        },
        theme: { color: '#00BCD4' },
        handler: (response: RazorpayPaymentResult) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('cancelled'))
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (res: any) => {
        reject(new Error(res.error?.description || 'Payment failed'));
      });
      rzp.open();
    });
  }
}
