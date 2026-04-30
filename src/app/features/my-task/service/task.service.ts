import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
    private baseUrl = environment.apiUrl; // 🔹 Change this to your actual API URL
  
    constructor(private http: HttpClient) {}
getTasks(userId: number) {
  return this.http.get(`${this.baseUrl}/Task/tasks?userId=${userId}`);
}

createTask(formData: FormData) {
  return this.http.post(`${this.baseUrl}/Task/CreateTask`, formData);
}

updateTask(data: any) {
  return this.http.post(`${this.baseUrl}/Task/UpdateTask`, data);
}

deleteTask(id: number) {
  return this.http.post(`${this.baseUrl}/Task/DeleteTask?id=${id}`, {});
}
getMyTasks(userId: number) {
  return this.http.get(`${this.baseUrl}/Task/mytasks?userId=${userId}`);
}

}
