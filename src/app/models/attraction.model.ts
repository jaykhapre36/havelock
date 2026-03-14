export interface Attraction {
  id: number;
  name: string;
  slug: string;
  category: 'Thrill' | 'Family' | 'Kids' | 'Relax' | 'Entertainment';
  tags: string[];
  description: string;
  shortDescription: string;
  heightRequirement: number | null;
  heightLimit?: number | null;
  thrillLevel: 'Beginner' | 'Intermediate' | 'Expert';
  intensity: string;
  zone: string;
  maxVelocity: string | null;
  features: string[];
  healthAdvisory: string | null;
  nearbyFacilities: string[];
  isFeatured: boolean;
  fastPassAvailable: boolean;
  images: string[];
  waitTime: number;
  status: 'open' | 'closed' | 'maintenance';
}
