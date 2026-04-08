import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreateWorkFromHomeRequest {
  employeeID: number;
  employeeName: string;
  fromDate: string;      // yyyy-MM-dd
  toDate: string;
  requestType: string;  // Work from Home / Remote Work
  reason: string;
  documentPath?: string;
  managerID: number;
  companyID: number;
  regionID?: number;
  userId: number;
   hrEmail?: string; 
}
export interface UpdateWorkFromHomeRequest {
  wfhRequestID: number;
  status: 'Approved' | 'Rejected';
  managerRemarks?: string;
  managerID: number;
  companyID: number;
  regionID?: number;
}
export interface BulkApproveRejectWorkFromHome {
  wfhRequestIDs: number[];
  status: 'Approved' | 'Rejected';
  managerRemarks?: string;
  managerID: number;
  companyID: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
private baseUrl = `${environment.apiUrl}/attendance`;
  constructor(private http: HttpClient) { }
  // 🔹 CREATE WFH / REMOTE REQUEST
  createRequest(payload: CreateWorkFromHomeRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/createWorkfromhome`, payload);
  }

  // 🔹 EMPLOYEE – MY REQUESTS
  getMyRequests(
    employeeId: number,
    companyId: number,
    regionId?: number
  ): Observable<any[]> {

    let params = new HttpParams()
      .set('employeeId', employeeId)
      .set('companyId', companyId);

    if (regionId) {
      params = params.set('regionId', regionId);
    }

    return this.http.get<any[]>(`${this.baseUrl}/my-requests`, {
      params,
      withCredentials: true
    });
  }

  // 🔹 MANAGER – PENDING APPROVALS
  getPendingApprovals(
    companyId: number,
    managerId: number,
    regionId?: number
  ): Observable<any[]> {

    let params = new HttpParams()
      .set('companyId', companyId)
      .set('managerId', managerId);

    if (regionId) {
      params = params.set('regionId', regionId);
    }

    return this.http.get<any[]>(`${this.baseUrl}/pending-approvals`, {
      params,
      withCredentials: true
    });
  }

  // 🔹 SINGLE APPROVE / REJECT
  updateStatus(payload: UpdateWorkFromHomeRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/update-status`, payload, {
      withCredentials: true
    });
  }

  // 🔥 BULK APPROVE / REJECT
  bulkApproveReject(payload: BulkApproveRejectWorkFromHome): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk-approve-reject`, payload, {
      withCredentials: true
    });
  }
}
