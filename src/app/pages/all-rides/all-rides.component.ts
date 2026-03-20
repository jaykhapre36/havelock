import { Component, OnInit } from '@angular/core';
import { AttractionsService } from '../../services/attractions.service';
import { Attraction } from '../../models/attraction.model';

type RideCategory = 'All' | 'Thrill' | 'Family' | 'Kids';
type SortOption   = 'popularity' | 'name' | 'height';

@Component({
  standalone: false,
  selector: 'app-all-rides',
  templateUrl: './all-rides.component.html',
  styleUrls: ['./all-rides.component.scss']
})
export class AllRidesComponent implements OnInit {
  allRides:      Attraction[] = [];
  filteredRides: Attraction[] = [];
  loading = true;

  searchQuery     = '';
  activeCategory: RideCategory = 'All';
  sortBy: SortOption = 'popularity';

  rideCategories: RideCategory[] = ['All', 'Thrill', 'Family', 'Kids'];

  private readonly RIDE_CATEGORIES = ['Thrill', 'Family', 'Kids'];

  constructor(private attractionsService: AttractionsService) {}

  ngOnInit(): void {
    this.attractionsService.getAll().subscribe((data: Attraction[]) => {
      this.allRides = data.filter(a => this.RIDE_CATEGORIES.includes(a.category));
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    let result = [...this.allRides];
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
    this.filteredRides = result;
  }

  setCategory(cat: RideCategory): void { this.activeCategory = cat; this.applyFilters(); }
  onSearch(): void { this.applyFilters(); }
  onSort(): void   { this.applyFilters(); }

  getCategoryClass(cat: string): string { return cat.toLowerCase().replace(/\s+/g, '-'); }

  getGradient(cat: string): string {
    const map: Record<string, string> = {
      Thrill: 'linear-gradient(135deg,#c0392b,#e74c3c)',
      Family: 'linear-gradient(135deg,#1565c0,#00B4D8)',
      Kids:   'linear-gradient(135deg,#f39c12,#f1c40f)'
    };
    return map[cat] ?? 'linear-gradient(135deg,#0077A8,#00B4D8)';
  }
}
