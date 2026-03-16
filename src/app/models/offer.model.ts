export interface Offer {
  id: number;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'flat';
  promoCode: string;
  validUntil: string;
  minGuests: number;
  applicableOn: string[];
  isActive: boolean;
  tag?: string;
  emoji?: string;
  originalPrice?: number;
  discountedPrice?: number;
  category?: 'deal' | 'seasonal';
}
