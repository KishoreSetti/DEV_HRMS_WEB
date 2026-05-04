import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BirthdayEmployee } from '../../../layout/models/birthday.model';
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BirthdayService {
private apiUrl = environment.apiUrl + '/Birthday'; 

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<BirthdayEmployee[]>(`${this.apiUrl}/GetAllBirthday`);
  }

  getToday() {
    return this.http.get<BirthdayEmployee[]>(`${this.apiUrl}/GetTodayBirthday`);
  }

  getById(id: number) {
    return this.http.get<BirthdayEmployee>(`${this.apiUrl}/GetTodayBirthdayById/${id}`);
  }

  create(data: BirthdayEmployee) {
    return this.http.post(`${this.apiUrl}/CreateBirthday`, data);
  }

  update(data: BirthdayEmployee) {
    return this.http.put(`${this.apiUrl}/UpdateBirthday`, data);
  }

  delete(id: number) {
    return this.http.post(`${this.apiUrl}/DeleteBirthday/${id}`, {});
  }
}
