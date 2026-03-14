export interface Review {
  id: number;
  name: string;
  rating: number;
  review: string;
  date: string;
  visitType: 'family' | 'corporate' | 'solo' | 'group';
}
