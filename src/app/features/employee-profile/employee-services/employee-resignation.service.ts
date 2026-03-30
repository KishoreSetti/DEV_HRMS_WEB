import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeResignation } from '../employee-models/EmployeeResignation';
import { environment } from '../../../../environments/environment';
import { env } from 'process';
export interface UserReadDto {
    userId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  status: string;
  companyID: number;
  regionID: number;
}

export interface ShiftMasterDto {
  shiftID: number;
  shiftName: string;
  shiftStartTime?: string; // e.g. "09:00:00" or ISO time string
  shiftEndTime?: string;
  graceTime?: number;
  isActive?: boolean;
  companyID?: number;
  regionID?: number;
}

export interface ShiftAllocationDto {
  shiftAllocationId?: number;
  userID: number;
  employeeCode: string;
  fullName: string;
  companyID?: number;
  regionID?: number;
  shiftID: number;
  shiftName?: string;
  startDate: string; // "yyyy-MM-dd" - keep ISO for binding
  endDate?: string | null;
  isActive: boolean;
  createdBy?: number;
  createdDate?: string;
  modifiedBy?: number;
  modifiedDate?: string;
}
export interface EmployeeShiftDto {
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
}
export interface Reference {
  referenceId?: number;
  name: string;
  title: string;
  companyName: string;
  email: string;
  mobileNumber: string;
}
@Injectable({
  providedIn: 'root'
})
export class EmployeeResignationService {
private apiUrl = environment.apiUrl + '/Employee';
private apiadminUrl = environment.apiUrl + '/UserManagement';
  constructor(private http: HttpClient) { }
// GET all resignations
 

  // GET resignation by ID
  getById(id: number): Observable<EmployeeResignation> {
    return this.http.get<EmployeeResignation>(
      `${this.apiUrl}/GetResignationById?id=${id}`
    );
  }

  // CREATE resignation
  // ✅ CREATE RESIGNATION
  create(data: EmployeeResignation): Observable<EmployeeResignation> {
    return this.http.post<EmployeeResignation>(
      `${this.apiUrl}/SaveResignation`,
      data
    );
  }

// ✅ UPDATE RESIGNATION
  update(id: number, data: EmployeeResignation): Observable<EmployeeResignation> {
    return this.http.post<EmployeeResignation>(
      `${this.apiUrl}/UpdateResignation/${id}`,
      data
    );
  }

   // ✅ DELETE RESIGNATION
  delete(
    id: number,
    companyId: number,
    regionId: number,
    roleId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/DeleteResignation/${id}`,
      {
        params: {
          companyId,
          regionId,
          roleId
        }
      }
    );
  }
  // 🔹 GET PERSONAL DETAILS BY USER ID
  GetByUserIdempProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetByUserIdempProfile/${userId}`);
  }
  GetDigitalCard(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetDigitalCard/${userId}`);
  }
  GetempProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetempProfile/${userId}`);
  }
  createempProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddPersonalEmailAsync`, formData);
  }

  updateempProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateempPersonalAsync`, formData);
  }
  getProfilePicture(userId: number): Observable<string> {
  return this.http.get(
    `${environment.apiUrl}/Employee/GetProfilePicture/${userId}`,
    { responseType: 'text' }
  );
}

  getAllempProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getByIdempProfile(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  deleteempProfile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchempProfile(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, filter);
  }

  Getempfamily(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getByUserIdempFamilyAsync/${userId}`);
  }
  createempfamily(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/addempFamilyAsync`, formData);
  }

  updateempfamily(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateempFamilyAsync`, formData);
  }

  getAllempfamily(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getByIdempfamily(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  deleteempfamily(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteempFamilyAsync/${id}`);
  }

  searchempfamily(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/searchempfamily`, filter);
  }

   Getempgender(userId: number,companyId:number,regionId:number): Observable<any> {
    return this.http.get<any>(`${this.apiadminUrl}/GetAllgenderByUserAsync`,{
      params: {
        userId: userId,
        companyId: companyId,
        regionId: regionId
      }
    });
  }
   GetAllRelationShip(userId: number,companyId:number,regionId:number): Observable<any> {
    return this.http.get<any>(`${this.apiadminUrl}/GetAllRelationShip`,{
      params: {
        userId: userId,
        companyId: companyId,
        regionId: regionId
      }
    });
  }

   getLeaveTypes(companyId: number,regionId: number): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/masterData/GetCRLeaveTypesAsync`,{
    params: {
      companyId: companyId,
      regionId: regionId
    }
  });
}


getReportingManager(userId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/GetReportingManager/${userId}`);
}
submitLeave(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/SubmitLeave`, formData);
  }

  // ✅ Get My Leave List
  getMyLeaves(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetMyLeaves/${userId}`);
  }

  getLeavesForManager(managerId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/GetLeavesForManager/${managerId}`);
}

approveLeave(leaveId: number) {
  return this.http.post(`${this.apiUrl}/ApproveByManager/${leaveId}`, {});
}

rejectLeave(leaveId: number) {
  return this.http.post(`${this.apiUrl}/RejectByManager/${leaveId}`, {});
}

bulkApprove(ids: number[]) {
  return this.http.post(`${this.apiUrl}/BulkApprove`, ids);
}

bulkReject(ids: number[]) {
  return this.http.post(`${this.apiUrl}/BulkReject`, ids);
}

// get user leaves (employee view)
getUserLeaves(userId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/GetUserLeaves/${userId}`);
}

// get manager leaves (leaves of employees assigned to manager)
getManagerLeaves(managerId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/GetManagerLeaves/${managerId}`);
}

// -------------------------------
  // SHIFT MASTER
  // -------------------------------
  getAllShifts(): Observable<ShiftMasterDto[]> {
    return this.http.get<ShiftMasterDto[]>(`${environment.apiUrl}/Attendance/GetAllShifts`);
  }

  getShiftById(shiftId: number): Observable<ShiftMasterDto> {
    return this.http.get<ShiftMasterDto>(`${environment.apiUrl}/Attendance/GetShiftById/${shiftId}`);
  }

  addShift(model: ShiftMasterDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Attendance/AddShift`, model);
  }

  updateShift(model: ShiftMasterDto): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Attendance/UpdateShift`, model);
  }

  deleteShift(shiftId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/Attendance/DeleteShift/${shiftId}`);
  }

  activateShift(shiftId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Attendance/ActivateShift/${shiftId}`, {});
  }

  deactivateShift(shiftId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Attendance/DeactivateShift/${shiftId}`, {});
  }

  // -------------------------------
  // SHIFT ALLOCATION
  // -------------------------------
getAllAllocations(userId: number): Observable<ShiftAllocationDto[]> {
    debugger;
    return this.http.get<ShiftAllocationDto[]>(`${environment.apiUrl}/attendance/GetAllAllocations/${userId}`);
  }

  getAllocationById(id: number): Observable<ShiftAllocationDto> {
    return this.http.get<ShiftAllocationDto>(`${this.apiUrl}/UserManagement/GetAllocationById/${id}`);
  }

  allocateShift(model: ShiftAllocationDto): Observable<any> {
    
    return this.http.post(`${environment.apiUrl}/attendance/AllocateShift`, model);
  }

  updateAllocation(model: ShiftAllocationDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/attendance/UpdateAllocation`, model);
  }

  // deleteAllocation(id: number): Observable<any> {
  //   return this.http.delete(`${environment.apiUrl}/attendance/DeleteAllocation/${id}`);
  // }
  deleteAllocation(id: number): Observable<any> {
  return this.http.post(`${environment.apiUrl}/attendance/DeleteAllocation/${id}`, {});
}
  getShiftallocationName(id: any): Observable<EmployeeShiftDto> {
    return this.http.get<EmployeeShiftDto>(`${environment.apiUrl}/attendance/ShiftallocationName/${id}`);
  }
  getShiftallocationNameForClockInOut(employeeCode: string, companyId: number, regionId: number): Observable<EmployeeShiftDto> {
  return this.http.get<EmployeeShiftDto>(
    `${environment.apiUrl}/attendance/getShiftallocationNameForClockInOut/${employeeCode}/${companyId}/${regionId}`
  );
}
    // 🔹 GET ALL
  getClockInOutAll(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/attendance/GetclockinoutAll`);
  }

  // 🔹 GET BY ID
  getClockInOutById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/attendance/GetclockinoutById/${id}`);
  }

  // 🔹 GET TODAY BY EMPLOYEE
  getTodayByEmployee(
    employeeCode: any,
    companyId: number,
    regionId: number
  ): Observable<any[]> {

    const params = new HttpParams()
      .set('employeeCode', employeeCode)
      .set('companyId', companyId)
      .set('regionId', regionId);

    return this.http.get<any[]>(
      `${environment.apiUrl}/attendance/GetTodayByEmployee`,
      { params }
    );
  }

  // 🔹 ADD CLOCK IN / CLOCK OUT
  addClockInOut(payload: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/attendance/AddclockinOut`,
      payload
    );
  }

  // 🔹 DELETE (POST as per your API)
  deleteClockInOut(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.http.post<any>(
      `${environment.apiUrl}/attendance/DeleteClockinOut`,
      null,
      { params }
    );
  }

  // ➕ Add Reference
  addReference(reference: Reference): Observable<any> {
    return this.http.post<any>(environment.apiUrl + '/Employee/addempRefAsync', reference);
  }

  // 📄 Get All References
  getReferences(): Observable<Reference[]> {
    return this.http.get<Reference[]>(environment.apiUrl + '/Employee/getByUserIdempRefAsync/' + sessionStorage.getItem('UserId'));
  }

  // ✏️ Update Reference
  updateReference(reference: Reference): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Employee/updateempRefAsync`, reference);
  }

  // 🗑️ Delete Reference
  deleteReference(id: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Employee/deleteempRefAsync?id=${id}`,{});
  }

  // 🔍 Get Reference By Id (Optional)
  getReferenceById(id: number): Observable<Reference> {
    return this.http.get<Reference>(`${environment.apiUrl}/Employee/getByIdempRefAsync/${id}`);
  }


   // 📄 Get ALL emergency contacts (Admin use)
  getAllEmergencyContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/Employee/GetAllempEmerAsync`);
  }

  // 👤 Get emergency contacts by UserId
  getEmergencyContactsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/GetByUserIdempEmerAsync/${userId}`
    );
  }

  // 🔍 Get emergency contact by Id
  getEmergencyContactById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/GetByIdempEmerAsync/${id}`
    );
  }

  // ➕ Add emergency contact
  addEmergencyContact(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/AddempEmerAsync`,
      payload
    );
  }

  // ✏️ Update emergency contact
  updateEmergencyContact(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/UpdateempEmerAsync`,
      payload
    );
  }

  // 🗑️ Delete emergency contact
  deleteEmergencyContact(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/DeleteempEmerAsync?id=${id}`,{}
    );
  }
  // ✅ GET ALL RESIGNATIONS
  getAll(
    companyId: number,
    regionId: number,
    roleId: number
  ): Observable<EmployeeResignation[]> {
    return this.http.get<EmployeeResignation[]>(
      `${this.apiUrl}/GetResignations?companyId=${companyId}&regionId=${regionId}&roleId=${roleId}`
     ,
      {
        params: {
          companyId,
          regionId,
          roleId
        }
      });
    }
//     // ✅ GET RESIGNATIONS FOR REPORTING MANAGER
// getResignationsForManager(managerUserId: number): Observable<EmployeeResignation[]> {
//   return this.http.get<EmployeeResignation[]>(
//     `${this.apiUrl}/GetResignationsForManager`,
//     {
//       params: {
//         managerUserId
//       }
//     }
//   );
// }
getResignationsForManager(managerUserId: number): Observable<EmployeeResignation[]> {
  return this.http.get<EmployeeResignation[]>(
    `${this.apiUrl}/GetResignationsForManager`,
    {
      params: {
        managerUserId: managerUserId.toString() // ✅ FIX (avoids 400 error)
      }
    }
  );
}


  // ✅ MANAGER APPROVE / REJECT
  updateStatus(payload: {
    resignationId: number;
    status: string;
    managerReason?: string;
    isManagerApprove: boolean;
      hrReason?: string;      // ✅ add this
  isHRApprove?: boolean;  // ✅ add this
  isHRReject?: boolean;   // ✅ add this

    isManagerReject: boolean;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/UpdateResignationStatus`,
      payload
    );
  }

  // ================= HR (optional la
// ✅ GET RESIGNATIONS FOR HR (FIXED)
getResignationsForHR(): Observable<EmployeeResignation[]> {
  const companyId = Number(sessionStorage.getItem('CompanyId'));
  const regionId = Number(sessionStorage.getItem('RegionId'));

  return this.http.get<EmployeeResignation[]>(
    `${this.apiUrl}/GetResignationsForHR`,
    {
      params: { companyId, regionId }
    }
  );
}
getResignationMaster(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.apiUrl}/MasterData/GetResignations?companyId=${companyId}&regionId=${regionId}`
  );
}
getHolidays(companyId: number, regionId: number) {
    return this.http.get(`${this.apiUrl}/Getholidaybycompanyidandregionid?CompanyID=${companyId}&RegionId=${regionId}`);
  }

  getBirthdays(companyId: number, regionId: number) {
    return this.http.get(`${this.apiUrl}/birthdays?companyId=${companyId}&regionId=${regionId}`);
  }

  getApprovedLeaves(userId: number) {
    return this.http.get(`${this.apiUrl}/approved-by-user/${userId}`);
  }

  getEvents(companyId: number, regionId: number) {
    return this.http.get(`${this.apiUrl}/Geteventsbycompanyidandregionid?CompanyID=${companyId}&RegionId=${regionId}`);
  }
  getWeekoffLists(companyId: number, regionId: number) {
    return this.http.get(`${this.apiUrl}/MasterData/weekoff-list?companyId=${companyId}&regionId=${regionId}`);
  }
  getWeekoffList(companyId: number, regionId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/MasterData/weekoffCalender?companyId=${companyId}&regionId=${regionId}`);
}
}
