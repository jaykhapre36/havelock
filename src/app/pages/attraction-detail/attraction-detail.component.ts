import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttractionsService } from '../../services/attractions.service';
import { Attraction } from '../../models/attraction.model';

@Component({
  standalone: false,
  selector: 'app-attraction-detail',
  templateUrl: './attraction-detail.component.html',
  styleUrls: ['./attraction-detail.component.scss']
})
export class AttractionDetailComponent implements OnInit {
  attraction: Attraction | null = null;
  relatedAttractions: Attraction[] = [];
  loading = true;
  notFound = false;
  activeTab: 'about' | 'expect' | 'bestfor' = 'about';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attractionsService: AttractionsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loading = true;
      this.notFound = false;
      this.attractionsService.getById(id).subscribe(data => {
        if (!data) { this.notFound = true; this.loading = false; return; }
        this.attraction = data;
        this.loading = false;
        this.attractionsService.getRelated(id, data.zone).subscribe(rel => {
          this.relatedAttractions = rel;
        });
      });
    });
  }

  setTab(tab: 'about' | 'expect' | 'bestfor'): void { this.activeTab = tab; }

  getThrillWidth(level: string): string {
    const map: Record<string, string> = { Beginner: '33%', Intermediate: '66%', Expert: '100%' };
    return map[level] ?? '50%';
  }

  getThrillColor(level: string): string {
    const map: Record<string, string> = { Beginner: '#27AE60', Intermediate: '#E67E22', Expert: '#C0392B' };
    return map[level] ?? '#7F8C8D';
  }

  getGradient(cat: string): string {
    const map: Record<string, string> = {
      Thrill: 'linear-gradient(135deg,#003d5c,#c0392b)',
      Family: 'linear-gradient(135deg,#003d5c,#00B4D8)',
      Kids:   'linear-gradient(135deg,#1a5c00,#f1c40f)',
      Relax:  'linear-gradient(135deg,#003d5c,#27ae60)',
      Entertainment: 'linear-gradient(135deg,#1a0030,#9b59b6)'
    };
    return map[cat ?? ''] ?? 'linear-gradient(135deg,#003d5c,#00B4D8)';
  }

  getCategoryClass(cat: string): string { return cat.toLowerCase().replace(/\s+/g, '-'); }

  goBack(): void { this.router.navigate(['/attractions']); }

  bookTickets(): void { this.router.navigate(['/tickets']); }
}
