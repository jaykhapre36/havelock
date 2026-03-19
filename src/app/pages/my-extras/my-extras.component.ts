import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ExtrasService, AllocationsData } from '../../services/extras.service';

@Component({
  standalone: false,
  selector: 'app-my-extras',
  templateUrl: './my-extras.component.html',
  styleUrls: ['./my-extras.component.scss']
})
export class MyExtrasComponent implements OnInit {

  loading = true;
  error = '';
  activeTab: 'costumes' | 'lockers' = 'costumes';

  costumes: AllocationsData = { total: 0, allocations: [] };
  lockers:  AllocationsData = { total: 0, allocations: [] };

  constructor(private extrasService: ExtrasService) {}

  ngOnInit(): void {
    forkJoin({
      costumes: this.extrasService.getCostumes(),
      lockers:  this.extrasService.getLockers()
    }).subscribe({
      next: ({ costumes, lockers }) => {
        this.costumes = costumes.data;
        this.lockers  = lockers.data;
        this.loading  = false;
      },
      error: () => {
        this.error   = 'Failed to load data. Please try again.';
        this.loading = false;
      }
    });
  }
}
