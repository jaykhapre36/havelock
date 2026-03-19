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
   *
   * Lifecycle:
   *  - handler fires   → payment succeeded → resolve immediately
   *  - payment.failed  → store error, keep modal open (user can retry within modal)
   *  - ondismiss fires → if handler already resolved, do nothing;
   *                      if payment failed, reject with that error;
   *                      if user just closed, reject with 'cancelled'
   */
  openCheckout(
    amountRupees: number,
    prefill: { name: string; email: string; contact: string },
    description: string
  ): Promise<RazorpayPaymentResult> {
    return new Promise((resolve, reject) => {
      let succeeded = false;
      let lastFailureReason = '';

      const options = {
        key: environment.razorpayKeyId,
        amount: Math.round(amountRupees) * 100,  // paise, must be integer
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

        // ✅ Payment succeeded — resolve immediately
        handler: (response: RazorpayPaymentResult) => {
          succeeded = true;
          resolve(response);
        },

        modal: {
          // Modal closed — resolve/reject based on what happened inside
          ondismiss: () => {
            if (succeeded) {
              // handler already resolved — nothing to do
              return;
            }
            if (lastFailureReason) {
              // Payment was attempted but failed; user closed after seeing the error
              reject(new Error(lastFailureReason));
            } else {
              // User closed without attempting payment
              reject(new Error('cancelled'));
            }
          }
        }
      };

      const rzp = new Razorpay(options);

      // Store failure reason but keep modal open so user can retry within it
      rzp.on('payment.failed', (res: any) => {
        lastFailureReason = res?.error?.description || 'Payment was declined. Please try a different method.';
      });

      rzp.open();
    });
  }
}
