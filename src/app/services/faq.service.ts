import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FaqCategory } from '../models/faq.model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  private mockPath = environment.mockDataPath;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FaqCategory[]> {
    return this.http.get<FaqCategory[]>(`${this.mockPath}/faqs.json`);
  }

  getByCategory(categoryId: number): Observable<FaqCategory | undefined> {
    return this.getAll().pipe(
      map(categories => categories.find(c => c.id === categoryId))
    );
  }

  search(query: string): Observable<FaqCategory[]> {
    return this.getAll().pipe(
      map(categories =>
        categories.map(cat => ({
          ...cat,
          questions: cat.questions.filter(
            q =>
              q.question.toLowerCase().includes(query.toLowerCase()) ||
              q.answer.toLowerCase().includes(query.toLowerCase())
          )
        })).filter(cat => cat.questions.length > 0)
      )
    );
  }
}
