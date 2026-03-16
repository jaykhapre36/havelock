import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../../services/tickets.service';
import { OffersService }  from '../../services/offers.service';
import { FaqService }     from '../../services/faq.service';
import { Ticket }         from '../../models/ticket.model';
import { Offer }          from '../../models/offer.model';
import { FaqCategory }    from '../../models/faq.model';

type DayType = 'weekday' | 'sunday';

@Component({
  standalone: false,
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

  tickets:  Ticket[]      = [];
  offers:   Offer[]       = [];
  faqCategories: FaqCategory[] = [];
  loading = true;

  activeDayType: DayType = 'weekday';
  dayTypes: { key: DayType; label: string }[] = [
    { key: 'weekday', label: 'Mon – Sat' },
    { key: 'sunday',  label: 'Sunday'    }
  ];

  // Promo code
  promoCode     = '';
  appliedOffer: Offer | null = null;
  promoError    = '';
  promoSuccess  = '';
  promoLoading  = false;

  // FAQ
  openFaqId: number | null = null;

  // Cancellation policy accordion
  policyOpen = false;

  constructor(
    private ticketsService: TicketsService,
    private offersService:  OffersService,
    private faqService:     FaqService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.offersService.getActive().subscribe(data => {
      this.offers = data;
    });
    // Load only the Booking & Tickets FAQ category (id=1)
    this.faqService.getByCategory(1).subscribe(cat => {
      if (cat) this.faqCategories = [cat];
    });
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketsService.getByDayType(this.activeDayType).subscribe(data => {
      this.tickets = data;
      this.loading = false;
    });
  }

  setDayType(type: DayType): void {
    this.activeDayType = type;
    this.loadTickets();
  }

  applyPromo(): void {
    if (!this.promoCode.trim()) return;
    this.promoLoading = true;
    this.promoError   = '';
    this.promoSuccess = '';
    this.offersService.validatePromoCode(this.promoCode).subscribe(offer => {
      this.promoLoading = false;
      if (offer) {
        this.appliedOffer = offer;
        const disc = offer.discountType === 'percentage'
          ? `${offer.discount}% off`
          : `₹${offer.discount} off`;
        this.promoSuccess = `Promo applied! You get ${disc}.`;
      } else {
        this.appliedOffer = null;
        this.promoError   = 'Invalid promo code. Please try again.';
      }
    });
  }

  removePromo(): void {
    this.appliedOffer = null;
    this.promoCode    = '';
    this.promoSuccess = '';
    this.promoError   = '';
  }

  getDiscountedPrice(price: number): number {
    if (!this.appliedOffer) return price;
    if (this.appliedOffer.discountType === 'percentage') {
      return Math.round(price * (1 - this.appliedOffer.discount / 100));
    }
    return Math.max(0, price - this.appliedOffer.discount);
  }

  toggleFaq(id: number): void {
    this.openFaqId = this.openFaqId === id ? null : id;
  }

  getWhyBenefits(): string[] {
    return [
      'Save 10% on ticket prices',
      'Skip the long entry queues',
      'Enjoy flexible rescheduling'
    ];
  }
}
