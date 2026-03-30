import { Injectable, model } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,HttpErrorResponse  } from '@angular/common/http';

import { forkJoin } from 'rxjs';
import { map } from 'rxjs';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EmployeeDocument } from '../layout/models/employee-document.model';
import { EmployeeForm } from '../layout/models/employee-forms.model';
import { EmployeeLetter } from '../layout/models/employee-letter.model';
// ------------ Model Interfaces ----------------
//---------------------------------BANK DETAILS-----------------------------------------//
export interface BankDetails {
  bankDetailsId: number;
  employeeId: number;
  regionId?: number;
  userId?: number;
  companyId?: number;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  accountTypeId: number;
  ifsccode?: string;
  micrcode?: string;
  upiid?: string;
}
export interface CompanyPolicy {
  PolicyId: number;
  CompanyId: number;
  RegionId: number;
  Title: string;
  CategoryId: number;
  CategoryName: string;
  EffectiveDate: string; // ISO string
  Description?: string;
  File?: File | null;    // for upload
  FileName?: string;
  FilePath?: string;
}
export interface LeaveStatus {
  leaveStatusID: number;
  leaveStatusName: string;
  description: string;
  isActive: boolean;
  modifiedBy: number;
  companyID: number;
  regionID: number;
  createdBy: number;
  userID: number;
}
 // ------------------------------DD LIST-----------------------------------//
 export interface EmployeeDdlist {
 ddlistId: number;
  ddnumber: string;
  dddate: string;
  bankName: string;
  branchName: string;
  amount: number;
  payeeName: string;
  ddcopyFilePath?: string;
  companyId: number;
  regionId: number;
  employeeId: number;
    userId: number,
  companyName: string,
  regionName: string
}
export interface MyTeamUsers {
  userId: number;
  fullName: string;
  designation: string;
  departmentId: number;
  reportingTo: number;
  roleId: number;
  departmentName?: string;
  roleName?: string;
}

//---------------------------------W4 (usa)------------------------------//

export interface W4Details {
  w4Id: number;
  employeeId: number;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  filingStatus: string;
  multipleJobsOrSpouse?: boolean;
  totalDependents?: number;
  dependentAmounts?: number;
  otherIncome?: number;
  deductions?: number;
  extraWithholding?: number;
  employeeSignature: string;
  formDate: string; // DateOnly -> string
  regionId?: number;
  userId?: number;
  companyId?: number;
}


export interface EmployeeJobHistoryDto {
  id: number;
  employer: string;
  jobTitle: string;
  fromDate: string;
  toDate: string;
  lastCTC: number;
  website: string;
  employeeCode: string;
  reasonForLeaving: string;
  uploadDocumentPath?: string;
  companyId: number;
  regionId: number;
  userId: number;
  createdBy: number;
  createdAt: string;
  modifiedBy?: number;
  modifiedAt?: string;
}

export interface EmployeeEducationDto {
  educationId: number;
  userId: number;
  companyId: number;
  regionId: number;
  modeOfStudyId: number;
  qualification: string;
  specialization: string;
  institution: string;
  board: string;
  startDate: string;
  endDate: string;
  result: string;
  certificateFilePath?: string;
}
export interface EmployeeCertificationDto {
  certificationId: number;
  companyId: number;
  regionId: number;
  userId: number;

  certificationName: string;
  certificationTypeId: number;
  // optional friendly name (we'll populate it client-side)
  certificationTypeName?: string;

  description?: string;
  documentPath?: string;
  documentFile?: File | null;

  createdBy?: number;
  createdDate?: string;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
}
export interface EmployeeImmigration {
  regionId: number;
  companyId: number;
  immigrationId?: number;

  employeeId: string;
  userId: number;

  fullName: string;
  dateOfBirth: string;
  nationality: string;

  passportNumber: string;
  passportExpiryDate: string;

  visaTypeId: number;
  visaTypeName?: string;

  statusId: number;
  statusName?: string;

  visaNumber: string;
  visaIssueDate: string;
  visaExpiryDate: string;
  visaIssuingCountry: string;

  employerName: string;
  employerAddress: string;
  employerContact: string;
  contactPerson: string;

  remarks: string;

  passportCopyPath?: string;
  visaCopyPath?: string;
  otherDocumentsPath?: string;

  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}


export interface Designation {
  designationID: number;
  companyId: number;
  regionId: number;
  designationName: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
  isDeleted?: boolean;
  userId:number,
  companyName:string,
  regionName:string,
  departmentId:number,
  departmentName:string,
   gradeId?: number,
  gradeName?: string,
}

export interface AssetStatus {
 assetStatusId: number;
  assetStatusName: string;
  description?: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId?: number;
}
export interface PolicyCategory {
  PolicyCategoryID: number;
 CompanyId:number;
  RegionId: number;
    companyName: string;   // ✅ add
  regionName: string; 
  PolicyCategoryName: string;
    Description?: string;
    
  IsActive: boolean;
  UserId?: number;
} 
export interface Grade {
  gradeID: number;
  gradeName: string;
  companyID: number;
  regionId: number;
  isActive: boolean;

  companyName?: string;
  regionName?: string;
  userId?: number;
}
export interface AttachmentType {
  attachmentTypeId: number;
  attachmentCategory: string;
  attachmentTypeName: string;
  isActive: boolean;
  companyId: number;
  regionId: number;
  userId: number;
}
export interface ProjectStatus {
  ProjectStatusID: number;
  ProjectStatusName: string;
  IsActive: boolean;
  CompanyId: number; 
  RegionId: number;
  UserId: number;
  CompanyName?: string;
  RegionName?: string;
}
export interface AttendanceStatus {
  attendanceStatusId: number;
  attendanceStatusName: string;
  isActive: boolean;
  companyId: number;
  regionId: number;
  description?: string;
  createdBy:number;
  modifiedBy:number;
userId:number;
  
}
export interface ExpenseCategory {
  expenseCategoryID: number;
  expenseCategoryName: string;
  isActive: boolean;
  companyId: number;
  regionId: number;
  SortOrder: number;
  Description: string;
  UserId: number;
   // ✅ MUST ADD THESE
  companyName: string;
  regionName: string;
}
export interface LeaveStatus {
  LeaveStatusID: number;
  LeaveStatusName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface ChangePasswordRequest {
  UserID: number;
  oldPassword: string;
  newPassword: string;
 
}
export interface ResignationModel {
  resignationId: number;
  companyId: number;
  regionId: number;
  resignationType: string;
  noticePeriodDays: number;
  isActive: boolean;
}
// export interface AssetStatus {
//   assetStatusId: number;
//   assetStatusName: string;
//   description: string;
//   isActive: boolean;
//   companyId: number;
//   regionId: number;
// }
export interface LeaveType {
  LeaveTypeId: number;
  LeaveTypeName: string;
  LeaveDays: number;
  IsActive: boolean;
   CompanyID: number;
  RegionID: number;
  userId:number;
   gradeAllocations: GradeAllocation[];
}
export interface GradeAllocation {
  gradeID: number;
  leaveDays: number;
  gradename: string;
}
export interface ExpenseStatus {
  ExpenseStatusID: number;
  ExpenseStatusName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
}
export interface Company {
  companyId: number;
  companyName: string;
  companyCode?: string;
  industryType?: string;
  headquarters?: string;
  isActive: boolean;
  userId?: number;
  CreatedBy?: string;
  CreatedDate?: Date;
  ModifiedBy?: string;
  ModifiedAt?: Date;
}
export interface MenuRoleDto {
  menuRoleId: number;
  roleId: number;
  roleName: string;
  menuId: number;
  menuName: string;
  menuUrl: string;
  orderNo: number;
  icon: string;
  parentId?: number;
  canView?: boolean;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isActive: boolean;
}
export interface HelpdeskCategory {
   HelpdeskCategoryID: number;
  CategoryName: string;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
  UserId: number;
  CompanyName?: string;
  RegionName?: string;
}//===================== Company News Inteface ===============================
// export interface News {
//   Title: string;
//   NewsId?: number;      // <-- added for backend
//   Category: string;
//   Description: string;
//   Date: Date;
//   PublishedDate: string;
//   Attachment?: File | null;
// }
export interface News {
  NewsId?: number;
  userId: number;

  CompanyId: number | null;
  RegionId: number | null;
  departmentId?: number | null;

  Title: string;
  Category: string;
  Description: string;

  Date: Date;
  PublishedDate?: string;

  Attachment?: File | null;
}
export interface KpiCategory {
  KpiCategoryID?: number;
  KpiCategoryName: string;
  IsActive: boolean;
  CompanyID?: number;
  RegionID?: number;
}

export interface Relationship {
  relationshipId: number;
  relationshipName: string;
  companyId:number;
  regionId:number;
  userId:number;
  companyName:string;
  regionName:string;
  isActive: boolean;
}
export interface MenuItem {
   menuId?: number; 
  label: string;           // <-- what UI expects
  link?: string;
  icon?: string;
  orderNo?: number;
  children?: MenuItem[];
}
// export interface CertificationType {
//   certificationTypeID: number;
//   certificationTypeName: string;
//   isActive: boolean;
//   userId:number;
//   companyID: number;
//   regionID: number;
// }
// export interface CertificationType {
//  CertificationTypeID: number;
 
//   CertificationTypeName: string;
//   IsActive: boolean;
//   userId?: number;
//    companyID: number;
//   regionId: number;
// }
export interface BloodGroup {
  bloodGroupID: number;
  companyID: number;
  regionID: number;
  bloodGroupName: string;
  description: string | null;
  isActive: boolean;
  userID: number;
}
export interface Gender {
  genderID: number;
  genderName: string;
  isActive: boolean;
  companyId: number;
  regionId: number; 
   // ✅ add these
  companyName?: string;
  regionName?: string;
  userId?: number;
}

export interface Region {
  regionID: number;
  companyID: number;
  regionName: string;
  country: string;
  isActive: boolean;
  userId?: number;
}
export interface LeaveType {
  leaveTypeID: number;
  leaveTypeName: string;
  leaveDays: number;
  IsActive: boolean;
  CompanyID: number;
  RegionID: number;
  companyName?: string;
  regionName?: string;
}
export interface User {
  userId?: number;
  companyId: number;
  regionId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  roleId: number;
  departmentId:number;
  reportingTo:number;
  password?: string;
  status: string;
  userCompanyId?: number; // ✅ added for tracking which company the user belongs to
  loginType?: string; // "Admin" or "User"
}
export interface CompanyNewsCategory {
  categoryId: number;
  categoryName: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId: number;
  companyName?: string;
  regionName?: string;
}
export interface MenuMaster {
  menuID: number;
  menuName: string;
  parentMenuID?: number|null;
  url?: string;
  icon?: string;
  orderNo?: number;
  isActive: boolean | number;
  CreatedBy?: string;
  CreatedDate?: Date;
  ModifiedBy?: string;
  ModifiedAt?: Date;
}

export interface RoleMaster {
  roleId?: number| undefined;
  roleName: string;
  roleDescription?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
  companyId?: number;
  regionId?: number;
  userId?: number;
  companyName?: string;  
  regionName?: string;
}
export interface Department {
  departmentId: number;
  companyID: number;
  regionID: number;
  departmentName: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
  isDeleted?: boolean;
}
export interface UserReadDto {
    userID: number;
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
  userId:number;
  companyName:string;
  regionName:string;
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
 // ------------------ Employee Master Interface ------------------ //
  export interface EmployeeMaster {
    employeeMasterId: number;
    fullName: string;
    role?: string | null;
      roleId?: number;   // For backend
    department?: string | null;
    managerId?: number | null;
    createdBy?: number | null;
    updatedBy?: number | null;  // ✅ needed for edit

  } 
  //------------------- Manager Dropdown Interface ------------------ //
  export interface ManagerDropdown {
    userId: number;
    fullName: string;
  }
  //---------------------------------My Team Hierarchy Interface---------------------//
export interface TeamHierarchyDto {
  employeeMasterId: number;
  fullName: string;
  role?: string | null;
  managerId?: number | null;
  subordinates: TeamHierarchyDto[];
  expanded?: boolean; // optional for UI toggle
}

// export interface CertificationType {
//   certificationTypeID: number;
//   certificationTypeName: string;
//   isActive: boolean;
 
//   CompanyID: number;           // optional
//   RegionID: number; 
//   userId?: number;           // optional
// }
export interface CertificationType {
  certificationTypeID: number;
  certificationTypeName: string;
  isActive: boolean;
  companyID: number;
  regionId: number;
  userId?: number;
}
export interface ClockInOutDto {
  attendanceId?: number;   // optional for new records
  employeeCode: string;
  employeeName?: string;   // optional, can be filled from backend
  department?: string;     // optional
  clockType: 'Clock In' | 'Clock Out';
  time: string;            // HH:mm format
  createdBy?: number;      // user ID
}

// ------------------ Employee Master Interface ------------------ //
  export interface EmployeeMaster {
    employeeMasterId: number;
    fullName: string;
    role?: string | null;
      roleId?: number;   // For backend
    department?: string | null;
    managerId?: number | null;
    createdBy?: number | null;
    updatedBy?: number | null;  // ✅ needed for edit

  } 
  //------------------- Manager Dropdown Interface ------------------ //
  export interface ManagerDropdown {
    userId: number;
    fullName: string;
  }

//---------------------------------My Team Hierarchy Interface---------------------//
export interface TeamHierarchyDto {
  employeeMasterId: number;
  fullName: string;
  role?: string | null;
  managerId?: number | null;
  subordinates: TeamHierarchyDto[];
  expanded?: boolean; // optional for UI toggle
}
export interface PerformanceKPI {
  id?: number;
  kpiName?: string;
  weightage?: number;
  target?: string;
  achieved?: string;
  selfRating?: number;
  managerRating?: number;
  remarks?: string;
}

export interface PerformanceReview {
  id?: number;
  userId?: number;
  roleId?: number;

  departmentProject?: string;
  reportingManagerId?: number;
  designation?: string;
  department?: string;
  dateOfJoining?: string;

  probationStatus?: string;
  performanceCycle?: string;
  applicableStartDate?: string;
  applicableEndDate?: string;
  progressType?: string;
  appraisalYear?: string;

  selfReviewSummary?: string;
  status?: string;

  kpis?: PerformanceKPI[];
}
export interface MaritalStatus {
  maritalStatusID: number;
  companyID: number;
  regionID: number;
  statusName: string;
  description?: string;
  isActive: boolean;
    companyName?: string;
  regionName?: string;
  userId:Number;
}
// ------------------ Employee Master Interface ------------------ //
export interface EmployeeMaster {
  employeeMasterId: number;
  fullName: string;
  role?: string | null;
  roleId?: number;   // For backend
  department?: string | null;
  managerId?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;  // ✅ needed for edit

}
//------------------- Manager Dropdown Interface ------------------ //
export interface ManagerDropdown {
  userId: number;
  fullName: string;
}
export interface EmployeeMaster {
  employeeMasterId: number;
  fullName: string;
  role?: string | null;
  roleId?: number;   // For backend
  department?: string | null;
  managerId?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;  // ✅ needed for edit

}
//------------------- Manager Dropdown Interface ------------------ //
export interface ManagerDropdown {
  userId: number;
  fullName: string;
}
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.apiUrl; // 🔹 Change this to your actual API URL

  constructor(private http: HttpClient) {}
  // -------------------------------------------------------------
  // 🔹 GENERIC HELPERS
  // -------------------------------------------------------------

  private buildParams(params?: Record<string, any>): HttpParams {
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value);
        }
      });
    }
    return httpParams;
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  // Generic reusable CRUD
  private getAll<T>(endpoint: string, params?: Record<string, any>): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: this.buildParams(params) });
  }

  private getById<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  private create<T>(endpoint: string, model: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, model, this.getHeaders());
  }

  private update<T>(endpoint: string, id: number, model: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}/${id}`, model, this.getHeaders());
  }

  private delete(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  // -------------------------------------------------------------
  // 🔹 COMPANY OPERATIONS
  // -------------------------------------------------------------
  getCompanies(params?: any,userId?: number): Observable<Company[]> {
    return this.getAll<Company>('UserManagement/GetCompany?userId='+userId, params);
  }

  getCompanyById(id: number): Observable<Company> {
    return this.getById<Company>('UserManagement/GetCompanyById', id);
  }

  createCompany(model: Company): Observable<Company> {
    return this.create<Company>('UserManagement/SaveCompany', model);
  }

  updateCompany(id: number, model: Company): Observable<Company> {
    return this.update<Company>('UserManagement/UpdateCompany', id, model);
  }

  deleteCompany(id: number): Observable<void> {
    return this.delete('UserManagement/DeleteCompany', id);
  }

  // -------------------------------------------------------------
  // 🔹 REGION OPERATIONS
  // -------------------------------------------------------------
  getRegions(params?: any,userId?: number): Observable<Region[]> {
    return this.getAll<Region>('UserManagement/GetRegion?userId='+userId, params);
  }

  getRegionById(id: number): Observable<Region> {
    return this.getById<Region>('UserManagement/GetRegionById', id);
  }

  createRegion(model: Region): Observable<Region> {
    return this.create<Region>('UserManagement/SaveRegion', model);
  }

  updateRegion(id: number, model: Region): Observable<Region> {
    return this.update<Region>('UserManagement/UpdateRegion', id, model);
  }

  deleteRegion(id: number): Observable<void> {
    return this.delete('UserManagement/DeleteRegion', id);
  }

  // -------------------------------------------------------------
  // 🔹 USER OPERATIONS
  // -------------------------------------------------------------
  // getUsers(params?: any): Observable<User[]> {
  //   return this.getAll<User>('UserManagement/getUsers', params);
  // }

  // getUserById(id: number): Observable<User> {
  //   return this.getById<User>('UserManagement/getUserById', id);
  // }

  // createUser(model: User): Observable<User> {
  //   return this.create<User>('UserManagement/createUser', model);
  // }

  // updateUser(id: number, model: User): Observable<User> {
  //   return this.update<User>('UserManagement/updateUser', id, model);
  // }

  // deleteUser(id: number): Observable<void> {
  //   return this.delete('UserManagement/deleteUser', id);
  // }
  getAllUsers(): Observable<User[]> {
     const userId = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;
    return this.http.get<User[]>(`${this.baseUrl}/UserManagement/GetAllUsers/${userId}`);  
  }
  GetAllUsersData(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/UserManagement/GetAllUsersData?userCompanyId=`+ (sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0));
  }
   GetcmpregAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/UserManagement/GetcmpregAllUsers?companyId=`+ (sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0)+'&&regionId='+(sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0));
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/UserManagement/GetUserById/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/UserManagement/CreateUser`, user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/UserManagement/UpdateUser`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/UserManagement/DeleteUser`, id);
 }
  login(username: string, password: string): Observable<any> {
    const model = {email: username,password: password };
    return this.http.post<any>(`${this.baseUrl}/UserManagement/Login`, model).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Login API error:', error);
    return throwError(() => new Error('Unable to process login. Please try again later.'));
  }

  sendWelcomeEmail(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/UserManagement/SendEmail`, user);
  }

  // -------------------------------------------------------------
  // 🔹 MENU MASTER OPERATIONS
  // -------------------------------------------------------------
  getMenus(params?: any): Observable<MenuMaster[]> {
    return this.getAll<MenuMaster>('UserManagement/GetAllMenus', params);
  }

  getMenuById(id: number): Observable<MenuMaster> {
    return this.getById<MenuMaster>('UserManagement/GetMenuById', id);
  }

  createMenu(model: MenuMaster): Observable<MenuMaster> {
    return this.create<MenuMaster>('UserManagement/CreateMenu', model);
  }

  updateMenu(id: number, model: MenuMaster): Observable<MenuMaster> {
    return this.update<MenuMaster>('UserManagement/UpdateMenu', id, model);
  }

  deleteMenu(id: number): Observable<void> {
    return this.delete('UserManagement/DeleteMenu', id);
  }

  // -------------------------------------------------------------
  // 🔹 Role MASTER OPERATIONS
  // -------------------------------------------------------------
getroles(userId: number): Observable<RoleMaster[]> {
  return this.http.get<RoleMaster[]>(
    `${this.baseUrl}/UserManagement/GetAllRoles?userId=${userId}`
  );
}

  getrolesById(id: number): Observable<RoleMaster> {
    return this.getById<RoleMaster>('UserManagement/GetRoleById', id);
  }

  createRoles(model: RoleMaster): Observable<RoleMaster> {
    return this.create<RoleMaster>('UserManagement/CreateRole', model);
  }

  updateRoles(id: number, model: RoleMaster): Observable<RoleMaster> {
    return this.update<RoleMaster>('UserManagement/UpdateRole', id, model);
  }

    deleteRoles(id: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/UserManagement/DeleteRole/${id}`, {}); 
}




  // ✅ Role Permission APIs
  getPermissionsByRole(roleId: number|undefined): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/UserManagement/get-permissions/${roleId}`);
  }

  assignPermissions(roleId: number, permissions: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/UserManagement/assign-permissions/${roleId}`, permissions);
  }

  // ✅ Combined loader: Menus + Role Permissions merged
  getMenusWithPermissions(roleId: number|undefined): Observable<any[]> {
    return forkJoin({
      menus: this.getMenus(),
      permissions: this.getPermissionsByRole(roleId)
    }).pipe(
      map(({ menus, permissions }) => this.mergePermissions(menus, permissions))
    );
  }
  getMenusByRoleId(roleId: number): Observable<MenuRoleDto[]> {
    return this.http
      .get<MenuRoleDto[]>(`${this.baseUrl}/UserManagement/GetAllMenusByRoleId/${roleId}`)
      .pipe(catchError(this.handleError));
  }

  

  private mergePermissions(menus: MenuMaster[], permissions: any[]): any[] {
  // Function recursively maps permissions to each menu item
  const mapPermissions = (menuList: MenuMaster[]): any[] => {
    return menuList.map((menu): any => {
      const perm = permissions.find(p => p.menuId === menu.menuID);

      const mappedMenu: any = {
        ...menu,
        expanded: false,
        selected: perm ? perm.isActive : false,
        permissions: {
          view: perm ? perm.canView : false,
          add: perm ? perm.canAdd : false,
          edit: perm ? perm.canEdit : false,
          delete: perm ? perm.canDelete : false,
          approve: perm ? perm.canApprove : false
        },
        children: [] as any[]
      };

      // Recursively process children
      const childMenus = menus.filter(m => m.parentMenuID === menu.menuID);
      if (childMenus.length > 0) {
        mappedMenu.children = mapPermissions(childMenus);
      }

      return mappedMenu;
    });
  };

  // Start with root-level menus
  const rootMenus = menus.filter(m => !m.parentMenuID);
  return mapPermissions(rootMenus);
}
bulkInsertData(entityName: string, data: any[]): Observable<any> {
  const payload = {
    entityName,
    data
  };
  return this.http.post(`${this.baseUrl}/UserManagement/BulkInsert`, payload);
}
// -------------------------------------------------------------
// 🔹 DEPARTMENT OPERATIONS
// -------------------------------------------------------------
getDepartments(userId:number): Observable<Department[]> {
  return this.getAll<Department>(`MasterData/GetDepartments?userId=`+userId);
}

getDepartmentById(id: number): Observable<Department> {
  return this.getById<Department>(`MasterData/GetDepartmentById`, id);
}

createDepartment(model: Department): Observable<any> {
  return this.create<Department>(`MasterData/CreateDepartment`, model);
}

updateDepartment(id: number, model: Department): Observable<any> {
  return this.update<Department>(`MasterData/updateDepartment`, id, model);
}

deleteDepartment(id: number): Observable<any> {
  return this.http.post(`/MasterData/DeleteDepartment/${id}`, {}); // soft delete
}

getDesignations(userId:number): Observable<Designation[]> {
  debugger;
  return this.getAll<Designation>(`MasterData/GetDesignations?userId=`+userId);
}

getDesignationById(id: number): Observable<Designation> {
  return this.getById<Designation>(`MasterData/GetDesignationById`, id);
}

createDesignation(model: Designation): Observable<any> {
  return this.create<Designation>(`MasterData/CreateDesignation`, model);
}

updateDesignation(id: number, model: Designation): Observable<any> {
  return this.update<Designation>(`MasterData/UpdateDesignation`, id, model);
}

deleteDesignation(id: number): Observable<any> {
  // Using POST for soft delete pattern as per your Department delete
  return this.http.post(`${this.baseUrl}/MasterData/DeleteDesignation/${id}`,{} );
}

getGenders(companyId: number, regionId: number,userId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/MasterData/GetGenderAll`,
    {
      params: {
        companyId: companyId,
        regionId: regionId,
        userId: userId
      }
    }
  );
}

createGender(gender: Gender) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateGender`, gender);
}

updateGender(gender: Gender) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateGender`, gender);
}

deleteGender(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteGender?id=${id}`, {});
}
 getBloodGroupsbyID(userID: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/MasterData/GetBloodGroupsById/${userID}`);
  }
//   // ✅ CREATE
  createBloodGroup(data: BloodGroup): Observable<any> {
    return this.http.post(`${this.baseUrl}/MasterData/AddBloodGroups`, data);
  }

//   // ✅ UPDATE
  updateBloodGroup(id: number, data: BloodGroup): Observable<any> {
    return this.http.put(`${this.baseUrl}/MasterData/UpdateBloodGroups?id=${id}`, data);
  }

//   // ✅ DELETE (Soft delete)
  deleteBloodGroup(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/MasterData/DeleteBloodGroups/${id}`);
  }
// getBloodGroups() {
//   return this.http.get(`${this.baseUrl}/bloodgroups`);
// }

// createBloodGroup(data: any) {
//   return this.http.post(`${this.baseUrl}/bloodgroups`, data);
// }

// updateBloodGroup(id: number, data: any) {
//   return this.http.put(`${this.baseUrl}/bloodgroups/${id}`, data);
// }

// deleteBloodGroup(id: number) {
//   return this.http.delete(`${this.baseUrl}/bloodgroups/${id}`);
// }
//martital status CRUD operations

   // ----------------- Marital Status -----------------
  getMaritalStatuses(userId:Number): Observable<MaritalStatus[]> {
    // Must POST {} because backend uses [HttpPost("getall")]
   // return this.http.post<MaritalStatus[]>(`${this.baseUrl}/UserManagement/getall?userId=`+userId, {});
    return this.http.post<MaritalStatus[]>(`${this.baseUrl}/UserManagement/getallMaritalStatus?userId=`+userId, {});
  }
  getMaritalStatusesbycmp(companyId: number,regionId: number): Observable<MaritalStatus[]> {
    // Must POST {} because backend uses [HttpPost("getall")]
   // return this.http.post<MaritalStatus[]>(`${this.baseUrl}/UserManagement/getall?userId=`+userId, {});
    return this.http.post<MaritalStatus[]>(`${this.baseUrl}/UserManagement/getallMaritalStatusByCmp?companyId=`+companyId+"&regionId="+regionId, {});
  }

  createMaritalStatus(data: MaritalStatus): Observable<any> {
    const fd = new FormData();
    debugger;
    fd.append('companyId', data.companyID.toString());
    fd.append('regionId', data.regionID.toString());
    fd.append('maritalStatusName', data.statusName);
    fd.append('description', data.description ?? '');
    fd.append('isActive', data.isActive.toString());
    fd.append('userId',data.userId.toString());
    return this.http.post(`${this.baseUrl}/UserManagement/create`, fd);
  }

  updateMaritalStatus(data: MaritalStatus): Observable<any> {
    const fd = new FormData();
    fd.append('id', data.maritalStatusID.toString());
    fd.append('companyId', data.companyID.toString());
    fd.append('regionId', data.regionID.toString());
    fd.append('maritalStatusName', data.statusName);
    fd.append('description', data.description ?? '');
    fd.append('isActive', data.isActive.toString());
    return this.http.post(`${this.baseUrl}/UserManagement/update`, fd);
  }

  deleteMaritalStatus(id: number): Observable<any> {
    const fd = new FormData();
    fd.append('id', id.toString());
    return this.http.post(`${this.baseUrl}/UserManagement/delete`, fd);
  }
// ---------------- RELATIONSHIP MASTER ---------------- //

getRelationships(userId: number, companyId: number, regionId: number) {
  return this.http.get<any>(`${this.baseUrl}/UserManagement/GetAllRelationShip`,{
      params: {
        userId: userId,
        companyId: companyId,
        regionId: regionId
      }})
}

getcmpregRelationships(userId: number) {
  return this.http.get<any>(`${this.baseUrl}/UserManagement/GetAllUserIdrelatiopnshipByUserAsync`,{
      params: {
        userId: userId
      }})
}

createRelationship(data: any) {
  return this.http.post<any>(`${this.baseUrl}/UserManagement/AddRelationship`, data);
}

updateRelationship(data: any) {
    return this.http.post<any>(`${this.baseUrl}/UserManagement/UpdateRelationship`, data);
}

deleteRelationship(id: number) {
  return this.http.post<any>(`${this.baseUrl}/UserManagement/DeleteRelationship?relationshipId=${id}`, {});
}
 getWeekoffLists(companyId: number, regionId: number) {
    return this.http.get(`${this.baseUrl}/MasterData/weekoff-list?companyId=${companyId}&regionId=${regionId}`);
  }
  // Policy Category
createPolicyCategory(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreatePolicyCategory`, data);
}

updatePolicyCategory(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdatePolicyCategory`, data);
}

// deletePolicyCategory(id: number) {
// //   return this.http.post(`${this.baseUrl}/MasterData/DeletePolicyCategory?id=${id}`, {});
// }
deletePolicyCategory(policyCategoryId: number) {
  return this.http.post(
    `${this.baseUrl}/MasterData/DeletePolicyCategory/${policyCategoryId}`,
    {}
  );
}
// ===================== POLICIES =====================

  // Get All Policies
  getAllPolicies(userId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/MasterData/GetAllPolicies?userId=${userId}`
    )
  }

  // Get Today's Policies
  getTodayPolicies(userId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/MasterData/GetTodayPolicies?userId=${userId}`
    )
  }

  // Get Policy By Id
  getPolicyById(id: number, userId: number) {
    return this.http.get<any>(
      `${this.baseUrl}/MasterData/GetPolicyById?id=${id}&userId=${userId}`
    )
  }

  // Save Policy
  savePolicy(data: any) {
    return this.http.post(
      `${this.baseUrl}/MasterData/SavePolicy`,
      data
    )
  }

  // Update Policy
  updatePolicy(id: number, data: any) {
    return this.http.post(
      `${this.baseUrl}/MasterData/UpdatePolicy/${id}`,
      data
    )
  }

  // Delete Policy
  deletePolicy(id: number, userId: number) {
    return this.http.delete(
      `${this.baseUrl}/MasterData/DeletePolicy/${id}?userId=${userId}`
    )
  }

  //----------------------------------COMPANY NEWS Employee Component --------------------------------//
  // Inside your existing service, e.g., AdminService or CompanyNewsService
  getFilteredNews(category?: string, date?: string): Observable<any[]> {
    let params: any = {};
    if (category) params.category = category;
    if (date) params.date = date;
    return this.http.get<any[]>(`${this.baseUrl}/Attendance/get-all`, { params });
  }

  // Get policy categories dropdown
  getPolicyCategoryDropdown(companyId: number, regionId: number): Observable<PolicyCategory[]> {
    const formData = new FormData();
    formData.append('companyId', companyId.toString());
    formData.append('regionId', regionId.toString());
    return this.http.post<PolicyCategory[]>(`${this.baseUrl}/Attendance/GetPolicyCategoryDropdown`, formData);
  }

// Get policy categories by company and region
  getPolicyCategories(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/policy-category?userId=${userId}`);
}
getAttachmentTypes(companyId: number, regionId: number) {
  return this.http.get<any>(`${this.baseUrl}/MasterData/GetByUserAttachment?userId=${sessionStorage.getItem('UserId')}`);}

createAttachmentType(data: AttachmentType) {
  return this.http.post<any>(`${this.baseUrl}/MasterData/CreateAttachmnet`, data);}

updateAttachmentType(data: AttachmentType) {
  return this.http.put<any>(`${this.baseUrl}/MasterData/UpdateAttachmnet`, data);
}

deleteAttachmentType(id: number) {

    return this.http.delete<any>(`${this.baseUrl}/MasterData/DeleteAttachmnet/${id}`);
}


getAttachmentTypesByCategory(category: string) {
  const userId = sessionStorage.getItem('UserId');
  return this.http.get<any>(
    `${this.baseUrl}/MasterData/GetAttachmentByCategory?category=${category}`
  );
}


// GET all project statuses
 getProjectStatuses(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/MasterData/project-status?userId=${userId}`);
  }

  // CREATE
  createProjectStatus(status: ProjectStatus): Observable<any> {
   return this.http.post(`${this.baseUrl}/MasterData/project-status`, status);
  }

  // UPDATE
  updateProjectStatus(status: ProjectStatus): Observable<any> {
   //  return this.http.put(`${this.baseUrl}/MasterData/project-status/${status.ProjectStatusID}`, status);
   return this.http.post(`${this.baseUrl}/MasterData/project-status/${status.ProjectStatusID}`, status);
  }

  // DELETE
  deleteProjectStatus(id: number): Observable<any> {
  //  return this.http.delete(`${this.baseUrl}/MasterData/project-status/${id}`);
return this.http.post(`${this.baseUrl}/MasterData/project-status/${id}`, {});  
}

getAssetStatus(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/asset-status?userId=${userId}`);
}

createAssetStatus(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateAssetStatus`, data);
}

updateAssetStatus(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateAssetStatus`, data);
}

deleteAssetStatus(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteAssetStatus?id=${id}`, {});
}


  // GET all helpdesk categories
   getHelpdeskCategories(userId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/MasterData/helpdesk-category?userId=${userId}`);
}

  // CREATE
  createHelpdeskCategory(category: HelpdeskCategory): Observable<any> {
     return this.http.post(`${this.baseUrl}/MasterData/helpdesk-category`, category);
  }

  // UPDATE
  updateHelpdeskCategory(category: HelpdeskCategory): Observable<any> {
   // return this.http.put(`${this.baseUrl}/MasterData/helpdesk-category/${category.HelpdeskCategoryID}`, category);
  return this.http.post(`${this.baseUrl}/MasterData/helpdesk-category/${category.HelpdeskCategoryID}`, category);
  }

  // DELETE
  deleteHelpdeskCategory(id: number): Observable<any> {
  // return this.http.delete(`${this.baseUrl}/MasterData/helpdesk-category/${id}`);
 return this.http.post(`${this.baseUrl}/MasterData/helpdesk-category/${id}`, {});  
}
//  getAttendanceStatus(companyId: number, regionId: number) {
//  return this.http.get<any>(`${this.baseUrl}/MasterData/GetAllAttendanceStatus?companyId=${companyId}&regionId=${regionId}`); 
// }

 getAttendanceStatus(userId: number) {
 return this.http.get<any>(`${this.baseUrl}/MasterData/GetAllAttendanceStatus?userId=${userId}`); 
}
createAttendanceStatus(model: AttendanceStatus) {
  return this.http.post(`${this.baseUrl}/MasterData/AddAttendanceStatus`, model);
}

updateAttendanceStatus(model: AttendanceStatus) {
 // return this.http.put(`${this.baseUrl}/MasterData/UpdateAttendanceStatus`, model);
return this.http.post(`${this.baseUrl}/MasterData/UpdateAttendanceStatus`, model);

}

deleteAttendanceStatus(id: number) {
 //return this.http.delete(`${this.baseUrl}/MasterData/DeleteAttendanceStatus/${id}`);
return this.http.post(`${this.baseUrl}/MasterData/DeleteAttendanceStatus/${id}`, {});
}
// ================= LEAVE STATUS ===================

// Get All
getLeaveStatus(companyId: number, regionId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/MasterData/GetAllLeaveStatus?companyId=${companyId}&regionId=${regionId}`
  );
}

// Create
createLeaveStatus(data: LeaveStatus) {
   return this.http.post<any>(
    `${this.baseUrl}/MasterData/AddLeaveStatus`,
    data
  );
}

// Update
updateLeaveStatus(id: number, data: LeaveStatus) {
  return this.http.put<any>(
    `${this.baseUrl}/MasterData/UpdateLeaveStatus?id=${id}`,
    data
  );
}

// Delete
deleteLeaveStatus(id: number) {
  return this.http.delete<any>(
   `${this.baseUrl}/MasterData/DeleteLeaveStatus/${id}`
  );
}

 getLeaveType(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.baseUrl}/MasterData/GetLeaveTypesByuserIdAsync?userId=`+(sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0));
  }
  createLeaveType(model: LeaveType): Observable<any> {
    return this.http.post(`${this.baseUrl}/MasterData/CreateLeaveType`, model);
  }

  updateLeaveType(model: LeaveType): Observable<any> {
    return this.http.post(`${this.baseUrl}/MasterData/UpdateLeaveType`, model);
  }
deleteLeaveType(id: number) {
  
  return this.http.post(
    `${this.baseUrl}/MasterData/DeleteLeaveType?id=${id}`,{}
  );
}
// EXPENSE STATUS CRUD

getExpenseStatus(companyId: number, regionId: number) {
  return this.http.get<any>(`${this.baseUrl}/GetExpenseStatus?companyId=${companyId}&regionId=${regionId}`);
}

createExpenseStatus(data: ExpenseStatus) {
  return this.http.post<any>(`${this.baseUrl}/CreateExpenseStatus`, data);
}

updateExpenseStatus(data: ExpenseStatus) {
  return this.http.put<any>(`${this.baseUrl}/UpdateExpenseStatus`, data);
}

deleteExpenseStatus(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/DeleteExpenseStatus/${id}`);
}
 // ------------------ EXPENSE CATEGORY TYPE ------------------

createExpenseCategoryType(model: ExpenseCategory) {
  return this.http.post(`${this.baseUrl}/ExpenseCategoryType/Create`, model);
}

updateExpenseCategoryType(model: ExpenseCategory) {
  return this.http.put(`${this.baseUrl}/ExpenseCategoryType/Update`, model);
}

deleteExpenseCategoryType(id: number) {
  return this.http.delete<any>(`${this.baseUrl}/ExpenseCategoryType/Delete/${id}`);
}

getAllExpenseCategoryTypes(companyId: number, regionId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/ExpenseCategoryType/GetAll/${companyId}/${regionId}`
  );
}

// Get All
    getAllEmployeeImmigrations(): Observable<EmployeeImmigration[]> {
      return this.http.get<EmployeeImmigration[]>(`${this.baseUrl}/Employee/GetImmigration`);
    }

  getEmployeeImmigrationById(id: number) : Observable <EmployeeImmigration> {
    return this.http.get<EmployeeImmigration>(`${this.baseUrl}/UserManagement/GetByIdImmigration/${id}`);
  }

CreateEmployeeImmigration(formData: FormData): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Employee/CreateImmigration`,
    formData
  );
}
 UpdateEmployeeImmigration(id: number, formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/Employee/UpdateImmigration/${id}`, formData, {
    responseType: 'text'  // Add this line
  });
}
  DeleteEmployeeImmigration(id: number, companyId: number, regionId: number): Observable <any> {
    return this.http.delete(`${this.baseUrl}/Employee/DeleteImmigration/${id}`)
  }
// Visa Types Dropdown
getVisaTypes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/Employee/GetVisaTypes`);
}

// Status Dropdown
getStatuses(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/Employee/GetStatuses`);
}

DownloadImmigrationFile(id: number, fileType: string): Observable<Blob> {
  return this.http.get(
    `${this.baseUrl}/UserManagement/DownloadImmigrationFile/${id}/${fileType}`,
    { responseType: 'blob' }
  );
}
getFileBaseUrl(): string {
  return this.baseUrl + '/uploads/';
}

// -------------------------------------------------------------
// 🔹 EMPLOYEE JOB HISTORY OPERATIONS
// -------------------------------------------------------------


// Get ALL job history records
getAllJobHistory(params?: any): Observable<EmployeeJobHistoryDto[]> {
  return this.getAll<EmployeeJobHistoryDto>('UserManagement/GetAllJobHistory', params);
}


getJobHistoryByEmployeeId(employeeId: number): Observable<EmployeeJobHistoryDto[]> {
  return this.http.get<EmployeeJobHistoryDto[]>(
    `${this.baseUrl}/employee/user/${employeeId}/jobhistory`
  );
}


// Get a single job history by ID
getJobHistoryById(id: number): Observable<EmployeeJobHistoryDto> {
  return this.getById<EmployeeJobHistoryDto>('employee/GetJobHistoryById', id);
}



addJobHistory(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/Employee/AddJobHistory`, formData);
}



// Update job history (with file upload)
updateJobHistory(id: number, model: any): Observable<any> {
  const formData = new FormData();

  Object.keys(model).forEach(key => {
    if (key === 'uploadDocument' && model[key]) {
      formData.append('UploadDocument', model[key]);
    } else {
      formData.append(key, model[key]);
    }
  });

  return this.http.post(`${this.baseUrl}/employee/updatejobhistory/${id}`, formData);
}


// Delete job history
deleteJobHistory(id: number): Observable<void> {
  return this.http.post<void>(`${this.baseUrl}/employee/deletejobhistory?id=${id}`, {});
}

//-----------Education Details APIs -----------------//

  // Get education by userId
 getEducationByUserId(userId: number): Observable<EmployeeEducationDto[]> {
    return this.http.get<EmployeeEducationDto[]>(`${this.baseUrl}/Employee/user/${userId}/education`);
}
GetAllEducation(): Observable<EmployeeEducationDto[]> {
  return this.getAll<EmployeeEducationDto>('Employee/GetAllEducation');
}
  // Add new education
  addEducation(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Employee/AddEducation`, formData);
  }

  // Update education
  updateEducation(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Employee/UpdateEducation/${id}`, formData);
  }

deleteEducation(id: number): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Employee/DeleteEducation?id=${id}`,
    {}
  );
}
  // Mode of Study
  // getModeOfStudy(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/employee/modeofstudy`);
  // }
// ================= CERTIFICATION APIs =================



getCertificationsByUserId(userId: number): Observable<EmployeeCertificationDto[]> {
  return this.http.get<EmployeeCertificationDto[]>(
    `${this.baseUrl}/employee/user/${userId}/certifications`
  );
}

addCertification(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/Employee/AddCertification`, formData);
}

updateCertification(id: number, formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/Employee/UpdateCertification/${id}`, formData);
}

deleteCertification(id: number): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/Employee/DeleteCertification?id=${id}`,
    { }
  );
}
 
// -------------------------------------------------------------
// 🔹 EMPLOYEE  Letters  OPERATIONS
// -------------------------------------------------------------
// ✅ Get Active Document Types for Dropdown
getActiveDocumentTypes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/employee/GetActiveDocumentTypes`);
}
getEmployeeLettersByEmployeeId(employeeId: number): Observable<EmployeeLetter[]> {
  return this.http.get<EmployeeLetter[]>(
    `${this.baseUrl}/employee/GetLettersByUser/${employeeId}`
  );
}
// POST - Add new employee letter
addEmployeeLetter(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/AddLetter`, formData);
}

// UPDATE letter (FIXED)
updateEmployeeLetter(id: number, formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/UpdateLetter/${id}`, formData);
}

// DELETE letter (FIXED)
deleteEmployeeLetter(id: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/deleteletters?id=${id}`, {});
}

// -------------------------------------------------------------
// 🔹 EMPLOYEE  Forms  OPERATIONS
// -------------------------------------------------------------

getEmployeeFormsByEmployeeId(employeeId: number): Observable<EmployeeForm[]> {
  return this.http.get<EmployeeForm[]>(
    `${this.baseUrl}/employee/GetUserForms/${employeeId}`
  );
}
addEmployeeForms(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/AddForm`, formData);
}

// UPDATE letter (FIXED)
updateEmployeeForms(id: number, formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/UpdateForm/${id}`, formData);
}

// DELETE letter (FIXED)
deleteEmployeeForms(id: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/DeleteForm?id=${id}`, {});
}
// -------------------------------------------------------------
// 🔹 EMPLOYEE  Document  OPERATIONS
// -------------------------------------------------------------
getEmployeeDocumentByEmployeeId(employeeId: number): Observable<EmployeeDocument[]> {
  return this.http.get<EmployeeDocument[]>(
    `${this.baseUrl}/employee/user/${employeeId}/documents`
  );
}
addEmployeeDocument(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/AddDocument`, formData);
}
updateEmployeeDocument(id: number, formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/employee/UpdateDocument/${id}`, formData);
}

// DELETE letter (FIXED)
deleteEmployeeDocument(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/employee/DeleteDocument/${id}`);
}

//--------------------------------BANK - DETAILS-----------------------------------//
getBankDetails(userId: number): Observable<BankDetails[]> {
  return this.http.get<BankDetails[]>(`${this.baseUrl}/employee/GetAllBankDetails/${userId}`);
}
getBankDetailById(id: number): Observable<BankDetails> {
  return this.http.get<BankDetails>(`${this.baseUrl}/employee/GetBankDetailsById/${id}`);
}

createBankDetail(bank: FormData | BankDetails): Observable<BankDetails> {
  return this.http.post<BankDetails>(`${this.baseUrl}/employee/CreateBankDetails`, bank);
}

updateBankDetail(bank: FormData | BankDetails): Observable<BankDetails> {
  return this.http.post<BankDetails>(`${this.baseUrl}/employee/UpdateBankDetails`, bank);
}

deleteBankDetail(id: number): Observable<void> {
  return this.http.post<void>(`${this.baseUrl}/employee/DeleteBankDetails?id=${id}`, {});
}

 
   
//------------------------------DD LIST -----------------------------------------//

getAllDdlist(userId: number): Observable<EmployeeDdlist[]> {
  return this.http.get<EmployeeDdlist[]>(`${this.baseUrl}/employee/GetAllDdlist/${userId}`);
}

createDdlist(dd: EmployeeDdlist): Observable<EmployeeDdlist> {
  return this.http.post<EmployeeDdlist>(`${this.baseUrl}/employee/CreateDdlist`, dd);
}

updateDdlist(dd: EmployeeDdlist): Observable<EmployeeDdlist> {
  return this.http.post<EmployeeDdlist>(`${this.baseUrl}/employee/UpdateDdlist`, dd);
}

deleteDdlist(id: number): Observable<void> {
  return this.http.post<void>(`${this.baseUrl}/employee/DeleteDdlist?id=${id}`, {});
}

/// -------------------- DD COPY UPLOAD / DOWNLOAD --------------------

// Upload DD Copy
uploadDDCopy(formData: FormData): Observable<{ fileName: string }> {
  return this.http.post<{ fileName: string }>(
    `${this.baseUrl}/employee/UploadDDCopy`,
    formData
  );
}

// Download DD Copy (not mandatory for View button)
downloadDDCopy(fileName: string): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/employee/DownloadDDCopy/${fileName}`, { responseType: 'blob' });
}


  //-------------------------------------W4 usa ---------------------------------//

 getW4List(userId: number): Observable<W4Details[]> {
    debugger;
    return this.http.get<W4Details[]>(`${this.baseUrl}/employee/GetAllW4s/${userId}`);
  }

  getW4ById(id: number): Observable<W4Details> {
    return this.http.get<W4Details>(`${this.baseUrl}/employee/GetW4ById/${id}`);
  }

  createW4(w4: W4Details): Observable<W4Details> {
    return this.http.post<W4Details>(`${this.baseUrl}/employee/CreateW4`, w4, this.getHeaders());
  }

  updateW4(w4: W4Details): Observable<W4Details> {
    return this.http.post<W4Details>(`${this.baseUrl}/employee/UpdateW4`, w4, this.getHeaders());
  }

  deleteW4(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/employee/DeleteW4?id=${id}`, {});
  }
  getexpensecategoryAll(userId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/MasterData/GetexpenseCategoryAll?userId=${userId}`
  );
}

  addexpenseCategory(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/MasterData/AddexpenseCategory`, payload);
  }

  updateexpensecategory(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/MasterData/UpdateexpenseCategory`, payload);
  }

  deleteexpenseCategory(id: number) {
    return this.http.post<any>(`${this.baseUrl}/MasterData/DeleteexpenseCategory?id=${id}`, {});
  }


// -------------------------------
  // SHIFT MASTER
  // -------------------------------
  getAllShifts(userId: number): Observable<ShiftMasterDto[]> {
    return this.http.get<ShiftMasterDto[]>(`${this.baseUrl}/Attendance/GetAllShifts?userId=${userId}`);
  }
  getShiftById(shiftId: number): Observable<ShiftMasterDto> {
    return this.http.get<ShiftMasterDto>(`${this.baseUrl}/UserManagement/GetShiftById/${shiftId}`);
  }

 addShift(model: ShiftMasterDto): Observable<any> {
   
    return this.http.post(`${this.baseUrl}/Attendance/AddShift`, model);
  }
    updateShift(model: ShiftMasterDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/Attendance/UpdateShift`, model);
  }

  deleteShift(shiftId: number): Observable<any> {
   
    return this.http.post(`${this.baseUrl}/Attendance/DeleteShift?shiftId=${shiftId}`, {});
  }

  activateShift(shiftId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/UserManagement/ActivateShift/${shiftId}`, {});
  }

  deactivateShift(shiftId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/UserManagement/DeactivateShift/${shiftId}`, {});
  }
getShiftsForDropdown(companyId: number, regionId: number): Observable<ShiftMasterDto[]> {
  return this.http.get<ShiftMasterDto[]>(
    `${environment.apiUrl}/Attendance/GetShiftsForDropdown?companyId=${companyId}&regionId=${regionId}`
  );
}
  // -------------------------------
  // SHIFT ALLOCATION
  // -------------------------------
  getAllAllocations(): Observable<ShiftAllocationDto[]> {
    return this.http.get<ShiftAllocationDto[]>(`${this.baseUrl}/employee/GetshiftAllocationAll`);
  }

  getAllocationById(id: number): Observable<ShiftAllocationDto> {
    return this.http.get<ShiftAllocationDto>(`${this.baseUrl}/employee/GetshiftAllocationById/${id}`);
  }

  allocateShift(model: ShiftAllocationDto): Observable<any> {
    debugger;
    return this.http.post(`${this.baseUrl}/employee/AddAllocateShift`, model);
  }

  updateAllocation(model: ShiftAllocationDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/employee/UpdateAllocation`, model);
  }

  deleteAllocation(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/employee/DeleteAllocation?id=${id}`, {});
  }

  // ---------- KPI CATEGORY ----------
getKpiCategories(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/kpi-categories?userId=${userId}`);
}

getKpiCategoryById(id: number) {
  return this.http.get(`${this.baseUrl}/MasterData/kpi-categories/${id}`);
}

createKpiCategory(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateKpiCategory`, data);
}

updateKpiCategory(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateKpiCategory`, data);
}

deleteKpiCategory(id: any) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteKpiCategory?id=${id}`, {});
}

//------------------------------EmployeeMasterService-------------------------------------//
getAllEmployees(userId: number): Observable<EmployeeMaster[]> {
  return this.http.get<EmployeeMaster[]>(
    `${environment.apiUrl}/UserManagement/GetAllEmployees?userId=${userId}`
  );
}

createEmployee(dto: EmployeeMaster) {
  return this.http.post(
    `${environment.apiUrl}/UserManagement/CreateEmployee`,
    dto
  );
}

updateEmployee(id: number, userId: number, dto: EmployeeMaster) {
  return this.http.post(
    `${environment.apiUrl}/UserManagement/UpdateEmployee/${id}?userId=${userId}`,
    dto
  );
}

 deleteEmployee(id: number, userId: number) {
  return this.http.post(
    `${environment.apiUrl}/UserManagement/DeleteEmployee/${id}?userId=${userId}`,
    {}
  );
}

getManagers(userId: number) {
  return this.http.get<ManagerDropdown[]>(
    `${environment.apiUrl}/UserManagement/GetManagers?userId=${userId}`
  );
}
//------------------------------My Team Hierarchy Service-------------------------------------//
getMyTeam(managerUserId: number): Observable<TeamHierarchyDto> {
  return this.http.get<TeamHierarchyDto>(`${environment.apiUrl}/UserManagement/MyTeam/${managerUserId}`);
}

 // ================= CERTIFICATION TYPE =================

// getCertificationTypes(companyId: number, regionId: number) {
//   return this.http.get<any>(
//     `${this.baseUrl}/MasterData/certification-types?companyId=${companyId}&regionId=${regionId}`
//   );
// }
getCertificationTypes(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/certification-type-list?userId=${userId}`);
}

getcmpregionCertificationTypes(companyId: number, regionId: number) {
  return this.http.get<any>(
    `${this.baseUrl}/MasterData/GetCmpregionAllAsync?companyId=${companyId}&regionId=${regionId}`
  );
}
createCertificationType(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateCertificationType`, data);
}


// createCertificationType(data: CertificationType) {
//   return this.http.post(
//     `${this.baseUrl}/MasterData/CreateCertificationType`,
//     data
//   );
// }

// updateCertificationType(id: number, data: CertificationType) {
//   return this.http.post(
//     `${this.baseUrl}/MasterData/UpdateCertificationType`,
//     data
//   );
// }
updateCertificationType(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateCertificationType`, data);
}

// DELETE (HARD DELETE – no query params)
// deleteCertificationType(id: number) {
//   return this.http.post(
//     `${this.baseUrl}/MasterData/DeleteCertificationType?id=${id}`,
//     {}
//   );
// }
deleteCertificationType(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteCertificationType?id=${id}`, {});
}
// ---------------- CLOCK IN / CLOCK OUT ----------------

getTodayAttendanceSummary(employeeCode: string) {
  return this.http.get<{ clockIn: string, clockOut: string, totalHours: string }>(
    `${this.baseUrl}/Attendance/TodaySummary/${employeeCode}`
  );
}
changePassword(payload: ChangePasswordRequest): Observable<any>{
  return this.http.post<any>(`${this.baseUrl}/UserManagement/change-password`, payload, { withCredentials: true });
}

// Captcha validation
 captchaValidation(): string {
  return `${this.baseUrl}/UserManagement/Captcha?` + new Date().getTime();
 }
getAllClockInOutRecords() {
  return this.http.get<any[]>(`${this.baseUrl}/Attendance/GetAll`);
}
// Update Clock In / Clock Out entry
updateClockInOut(id: number, data: { clockIn: string, clockOut: string, totalHours: string }) {
  return this.http.put(`${this.baseUrl}/Attendance/Update/${id}`, data);
}

// Delete attendance record
deleteClockInOut(id: number) {
  return this.http.delete(`${this.baseUrl}/Attendance/Delete/${id}`);
}
 getTodayAttendance(employeeCode: string, companyId: number, regionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Attendance/GetTodayByEmployee`, {
      params: { employeeCode, companyId, regionId }
    });
  }

  createClockInOut(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Attendance/CreateClockInOut`, payload);
  }
   submitDemoRequest(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/UserManagement/DemoRequest', data);
  }
// BULK UPLOAD
bulkUploadCertificationTypes(data: CertificationType[]): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/MasterData/certification-types/bulk`,
    data
  );
}

  ViewDocument(documentPath: string, download = false): void {
    if (!documentPath) return;

  const baseUrl = environment.baseurl;
  const cleanPath = documentPath.startsWith('/')
    ? documentPath.substring(1)
    : documentPath;

  const fileUrl = `${baseUrl}/${cleanPath}`;

  if (download) {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = this.getFileName(cleanPath);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    window.open(fileUrl, '_blank');
  }
  }
  private getFileName(path: string): string {
  return path.split('/').pop() || 'download';
}
saveDraft(data: any) {
  return this.http.post(`${this.baseUrl}/EmployeeKpi/SaveDraft`, data);
}

submit(data: any) {
  return this.http.post(`${this.baseUrl}/EmployeeKpi/Submit`, data);
}

getByUser(userId: number) {
  return this.http.get(`${this.baseUrl}/EmployeeKpi/GetByUser/${userId}`);
}

getManagerReviews(userId: number) {
  return this.http.get<any>(`${this.baseUrl}/EmployeeKpi/managerReview/${userId}`);
}


approve(reviewId: number, managerId: number, remarks: string) {
  return this.http.post(
    `${this.baseUrl}/EmployeeKpi/Approve?reviewId=${reviewId}&managerId=${managerId}&remarks=${encodeURIComponent(remarks)}`,
    {}
  );
}

reject(reviewId: number, managerId: number, remarks: string) {
  return this.http.post(
    `${this.baseUrl}/EmployeeKpi/Reject?reviewId=${reviewId}&managerId=${managerId}&remarks=${encodeURIComponent(remarks)}`,
    {}
  );
}
request(reviewId: number) {
  return this.http.post(
    `${this.baseUrl}/EmployeeKpi/Request?reviewId=${reviewId}`,
    {}
  );
}
 // Company News
// Company News Service
getallDepartments(): Observable<Department[]> {
  return this.http.get<Department[]>(`${this.baseUrl}/Attendance/departments`);
}

//---  // ================= NEWS APIs =================

  // Get All News
  getAllNews(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/MasterData/GetAllNews?userId=${userId}`
    );
  }

  // Get Today's News
  getTodayNews(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/MasterData/GetTodayNews?userId=${userId}`
    );
  }

  // Get News By Id
  getNewsById(id: number, userId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/MasterData/GetNewsById?id=${id}&userId=${userId}`
    );
  }

  // Add News (Now JSON, not FormData)
  saveNews(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/MasterData/SaveNews`,
      data
    );
  }

  // Update News
  updateNews(id: number, data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/MasterData/UpdateNews/${id}`,
      data
    );
  }

  // Delete News
  deleteNews(id: number, userId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/MasterData/DeleteNews/${id}?userId=${userId}`
    );
  }
  // Inside your existing service, e.g., AdminService or CompanyNewsService


 getPriorities(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/priorities?userId=${userId}`);
}

createPriority(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreatePriority`, data);
}

updatePriority(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdatePriority`, data);
}

deletePriority(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeletePriority?id=${id}`, {});
}
//////////asset-types CRUD operations
getAssetTypes(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/asset-types?userId=${userId}`);
}

createAssetType(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateAssetType`, data);
}

updateAssetType(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateAssetType`, data);
}

deleteAssetType(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteAssetType?id=${id}`, {});
}
getAssetTypesByCompanyRegion(companyId: number, regionId: number) {
  return this.http.get(
    `${this.baseUrl}/MasterData/assettypesfilter?companyId=${companyId}&regionId=${regionId}`
  );
}



getAssetCategories(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/asset-categories?userId=${userId}`);
}

createAssetCategory(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateAssetCategory`, data);
}

updateAssetCategory(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateAssetCategory`, data);
}

deleteAssetCategory(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteAssetCategory?id=${id}`, {});
}
getAssetCategoriesByCompanyRegion(companyId: number, regionId: number) {
  return this.http.get(
    `${this.baseUrl}/MasterData/assetcategoryfilter?companyId=${companyId}&regionId=${regionId}`
  );
}



///////////Currency CRUD operations

getCurrencies(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/currencies?userId=${userId}`);
}

createCurrency(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateCurrency`, data);
}

updateCurrency(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateCurrency`, data);
}

deleteCurrency(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteCurrency?id=${id}`, {});
}

getCurrenciesByCompanyRegion(companyId: number, regionId: number) {
  return this.http.get(
    `${this.baseUrl}/MasterData/currencyfilter?companyId=${companyId}&regionId=${regionId}`
  );
}




getHolidayList(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/holiday-list?userId=${userId}`);
}

createHoliday(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateHoliday`, data);
}

updateHoliday(data: any) {
  debugger;
  return this.http.post(`${this.baseUrl}/MasterData/UpdateHoliday`, data);
}

deleteHoliday(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteHoliday?id=${id}`, {});
}





getWeekoffList(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/weekoff-list?userId=${userId}`);
}

createWeekoff(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateWeekoff`, data);
}

updateWeekoff(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateWeekoff`, data);
}

deleteWeekoff(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteWeekoff?id=${id}`, {});
}
//---------------------- RESIGNATIONS ----------------------//

getResignations(companyId: number, regionId: number) {
  return this.http.get<ResignationModel[]>(
    `${this.baseUrl}/MasterData/GetResignations?companyId=${companyId}&regionId=${regionId}`
  );
}

getResignationById(id: number) {
  return this.http.get<ResignationModel>(
    `${this.baseUrl}/MasterData/GetResignationById/${id}`
  );
}

createResignation(formData: FormData, userId: number) {
  return this.http.post(
    `${this.baseUrl}/MasterData/CreateResignation?userId=${userId}`,
    formData
  );
}

updateResignation(id: number, formData: FormData, userId: number) {
  return this.http.post(
    `${this.baseUrl}/MasterData/UpdateResignation/${id}?userId=${userId}`,
    formData
  );
}

deleteResignation(id: number, userId: number) {
  return this.http.post(
    `${this.baseUrl}/MasterData/DeleteResignation/${id}?userId=${userId}`,
    {}
  );
}
// SEND OTP
forgotPassword(email: string) {
  return this.http.post<any>(
    `${this.baseUrl}/UserManagement/forgot-password`,
    { email }
  );
}

// VERIFY OTP
verifyOtp(email: string, otp: string) {
  return this.http.post<any>(
    `${this.baseUrl}/UserManagement/verify-otp`,
    { email, otp }
  );
}

// RESET PASSWORD
resetPassword(email: string, newPassword: string) {
  return this.http.post<any>(
    `${this.baseUrl}/UserManagement/reset-password`,
    { email, newPassword }
  );
}
 createEvent(data: any) {
    return this.http.post(`${this.baseUrl}/MasterData/CreateEvents`, data);
  }

  updateEvent(data: any) {
    return this.http.post(`${this.baseUrl}/MasterData/UpdateEvents`, data);
  }

  getEvents() {
    return this.http.get<any[]>(`${this.baseUrl}/MasterData/GetEventsAll`);
  }

  deleteEvent(id: number) {
    return this.http.post(`${this.baseUrl}/MasterData/DeleteEvents?id=${id}`,{});
  }
getAllUsersForMyTeamConfigurations(userId: number) {
  return this.http.get<MyTeamUsers[]>(
    `${environment.apiUrl}/UserManagement/GetAllUsers/${userId}`
  );
}
  getBloodGroupsbyALL(companyId: number): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/MasterData/GetAllBloodGroups?companyId=${companyId}`
  );
}
GetAllCmpRegAsync(companyId: number,regionId: number): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/MasterData/GetAllCmpRegAsync?companyId=${companyId}&regionId=${regionId}`
  );
}
GetAlluserIdAsync(userId: number): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/MasterData/GetAlluserIdAsync?userId=${userId}`
  );
}
getModeOfStudy(companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/employee/modeofstudy?companyId=${companyId}&regionId=${regionId}`
  );
}
 // ===================== POLICIES =====================

////////////screening result CRUD operations

getScreeningResults(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/screening-result?userId=${userId}`);
}

createScreeningResult(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateScreeningResult`, data);
}

updateScreeningResult(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateScreeningResult`, data);
}

deleteScreeningResult(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteScreeningResult?id=${id}`, {});
}



///////////////Interview Level// CRUD operations

getInterviewLevels(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/interview-levels?userId=${userId}`);
}

createInterviewLevel(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateInterviewLevel`, data);
}

updateInterviewLevel(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateInterviewLevel`, data);
}

deleteInterviewLevel(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteInterviewLevel?id=${id}`, {});
}
getDepartmentsForDropdown(companyId: number, regionId: number) {
  return this.http.get(
    `${this.baseUrl}/MasterData/GetDepartmentsForDropdown?companyId=${companyId}&regionId=${regionId}`
  );
}
// ================= Recruitment Notice Period =================

getRecruitmentNoticePeriodList(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/recruitmentnoticeperiod-list?userId=${userId}`);
}

createRecruitmentNoticePeriod(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateRecruitmentNoticePeriod`, data);
}

updateRecruitmentNoticePeriod(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateRecruitmentNoticePeriod`, data);
}

deleteRecruitmentNoticePeriod(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteRecruitmentNoticePeriod?id=${id}`, {});
}

/// Employee Attendances & Reports 

    // =============================
  // GET EMPLOYEES
  // =============================
  getEmployees(companyId: number, regionId: number) {

  
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('regionId', regionId);

    return this.http.get(`${this.baseUrl}/Attendance/GetEmployees`, { params });
  }

  // =============================
  // SAVE ATTENDANCE
  // =============================
  saveAttendance(data: any) {
    return this.http.post(`${this.baseUrl}/Attendance/SaveAttendance`, data);
  }

  // =============================
  // WEEKLY REPORT
  // =============================
  weeklyReport(companyId: number, regionId: number) {

    let params = new HttpParams()
      .set('companyId', companyId)
      .set('regionId', regionId);

    return this.http.get(`${this.baseUrl}/Attendance/WeeklyReport`, { params });
  }

  // =============================
  // MONTHLY REPORT
  // =============================
  monthlyReport(companyId: number, regionId: number) {

    let params = new HttpParams()
      .set('companyId', companyId)
      .set('regionId', regionId);

    return this.http.get(`${this.baseUrl}/Attendance/MonthlyReport`, { params });
  }

  // =============================
  // DATES RANGE REPORT
  // =============================
dateRangeReport(companyId: number, regionId: number, fromDate: string, toDate: string) {

  let params = new HttpParams()
    .set('companyId', companyId)
    .set('regionId', regionId)
    .set('fromDate', fromDate)
    .set('toDate', toDate);

  return this.http.get(`${this.baseUrl}/Attendance/DateRangeReport`, { params });
}
  getCompanyNewsCategoryList(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/companynewscategory-list/${userId}`);
}

createCompanyNewsCategory(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateCompanyNewsCategory`, data);
}

  
updateCompanyNewsCategory(data: any) {
  debugger;
  return this.http.post(`${this.baseUrl}/MasterData/UpdateCompanyNewsCategory`, data);
}

  
deleteCompanyNewsCategory(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteCompanyNewsCategory?id=${id}`, {});
}
getCategoriesByCompanyRegion(companyId: number, regionId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/companynewscategory-by-company-region?companyId=${companyId}&regionId=${regionId}`);
}
getDashboardEmployees(companyId:number){
  return this.http.get<any>(`${environment.apiUrl}/employee/GetDashboardEmployees?companyId=${companyId}`);
}
  // ================= My Calendar ===================e
getWeekoffs(companyId:number,regionId:number){
  return this.http.get(
    `${environment.apiUrl}/masterdata/weekoffCalender?companyId=${companyId}&regionId=${regionId}`
  )
}

getHolidays(companyId:number,regionId:number){
  return this.http.get(
    `${environment.apiUrl}/masterdata/holiday-listCalender?companyId=${companyId}&regionId=${regionId}`
  )
}

getMyLeavecalenderCalendar(userId:number){
 return this.http.get<any>(`${environment.apiUrl}/masterdata/GetMyLeaves?userId=${userId}`)
}
////////////////////employment-type

  getEmploymentTypes(userId: number) {
  return this.http.get(`${this.baseUrl}/MasterData/employment-type?userId=${userId}`);
}

createEmploymentType(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateEmploymentType`, data);
}

updateEmploymentType(data: any) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateEmploymentType`, data);
}

deleteEmploymentType(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteEmploymentType?id=${id}`, {});
}

getDemoUsers(){
  return this.http.get<any>(`${this.baseUrl}/usermanagement/demo-users`);
}
updateDemoExpiry(data:any){

return this.http.post(
this.baseUrl + '/usermanagement/update-demo-expiry',
data
);

}
getPlans(){
  return this.http.get(this.baseUrl + '/SubscriptionPlan/GetPlans');
}

getPlanById(id:any){
  return this.http.get(this.baseUrl + '/SubscriptionPlan/GetPlanById/' + id);
}

createPlan(data:any){
  return this.http.post(this.baseUrl + '/SubscriptionPlan/CreatePlan',data);
}

updatePlan(id:any,data:any){
  return this.http.put(this.baseUrl + '/SubscriptionPlan/UpdatePlan/' + id,data);
}

deletePlan(id:any){
  return this.http.delete(this.baseUrl + '/SubscriptionPlan/DeletePlan/' + id);
}


applyPlan(data:any){
 return this.http.post(this.baseUrl + '/SubscriptionPlan/ApplyPlan',data);
}
getPermission(userId: number, menuId: number, action: string) {
  return this.http.get<boolean>(
    `${this.baseUrl}/Employee/GetPermission?userId=${userId}&menuId=${menuId}&action=${action}`
  );
}
savePlanMenus(data:any){
  return this.http.post(`${this.baseUrl}/SubscriptionPlan/SavePlanMenus`, data);
}
getAllMenus(){
  return this.http.get(`${this.baseUrl}/SubscriptionPlan/GetAllMenus`);
}
getMenusByType(type: string){
  return this.http.get<any[]>(`${this.baseUrl}/SubscriptionPlan/GetMenusByType/${type}`);
}
getGrades(userId:number){
  return this.getAll(`MasterData/GetGradeAll?companyId=${userId}`);
}
getDesignation(companyId: number, regionId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/GetDesignations?companyId=${companyId}&regionId=${regionId}`
  );
}

// getGrades(companyId: number) {
//   return this.http.get<any>(`${this.baseUrl}/MasterData/GetGradeAll`, {
//     params: { companyId}
//   });
// }

createGrade(data: Grade) {
  return this.http.post(`${this.baseUrl}/MasterData/CreateGrade`, data);
}

updateGrade(data: Grade) {
  return this.http.post(`${this.baseUrl}/MasterData/UpdateGrade`, data);
}

deleteGrade(id: number) {
  return this.http.post(`${this.baseUrl}/MasterData/DeleteGrade?id=${id}`, {});
}
 getRegionsByCompany(companyId: number) {
  return this.getAll(`MasterData/GetRegionsByCompany?companyId=${companyId}`);
}

}
