import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TicketGroup, Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  private mockPath = environment.mockDataPath;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TicketGroup> {
    return this.http.get<TicketGroup>(`${this.mockPath}/tickets.json`);
  }

  getByDayType(dayType: 'weekday' | 'sunday'): Observable<Ticket[]> {
    return this.getAll().pipe(
      map(tickets => tickets[dayType])
    );
  }
}
