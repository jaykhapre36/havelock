import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ContactForm } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) {}

  submitForm(form: ContactForm): Observable<{ success: boolean; message: string }> {
    // Mock submission — replace with real API call later
    console.log('Contact form submitted:', form);
    return of({ success: true, message: 'Your message has been sent. We will get back to you shortly.' }).pipe(delay(1000));
  }
}
