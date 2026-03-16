export interface Ticket {
  id: number;
  type: string;
  label: string;
  badge: string | null;
  subtitle: string;
  price: number;
  unit: string;
  features: string[];
  popular: boolean;
  ctaLabel: string;
  ctaType: 'primary' | 'outline';
}

export interface TicketGroup {
  weekday: Ticket[];
  sunday: Ticket[];
}
