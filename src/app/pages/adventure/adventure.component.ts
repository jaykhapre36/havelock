import { Component } from '@angular/core';

type ActivityCategory = 'All' | 'Heights' | 'Climbing' | 'Thrill Rides' | 'Water' | 'Games';

interface Activity {
  id: number;
  name: string;
  description: string;
  category: string;
  intensity: string;
  image: string;
  features: string[];
}

@Component({
  standalone: false,
  selector: 'app-adventure',
  templateUrl: './adventure.component.html',
  styleUrls: ['./adventure.component.scss']
})
export class AdventureComponent {

  activities: Activity[] = [
    {
      id: 1,
      name: 'High Ropes Course',
      description: 'Walk across suspended bridges and planks high above ground, secured with full harness and helmet — a true test of balance and courage.',
      category: 'Heights',
      intensity: 'Intense',
      image: 'mock-data/adventure_images/adventure-ropes-1.webp',
      features: ['Full harness', 'Helmet provided', 'Trained guides']
    },
    {
      id: 2,
      name: 'Rock Climbing Wall',
      description: 'Scale a tall textured wall with colourful handholds. Suitable for beginners to experienced climbers, with safety ropes at all times.',
      category: 'Climbing',
      intensity: 'Moderate',
      image: 'mock-data/adventure_images/adventure-climbing-1.webp',
      features: ['Multiple difficulty levels', 'Safety rope', 'Helmet & harness']
    },
    {
      id: 3,
      name: 'Tyre Wall Climbing',
      description: 'Climb a giant wall made of colourful linked tyres — a unique and fun challenge that tests your grip and upper body strength.',
      category: 'Climbing',
      intensity: 'Moderate',
      image: 'mock-data/adventure_images/adventure-tyre-wall-1.webp',
      features: ['Colourful tyre wall', 'Safety harness', 'All ages welcome']
    },
    {
      id: 4,
      name: 'Rope Net Traverse',
      description: 'Crawl and climb across large rope nets suspended at height — an exciting obstacle that challenges your coordination.',
      category: 'Heights',
      intensity: 'Moderate',
      image: 'mock-data/adventure_images/adventure-rope-net-1.webp',
      features: ['Rope net obstacle', 'Safety harness', 'Fun for groups']
    },
    {
      id: 5,
      name: 'Human Gyroscope',
      description: 'Strap in and spin in all directions inside our rotating gyroscope machine — a thrilling 360° experience like no other.',
      category: 'Thrill Rides',
      intensity: 'Intense',
      image: 'mock-data/adventure_images/adventure-gyroscope-1.webp',
      features: ['360° rotation', 'Safety restraints', 'Thrilling experience']
    },
    {
      id: 6,
      name: 'Water Zorbing',
      description: 'Roll and tumble inside a giant transparent inflatable ball on water. Perfect for kids and adults — pure fun guaranteed.',
      category: 'Water',
      intensity: 'Relaxed',
      image: 'mock-data/adventure_images/adventure-zorbing-1.webp',
      features: ['On-water experience', 'Giant transparent ball', 'Kids & adults']
    },
    {
      id: 7,
      name: 'Kayaking',
      description: 'Paddle through our calm pool in colourful kayaks. A great introductory water sport suitable for the whole family.',
      category: 'Water',
      intensity: 'Relaxed',
      image: 'mock-data/adventure_images/adventure-kayaking-1.webp',
      features: ['Life jacket provided', 'Single & double kayaks', 'Guided session']
    },
    {
      id: 8,
      name: 'ATV Bike',
      description: 'Ride our powerful bikes around the park circuit. A thrilling off-road experience for adventure lovers of all ages.',
      category: 'Thrill Rides',
      intensity: 'Moderate',
      image: 'mock-data/adventure_images/adventure-atv-1.webp',
      features: ['Helmet provided', 'Family-friendly']
    },
    {
      id: 9,
      name: 'Giant Swing',
      description: 'Soar high into the sky on our giant swing — experience the rush of flying with the riverfront as your backdrop.',
      category: 'Heights',
      intensity: 'Intense',
      image: 'mock-data/adventure_images/adventure-sky-jump-1.webp',
      features: ['High altitude swing', 'Safety harness', 'Breathtaking views']
    },
    {
      id: 10,
      name: 'Sky Jump',
      description: 'Take the leap! Jump from a great height secured by bungee ropes — the ultimate adrenaline experience at Havelock.',
      category: 'Heights',
      intensity: 'Intense',
      image: 'mock-data/adventure_images/adventure-swing-1.webp',
      features: ['Bungee secured', 'Professional supervision', 'Height experience']
    },
    {
      id: 11,
      name: 'Mechanical Bull Riding',
      description: 'Hold on tight as you ride our spinning mechanical bull. See how long you can stay on — great fun for everyone!',
      category: 'Thrill Rides',
      intensity: 'Moderate',
      image: 'mock-data/adventure_images/adventure-bull-ride-1.webp',
      features: ['Inflatable safety ring', 'Adjustable speed', 'Fun for all ages']
    },
    {
      id: 12,
      name: 'Wipeout Arena',
      description: 'Dodge, duck and jump over rotating inflatable obstacles in our Wipeout Arena. Last one standing wins!',
      category: 'Games',
      intensity: 'Moderate',
      image: 'mock-data/adventure_images/adventure-wipeout-1.webp',
      features: ['Inflatable arena', 'Rotating obstacles', 'Group fun']
    },
  ];

  categories: ActivityCategory[] = ['All', 'Heights', 'Climbing', 'Thrill Rides', 'Water', 'Games'];
  activeCategory: ActivityCategory = 'All';

  get filteredActivities(): Activity[] {
    if (this.activeCategory === 'All') {
      return this.activities;
    }
    return this.activities.filter(a => a.category === this.activeCategory);
  }

  setCategory(cat: ActivityCategory): void {
    this.activeCategory = cat;
  }

  getCategoryColor(category: string): string {
    const map: Record<string, string> = {
      'Heights':      '#FF6B35',
      'Climbing':     '#2E8B57',
      'Thrill Rides': '#DC143C',
      'Water':        '#00B4D8',
      'Games':        '#9B59B6'
    };
    return map[category] ?? '#00B4D8';
  }
}
