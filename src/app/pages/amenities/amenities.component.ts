import { Component } from '@angular/core';

interface AmenityGroup {
  icon: string;
  title: string;
  subtitle?: string;
  highlight?: boolean;
  items: { name: string; note?: string }[];
}

@Component({
  standalone: false,
  selector: 'app-amenities',
  templateUrl: './amenities.component.html',
  styleUrls: ['./amenities.component.scss']
})
export class AmenitiesComponent {

  groups: AmenityGroup[] = [
    {
      icon: 'facilities',
      title: 'Facilities',
      subtitle: 'Clean, well-maintained for your comfort',
      items: [
        { name: 'Changing Rooms & Lockers', note: 'Secure lockers available on rent' },
        { name: 'Shower Areas',             note: 'Hot & cold water showers' },
        { name: 'Restrooms / Washrooms',    note: 'Available across all zones' }
      ]
    },
    {
      icon: 'food',
      title: 'Food & Drink',
      subtitle: '10 Food Stalls · 1 Full Restaurant',
      highlight: true,
      items: [
        { name: 'Sheetal Ice Cream',            note: 'Cool off with a variety of flavours' },
        { name: 'Coconut Water',                note: 'Fresh & natural hydration' },
        { name: 'Sugarcane Juice',              note: 'Freshly pressed' },
        { name: 'Popcorn & Soft Drinks',        note: 'Quick snacks on the go' },
        { name: 'Chinese Food',                 note: 'Noodles, momos & more' },
        { name: 'South Indian',                 note: 'Idli, dosa & vadas' },
        { name: 'Live Dhokla',                  note: 'Authentic Gujarati steamed snack' },
        { name: 'Makai & Chana Chor Garam',     note: 'Classic Gujarati street flavours' },
        { name: 'Fruit Dish',                   note: 'Fresh seasonal fruits' },
        { name: 'Dabeli, Vada Pav & Samosa',    note: 'Crowd-favourite street bites' }
      ]
    },
    {
      icon: 'comfort',
      title: 'Comfort & Convenience',
      subtitle: 'Everything to make your visit stress-free',
      items: [
        { name: 'Parking — Two-wheeler',     note: '₹100 per vehicle' },
        { name: 'Parking — Four-wheeler',    note: '₹200 per vehicle' },
        { name: 'First Aid / Medical Room',  note: 'Trained staff on duty' },
        { name: 'Accessibility Support',     note: 'Wheelchair-friendly pathways' }
      ]
    },
    {
      icon: 'services',
      title: 'In-Park Services',
      subtitle: 'Rentals & experiences inside the park',
      items: [
        { name: 'Swimwear & Floats Rental', note: 'Available at the entrance' },
        { name: 'Towel Rental',             note: 'Fresh towels at nominal cost' },
        { name: 'Photography & Photo Booths', note: 'Capture your best moments' }
      ]
    },
    {
      icon: 'relax',
      title: 'Relaxation',
      subtitle: 'Unwind between the splashes',
      items: [
        { name: 'Seating Areas & Benches',       note: 'Spread across all zones' },
        { name: 'Shaded Lounges / Sun Beds',     note: 'Relax in the shade' },
        { name: 'Cabanas',                       note: 'Private shaded areas available' }
      ]
    }
  ];
}
