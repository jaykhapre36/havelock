import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Attraction } from '../models/attraction.model';

@Injectable({
  providedIn: 'root'
})
export class AttractionsService {

  private mockPath = environment.mockDataPath;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Attraction[]> {
    return this.http.get<Attraction[]>(`${this.mockPath}/attractions.json`);
  }

  getById(id: number): Observable<Attraction | undefined> {
    return this.getAll().pipe(
      map(attractions => attractions.find(a => a.id === id))
    );
  }

  getBySlug(slug: string): Observable<Attraction | undefined> {
    return this.getAll().pipe(
      map(attractions => attractions.find(a => a.slug === slug))
    );
  }

  getFeatured(): Observable<Attraction[]> {
    return this.getAll().pipe(
      map(attractions => attractions.filter(a => a.isFeatured))
    );
  }

  getByCategory(category: string): Observable<Attraction[]> {
    return this.getAll().pipe(
      map(attractions =>
        category === 'All' ? attractions : attractions.filter(a => a.category === category)
      )
    );
  }

  getRelated(currentId: number, zone: string): Observable<Attraction[]> {
    return this.getAll().pipe(
      map(attractions => attractions.filter(a => a.id !== currentId).slice(0, 4))
    );
  }
}
