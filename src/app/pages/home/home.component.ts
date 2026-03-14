import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttractionsService } from '../../services/attractions.service';
import { TicketsService } from '../../services/tickets.service';
import { ReviewsService } from '../../services/reviews.service';
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
  pricingCards: Ticket[] = [];
  reviews: Review[] = [];

  // Availability widget
  selectedDate = '';
  ticketType = 'General Admission';
  guests = '2 Adults, 1 Child';
  timeSlot = 'Morning (10 AM - 1 PM)';

  // Mini FAQ
  openFaqId: number | null = null;
  miniFaqs = [
    { id: 1, question: 'What are the park timings?',            answer: 'Havelock is open 10 AM – 8 PM on weekdays, and 9 AM – 9 PM on weekends and holidays.' },
    { id: 2, question: 'Is swimwear mandatory?',                answer: 'Yes. Proper nylon/lycra swimwear is required for all rides and pools. Board shorts are acceptable.' },
    { id: 3, question: 'Are outside food and drinks allowed?',  answer: 'Outside food and drinks are not permitted. We have a full food court and multiple snack bars.' },
    { id: 4, question: 'Is there a parking facility available?',answer: 'Yes, parking is available for 500+ vehicles. ₹100 for two-wheelers, ₹200 for four-wheelers.' }
  ];

  whyChooseUs = [
    { icon: 'booking',  title: 'Easy Online Booking',  desc: 'Skip long queues and book your tickets in minutes from home.' },
    { icon: 'qr',       title: 'Fast QR Entry',         desc: 'Simply show your digital QR code and walk straight to the fun.' },
    { icon: 'family',   title: 'Family–Friendly',       desc: 'Rides and zones for all ages, from toddlers to grandparents.' },
    { icon: 'support',  title: 'Simple Support',        desc: 'Our friendly team is available 9 AM–7 PM throughout your visit.' }
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.attractionsService.getFeatured().subscribe(data => {
      this.featuredAttractions = data.slice(0, 4);
    });

    this.ticketsService.getByDayType('weekday').subscribe(data => {
      // Show Adult, Family Combo, Child on home page
      this.pricingCards = data.filter(t => ['adult', 'family', 'child'].includes(t.type));
    });

    this.reviewsService.getAll().subscribe(data => {
      this.reviews = data;
    });
  }

  checkAvailability(): void {
    this.router.navigate(['/availability']);
  }

  toggleFaq(id: number): void {
    this.openFaqId = this.openFaqId === id ? null : id;
  }

  getCategoryClass(category: string): string {
    return category.toLowerCase().replace(' ', '-');
  }
}
