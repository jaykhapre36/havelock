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
      icon: '🌐',
      title: 'Website Information',
      items: [
        {
          heading: 'About This Website',
          body: 'www.havelockwaterpark.com ("Website") is owned and operated by The Havelock Waterpark and Resort. The information provided on this Website is merely to inform visitors about the present facilities, activities, and rules applicable at the park. This Website is an electronic record published in accordance with the Information Technology Act, 2000.'
        },
        {
          heading: 'Accuracy of Information',
          body: 'The Havelock Waterpark and Resort does not hold any liability for all information available on this Website. Certain information may, at times, be incorrect. The Havelock Waterpark and Resort does not provide any express or implicit guarantee as to its correctness and reserves the right, in its sole discretion, to modify information at any time for updating or maintenance purposes.'
        },
        {
          heading: 'Licence to Use',
          body: 'The Havelock Waterpark and Resort grants users a personal, non-exclusive, non-transferable and limited right to use this Website. Continued use of the Website following any posting of changes shall mean that the user expressly accepts and agrees to those changes. The Havelock Waterpark and Resort does not guarantee that the information on this Website complies with local legislation if the user has chosen to access it from outside India.'
        }
      ]
    },
    {
      id: 2,
      icon: '👤',
      title: 'User Responsibility',
      items: [
        {
          heading: 'Accuracy of Information Provided',
          body: 'The user agrees to provide information required by The Havelock Waterpark and Resort that is correct, accurate, current and complete, and in accordance with these Terms of Use.'
        },
        {
          heading: 'Confidentiality of Credentials',
          body: 'The user shall be solely and entirely responsible for maintaining the confidentiality of their User ID, Booking ID, and passwords, and for all activities that occur under their transaction ID. In the event The Havelock Waterpark and Resort has reasonable grounds to suspect that such information is untrue, inaccurate, or not in accordance with these Terms of Use, The Havelock Waterpark and Resort reserves the right to indefinitely suspend, terminate, or block access to the Website.'
        },
        {
          heading: 'Service Availability',
          body: 'The Havelock Waterpark and Resort does not guarantee that information and facilities available on the Website will be provided without interruption or errors, or that the server making the Website available is free from viruses or other harmful elements.'
        }
      ]
    },
    {
      id: 3,
      icon: '📧',
      title: 'Electronic Communication',
      items: [
        {
          heading: 'Communication Channels',
          body: 'The Havelock Waterpark and Resort may communicate with users by email, SMS, WhatsApp, or by such other modes of communication — electronic or otherwise — as it deems fit. The Havelock Waterpark and Resort reserves the right to send promotional SMS, emails, and notifications to users about various offers and activities of the park or its business partners.'
        }
      ]
    },
    {
      id: 4,
      icon: '©️',
      title: 'Property Rights',
      items: [
        {
          heading: 'Intellectual Property',
          body: 'All information containing trademarks, copyrights, including text, interface, graphics, logos, designs, frames, drawings, sound, music, and expressions, is the property of The Havelock Waterpark and Resort. No disclosure shall be interpreted as granting the user a licence or right to use any of it. Any unauthorised use shall constitute an infringement under applicable laws.'
        },
        {
          heading: 'Prohibited Use of Content',
          body: 'No part of this Website and none of its content may be copied, reproduced, republished, uploaded, publicly displayed, posted, translated, encoded, distributed, or transmitted in any way — including mirroring to any other computer, server, or medium — for publication, distribution, or any commercial enterprise, without prior written consent from The Havelock Waterpark and Resort.'
        }
      ]
    },
    {
      id: 5,
      icon: '🔗',
      title: 'Other Businesses',
      items: [
        {
          heading: 'Third-Party Links & Services',
          body: 'The Havelock Waterpark and Resort disclaims all liability for the actions, information, services, and products on websites linked to or from this Website using APIs or otherwise. The Website may provide links to third-party websites for information purposes only. The Havelock Waterpark and Resort does not endorse, in any way, any third-party website or content thereof, and assumes no responsibility for examining or evaluating the products and services offered by them.'
        }
      ]
    },
    {
      id: 6,
      icon: '⚠️',
      title: 'Disclaimer of Warranties & Liability',
      items: [
        {
          heading: 'No Warranty',
          body: 'To the fullest extent permissible pursuant to applicable law, The Havelock Waterpark and Resort disclaims all warranties, express or implied, including but not limited to merchantability and fitness for a particular purpose. The Havelock Waterpark and Resort does not warrant that the website will be uninterrupted or error-free, that defects will be corrected, or that the server is free from viruses or other harmful components.'
        },
        {
          heading: 'Use at Own Risk',
          body: 'Use of this Website is entirely at the user\'s own risk. The Havelock Waterpark and Resort does not warrant or make any representations regarding the use or results of the use of materials on this Website in terms of their correctness, accuracy, reliability, or otherwise.'
        }
      ]
    },
    {
      id: 7,
      icon: '💳',
      title: 'Payment',
      items: [
        {
          heading: 'Payment Responsibility',
          body: 'While utilising any of the payment methods available on the Website, The Havelock Waterpark and Resort does not assume responsibility or liability whatsoever in respect of any loss or damage arising directly or indirectly due to: exceeding the present limit mutually agreed by the user and their bank; lack of authorisation for any transaction; decline of a transaction for any reason; or any payment issues arising out of the transaction.'
        },
        {
          heading: 'Currency',
          body: 'All payments made against purchases or services on the Website shall only be accepted in Indian Rupees (₹).'
        }
      ]
    },
    {
      id: 8,
      icon: '🔄',
      title: 'Cancellations & Refunds',
      items: [
        {
          heading: 'No Cancellation Policy',
          body: 'Cancellations, refunds, alterations, or changes in visit date of entry tickets are not permitted under any circumstances.'
        },
        {
          heading: 'Payment Deduction Without Confirmation',
          body: 'In case of payment deduction from a bank account and no confirmation SMS or Email has been received, please inform us within 7 days; otherwise no claim will be processed. In all cases of refund approval by higher authorities, after a refund has been processed from our end it will take 7–10 working days to reflect in the customer\'s bank account.'
        },
        {
          heading: 'Suspended or Blocked Users',
          body: 'A user who has been suspended or blocked may not register or attempt to re-register or use this Website in any manner whatsoever until such time that their access is reinstated by The Havelock Waterpark and Resort.'
        }
      ]
    },
    {
      id: 9,
      icon: '🛡️',
      title: 'Indemnity',
      items: [
        {
          heading: 'User Indemnification',
          body: 'The user shall indemnify and hold harmless The Havelock Waterpark and Resort, its owners, licensees, affiliates, subsidiaries, group companies (as applicable) and their respective officers, directors, agents, and employees from any claim, demand, or action — including reasonable attorneys\' fees — made by any third party or penalty imposed due to or arising out of breach of these Terms of Use, or violation of any law, rules, regulations, or the rights of a third party.'
        }
      ]
    },
    {
      id: 10,
      icon: '📋',
      title: 'Copyright Complaint',
      items: [
        {
          heading: 'Reporting Infringement',
          body: 'The Havelock Waterpark and Resort values others\' intellectual property. In case the user finds that their work has been copied in a way that constitutes copyright infringement, they may write to us at info@havelockwaterpark.com.'
        }
      ]
    },
    {
      id: 11,
      icon: '⚖️',
      title: 'Applicable Law',
      items: [
        {
          heading: 'Governing Law',
          body: 'This agreement shall be governed by and interpreted and construed in accordance with the laws of India. Any disputes arising out of or in connection with the use of this Website shall be submitted to the exclusive jurisdiction of the courts at Mehsana, Gujarat.'
        },
        {
          heading: 'Misuse & Cyber Cell',
          body: 'The Havelock Waterpark and Resort shall take appropriate action through the Cyber Cell Department in case of any person found passing wrong or defamatory information about The Havelock Waterpark and Resort on this Website or any social media platform, or causing any direct or indirect moral damage to the park or its operations.'
        }
      ]
    },
    {
      id: 12,
      icon: '📉',
      title: 'Limitation of Liability',
      items: [
        {
          heading: 'Exclusion of Consequential Damages',
          body: 'To the fullest extent permitted by applicable law, The Havelock Waterpark and Resort excludes all liability for any direct, indirect, incidental, special or consequential damages — including damages for loss of profits, goodwill, use, data, or other intangible losses — resulting from: (1) use or inability to use this Website; (2) cost of procurement of substitute goods or services resulting from transactions entered into through this Website; or (3) unauthorised access or alteration of user transmissions or data.'
        },
        {
          heading: 'Sole Remedy',
          body: 'If the user is dissatisfied with the use of this Website or the materials available on it or with these Terms of Use, the user\'s sole and exclusive remedy is to discontinue using the Website. The Havelock Waterpark and Resort\'s total liability is limited to: (1) the supply of the services or products provided herein and/or (2) payment of the cost towards services or products supplied.'
        }
      ]
    }
  ];
}
