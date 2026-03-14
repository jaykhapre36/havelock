import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ParkInfo } from '../models/park-info.model';

@Injectable({
  providedIn: 'root'
})
export class ParkInfoService {

  private mockPath = environment.mockDataPath;

  constructor(private http: HttpClient) {}

  getParkInfo(): Observable<ParkInfo> {
    return this.http.get<ParkInfo>(`${this.mockPath}/park-info.json`);
  }
}
