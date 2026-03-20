import { Component, OnInit } from '@angular/core';
import { AttractionsService } from '../../services/attractions.service';
import { Attraction } from '../../models/attraction.model';

type SortOption = 'popularity' | 'name' | 'height';
type Category   = 'All' | 'Thrill' | 'Family' | 'Kids' | 'Relax' | 'Entertainment';

@Component({
  standalone: false,
  selector: 'app-attractions',
  templateUrl: './attractions.component.html',
  styleUrls: ['./attractions.component.scss']
})
export class AttractionsComponent implements OnInit {
  allAttractions:      Attraction[] = [];
  filteredAttractions: Attraction[] = [];
  loading = true;

  searchQuery    = '';
  activeCategory: Category    = 'All';
  sortBy: SortOption = 'popularity';

  categories: Category[] = ['All', 'Thrill', 'Family', 'Kids', 'Relax', 'Entertainment'];

  constructor(
    private attractionsService: AttractionsService
  ) {}

  ngOnInit(): void {
    this.attractionsService.getAll().subscribe((data: Attraction[]) => {
      this.allAttractions = data;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    let result = [...this.allAttractions];
    if (this.activeCategory !== 'All') {
      result = result.filter(a => a.category === this.activeCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    if (this.sortBy === 'name')   result.sort((a, b) => a.name.localeCompare(b.name));
    if (this.sortBy === 'height') result.sort((a, b) => (b.heightRequirement ?? 0) - (a.heightRequirement ?? 0));

    // When showing All with default sort: non-rides (Entertainment, Relax) first, rides below
    if (this.activeCategory === 'All' && this.sortBy === 'popularity') {
      const order: Record<string, number> = { Entertainment: 0, Relax: 1, Thrill: 2, Family: 3, Kids: 4 };
      result.sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9));
    }

    this.filteredAttractions = result;
  }

  setCategory(cat: Category): void { this.activeCategory = cat; this.applyFilters(); }
  onSearch(): void  { this.applyFilters(); }
  onSort(): void    { this.applyFilters(); }

  getCategoryClass(cat: string): string { return cat.toLowerCase().replace(/\s+/g, '-'); }

  getGradient(cat: string): string {
    const map: Record<string, string> = {
      Thrill: 'linear-gradient(135deg,#c0392b,#e74c3c)',
      Family: 'linear-gradient(135deg,#1565c0,#00B4D8)',
      Kids:   'linear-gradient(135deg,#f39c12,#f1c40f)',
      Relax:  'linear-gradient(135deg,#27ae60,#2ecc71)',
      Entertainment: 'linear-gradient(135deg,#8e44ad,#9b59b6)'
    };
    return map[cat] ?? 'linear-gradient(135deg,#0077A8,#00B4D8)';
  }
}
