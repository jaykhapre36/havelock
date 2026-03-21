import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttractionsService } from '../../services/attractions.service';
import { TicketsService } from '../../services/tickets.service';
import { ReviewsService } from '../../services/reviews.service';
import { AvailabilityService } from '../../services/availability.service';
import { Attraction } from '../../models/attraction.model';
import { Ticket } from '../../models/ticket.model';
import { Review } from '../../models/review.model';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  featuredAttractions: Attraction[] = [];
  allRides: Attraction[] = [];
  parkAttractions: Attraction[] = [];
  pricingCards: Ticket[] = [];
  reviews: Review[] = [];

  // Availability widget
  selectedDate = new Date().toISOString().split('T')[0];
  availableDates: Set<string> = new Set();
  minDate = '';
  maxDate = '';
  isOpenToday = false;
  isOpenTomorrow = false;

  // Mini FAQ
  openFaqId: number | null = null;
  miniFaqs = [
    { id: 1, question: 'What are the park timings?',            answer: 'Havelock is open every day from 10:00 AM – 6:00 PM.' },
    { id: 2, question: 'Is swimwear mandatory?',                answer: 'Yes. Proper nylon/lycra swimwear is required for all rides and pools. Board shorts are acceptable.' },
    { id: 3, question: 'Are outside food and drinks allowed?',  answer: 'Outside food and drinks are not permitted. We have a full food court and multiple snack bars.' },
    { id: 4, question: 'Is there a parking facility available?',answer: 'Yes, parking is available for 500+ vehicles. ₹100 for two-wheelers, ₹200 for four-wheelers.' }
  ];

  whyChooseUs = [
    { icon: 'booking',  title: 'Easy Online Booking',  desc: 'Skip long queues and book your tickets in minutes from home.' },
    { icon: 'family',   title: 'Great Value',            desc: 'Affordable pricing with group discounts and seasonal offers.' },
    { icon: 'family',   title: 'Family–Friendly',       desc: 'Rides and zones for all ages, from toddlers to grandparents.' },
    { icon: 'support',  title: 'Simple Support',        desc: 'Our friendly team is available 9 AM–7 PM throughout your visit.' }
  ];

  amenities = [
    {
      icon: 'facilities',
      title: 'Facilities',
      items: ['Changing Rooms & Lockers', 'Shower Areas', 'Restrooms / Washrooms']
    },
    {
      icon: 'food',
      title: 'Food & Drink',
      highlight: true,
      subtitle: '10 Food Stalls · 1 Restaurant',
      items: [
        'Sheetal Ice Cream', 'Coconut Water', 'Sugarcane Juice',
        'Popcorn & Soft Drinks', 'Chinese Food', 'South Indian',
        'Live Dhokla', 'Makai & Chana Chor Garam',
        'Fruit Dish', 'Dabeli, Vada Pav & Samosa'
      ]
    },
    {
      icon: 'comfort',
      title: 'Comfort & Convenience',
      items: ['Parking — Two-wheeler & Four-wheeler', 'First Aid / Medical Room', 'Accessibility Support']
    },
    {
      icon: 'services',
      title: 'In-Park Services',
      items: ['Swimwear & Floats Rental', 'Towel Rental', 'Photography & Photo Booths']
    },
    {
      icon: 'relax',
      title: 'Relaxation',
      items: ['Seating Areas & Benches', 'Shaded Lounges / Sun Beds', 'Cabanas (Private Shaded Areas)']
    }
  ];

  eventTypes = [
    { icon: '🏫', label: 'School Trips'       },
    { icon: '🎂', label: 'Birthday Parties'   },
    { icon: '💼', label: 'Corporate Outings'  },
    { icon: '👨‍👩‍👧‍👦', label: 'Family Gatherings' }
  ];

  constructor(
    private attractionsService: AttractionsService,
    private ticketsService: TicketsService,
    private reviewsService: ReviewsService,
    private availabilityService: AvailabilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.availabilityService.getSlots().subscribe(res => {
      const today = new Date().toISOString().split('T')[0];
      const available = res.data.slots.filter(s => s.remaining > 0);
      this.availableDates = new Set(available.map(s => s.slot_date));
      this.isOpenToday = this.availableDates.has(today);
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      this.isOpenTomorrow = !this.isOpenToday && this.availableDates.has(tomorrowStr);
      if (available.length) {
        this.minDate = available[0].slot_date;
        this.maxDate = available[available.length - 1].slot_date;
        if (!this.availableDates.has(this.selectedDate)) {
          this.selectedDate = available[0].slot_date;
        }
      }
    });

    this.attractionsService.getFeatured().subscribe(data => {
      this.featuredAttractions = data.slice(0, 4);
    });

    this.attractionsService.getAll().subscribe(data => {
      this.allRides        = data.filter(a => ['Thrill', 'Family', 'Kids'].includes(a.category));
      this.parkAttractions = data.filter(a => ['Relax', 'Entertainment'].includes(a.category));
    });

    this.ticketsService.getByDayType('weekday').subscribe(data => {
      // Show Adult, Family Combo, Child on home page
      this.pricingCards = data.filter(t => ['adult', 'family', 'child'].includes(t.type));
    });

    this.reviewsService.getAll().subscribe(data => {
      this.reviews = data;
    });
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  checkAvailability(): void {
    if (this.selectedDate) {
      this.router.navigate(['/availability'], { queryParams: { date: this.selectedDate } });
    } else {
      this.router.navigate(['/availability']);
    }
  }

  toggleFaq(id: number): void {
    this.openFaqId = this.openFaqId === id ? null : id;
  }

  getCategoryClass(category: string): string {
    return category.toLowerCase().replace(' ', '-');
  }

  getAttrGradient(cat: string): string {
    const map: Record<string, string> = {
      Relax:         'linear-gradient(135deg,#27ae60,#2ecc71)',
      Entertainment: 'linear-gradient(135deg,#8e44ad,#9b59b6)'
    };
    return map[cat] ?? 'linear-gradient(135deg,#0077A8,#00B4D8)';
  }

  getRideGradient(cat: string): string {
    const map: Record<string, string> = {
      Thrill: 'linear-gradient(135deg,#c0392b,#e74c3c)',
      Family: 'linear-gradient(135deg,#1565c0,#00B4D8)',
      Kids:   'linear-gradient(135deg,#f39c12,#f1c40f)'
    };
    return map[cat] ?? 'linear-gradient(135deg,#0077A8,#00B4D8)';
  }
}
