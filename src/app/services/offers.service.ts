import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Offer } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  private mockPath = environment.mockDataPath;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.mockPath}/offers.json`);
  }

  getActive(): Observable<Offer[]> {
    return this.getAll().pipe(
      map(offers => offers.filter(o => o.isActive))
    );
  }

  validatePromoCode(code: string): Observable<Offer | undefined> {
    return this.getActive().pipe(
      map(offers => offers.find(o => o.promoCode.toLowerCase() === code.toLowerCase()))
    );
  }
}
