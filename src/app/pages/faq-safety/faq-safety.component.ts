import { Component, OnInit } from '@angular/core';
import { FaqService } from '../../services/faq.service';
import { FaqCategory } from '../../models/faq.model';

@Component({
  standalone: false,
  selector: 'app-faq-safety',
  templateUrl: './faq-safety.component.html',
  styleUrls: ['./faq-safety.component.scss']
})
export class FaqSafetyComponent implements OnInit {

  categories: FaqCategory[] = [];
  loading = true;
  openFaqId: number | null = null;
  searchQuery = '';
  filteredCategories: FaqCategory[] = [];

  safetyHighlights = [
    { icon: 'height',    title: 'Ride Restrictions',  desc: 'Check height & age requirements' },
    { icon: 'staff',     title: 'Staff Guidance',      desc: 'Follow lifeguard instructions'   },
    { icon: 'supervise', title: 'Supervision',         desc: 'Adult supervision for kids'      },
    { icon: 'swim',      title: 'Swimwear',            desc: 'Proper nylon/lycra required'     }
  ];

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.faqService.getAll().subscribe(data => {
      this.categories = data;
      this.filteredCategories = data;
      this.loading = false;
    });
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) { this.filteredCategories = this.categories; return; }
    this.filteredCategories = this.categories
      .map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          qn => qn.question.toLowerCase().includes(q) || qn.answer.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.questions.length > 0);
  }

  toggleFaq(id: number): void {
    this.openFaqId = this.openFaqId === id ? null : id;
  }

  getCategoryIcon(icon: string): string {
    const map: Record<string, string> = {
      ticket:  '🎟️', 'water-drop': '💧', people: '👥',
      shield:  '🛡️', refund: '↩️'
    };
    return map[icon] ?? '❓';
  }
}
