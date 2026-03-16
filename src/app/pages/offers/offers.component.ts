import { Component, OnInit } from '@angular/core';
import { OffersService } from '../../services/offers.service';
import { Offer } from '../../models/offer.model';

@Component({
  standalone: false,
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {

  deals: Offer[] = [];
  seasonals: Offer[] = [];
  promoCode = '';
  promoResult: { valid: boolean; offer?: Offer } | null = null;
  promoLoading = false;
  copiedCode: string | null = null;

  constructor(private offersService: OffersService) {}

  ngOnInit(): void {
    this.offersService.getAll().subscribe(offers => {
      this.deals = offers.filter(o => o.category === 'deal' || !o.category);
      this.seasonals = offers.filter(o => o.category === 'seasonal');
    });
  }

  validatePromo(): void {
    if (!this.promoCode.trim()) return;
    this.promoLoading = true;
    this.promoResult = null;
    this.offersService.validatePromoCode(this.promoCode.trim()).subscribe(offer => {
      this.promoLoading = false;
      this.promoResult = offer ? { valid: true, offer } : { valid: false };
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode = code;
      setTimeout(() => { this.copiedCode = null; }, 2000);
    });
  }

  getDiscountLabel(offer: Offer): string {
    return offer.discountType === 'percentage'
      ? `${offer.discount}% OFF`
      : `₹${offer.discount} OFF`;
  }

  clearPromo(): void {
    this.promoCode = '';
    this.promoResult = null;
  }
}
