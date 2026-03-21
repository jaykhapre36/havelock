import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  lastUpdated = 'March 2026';

  sections = [
    {
      id: 1,
      icon: '🎟️',
      title: 'Booking & Entry',
      items: [
        {
          heading: 'Ticket Validity',
          body: 'Tickets are valid only for the date and time slot selected during booking. Entry will not be permitted outside the booked slot.'
        },
        {
          heading: 'Identity Proof',
          body: 'A valid Government-issued ID (Aadhaar Card, Driving License, Passport, etc.) matching the lead guest\'s name must be presented at the entry gate.'
        },
        {
          heading: 'Rights of Admission',
          body: 'The management reserves the right to refuse entry to any guest found to be intoxicated, unwell, or in violation of park rules. No refund will be issued in such cases.'
        }
      ]
    },
    {
      id: 2,
      icon: '💳',
      title: 'Cashless Wallet & Payments',
      items: [
        {
          heading: 'Closed-Loop System',
          body: 'Havelock Water Park operates on a mandatory cashless basis. All internal purchases — including food, locker rentals, and equipment — must be made via the digital wallet or wristband issued at entry.'
        },
        {
          heading: 'Refund Policy',
          body: 'Unused wallet balances are refundable at the exit counter before you leave the park. Please ensure you claim any remaining balance before departure, as balances cannot be recovered after exit.'
        },
        {
          heading: 'Loss of Wristband',
          body: 'If your RFID wristband is lost or damaged, the remaining balance may not be recoverable. A replacement wristband fee of ₹200 will apply. Please report loss immediately to park staff.'
        }
      ]
    },
    {
      id: 3,
      icon: '🛡️',
      title: 'Safety & Health',
      items: [
        {
          heading: 'Physical Condition',
          body: 'Guests with heart conditions, back or neck injuries, high blood pressure, epilepsy, or who are pregnant are strongly advised not to use high-thrill slides or rides. Please consult your physician if in doubt.'
        },
        {
          heading: 'Height & Weight Restrictions',
          body: 'For the safety of all guests, certain rides and slides have strict height and weight requirements. Decisions made by park staff regarding eligibility are final and non-negotiable.'
        },
        {
          heading: 'Supervision of Children',
          body: 'Children under 12 years of age must be accompanied and supervised by a responsible adult at all times within the park, including on rides and in pool areas.'
        }
      ]
    },
    {
      id: 4,
      icon: '👕',
      title: 'Clothing & Hygiene',
      items: [
        {
          heading: 'Swimwear Policy',
          body: 'Only nylon or synthetic swimwear is permitted on all slides and in pool areas. Cotton clothing including T-shirts, jeans, and shorts is strictly prohibited for safety and water filtration reasons.'
        },
        {
          heading: 'Hygiene',
          body: 'All guests must shower before entering pools or water attractions. Persons with open wounds, bandages, infectious skin conditions, or communicable illnesses are not permitted in the water areas.'
        }
      ]
    },
    {
      id: 5,
      icon: '🚭',
      title: 'Alcohol & Smoking',
      items: [
        {
          heading: 'Alcohol',
          body: 'The consumption or possession of alcohol is strictly prohibited anywhere within the park premises. Guests found violating this rule will be asked to leave without a refund.'
        },
        {
          heading: 'Smoking',
          body: 'Smoking, including e-cigarettes and vapes, is not permitted within the park. Designated smoking zones, if available, will be clearly marked near the exit areas.'
        }
      ]
    },
    {
      id: 6,
      icon: '⚖️',
      title: 'Liability & Responsibility',
      items: [
        {
          heading: 'Assumption of Risk',
          body: 'By entering the park, guests voluntarily acknowledge and assume all risks associated with water park activities. The management, staff, and owners are not liable for any injuries, accidents, or medical emergencies arising from participation in park activities.'
        },
        {
          heading: 'Personal Belongings',
          body: 'Havelock Water Park is not responsible for the loss, theft, or damage of any personal items brought into the park. Guests are strongly encouraged to use the locker facilities available on-site.'
        },
        {
          heading: 'Photography & CCTV',
          body: 'The park is monitored by CCTV cameras for the safety and security of all guests. Personal photography is permitted in general areas; however, photography on rides or in changing areas is strictly prohibited.'
        }
      ]
    }
  ];
}
