import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'Opening Hours',  route: '/contact'      },
    { label: 'Attractions',    route: '/attractions'   },
    { label: 'Ticket Prices',  route: '/tickets'       },
    { label: 'Map & Location', route: '/map'           },
    { label: 'Availability',   route: '/availability'  }
  ];

  supportLinks = [
    { label: 'Contact Us',     route: '/contact'    },
    { label: 'FAQ & Safety',   route: '/faq-safety' },
    { label: 'Privacy Policy', route: '/contact'    },
    { label: 'Terms of Service', route: '/contact'  }
  ];
}
