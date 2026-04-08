import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
export interface SalaryComponent {
  componentId?: number;
  componentName: string;
  type: string;
  calculationType: string;
  percentageOf?: string;
  isTaxable: boolean;
  isActive: boolean;
  userId?: number;
  companyId?: string;
  regionId?: string;
}

export interface SalaryStructureComponent {
  componentId: number;
  amount?: number;
  percentage?: number;
}

export interface SalaryStructure {
  structureId: number;
  structureName: string;

  departmentId?: number;
  designationId?: number;
  gradeId?: number;

  isActive: boolean;

  userId?: number;
  companyId?: string;
  regionId?: string;

  createdAt?: Date;
  modifiedAt?: Date;

  components?: SalaryStructureComponent[];
}

export interface EmployeeSalary {
  employeeSalaryId?: number;
  employeeId: number;
  structureId: number;
  effectiveFrom: Date;
  ctc: number;
  isActive?: boolean;
  userId?: number;
  companyId?: string;
  regionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeePayRollService {
private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ================= Salary Components =================

  getComponents(userId: number): Observable<SalaryComponent[]> {
    return this.http.get<SalaryComponent[]>(`${this.baseUrl}/EmployeePayRoll/components/${userId}`);
  }

  getComponentById(id: number, userId: number): Observable<SalaryComponent> {
    return this.http.get<SalaryComponent>(`${this.baseUrl}/EmployeePayRoll/component/${id}/${userId}`);
  }

  createComponent(userId: number, model: SalaryComponent): Observable<any> {
    return this.http.post(`${this.baseUrl}/EmployeePayRoll/components/${userId}`, model);
  }

 // ✅ UPDATE (POST)
updateComponent(model: SalaryComponent): Observable<any> {
  return this.http.post(`${this.baseUrl}/EmployeePayRoll/components/update`, model);
}

// ✅ DELETE (POST)
deleteComponent(componentId: number, userId: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/EmployeePayRoll/components/delete`, {
    componentId,
    userId
  });
}

  // ================= Company Dropdown =================

  getCompanies(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/UserManagement/GetCompany?userId=${userId}`);
  }

  // ================= Region Dropdown =================

  getRegions(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/UserManagement/GetRegion?userId=${userId}`);
  }


  //================== Salary Structure component ====================

  // ✅ Get All Salary Structures
  getAllSalaryStructures(userId: number): Observable<SalaryStructure[]> {
    return this.http.get<SalaryStructure[]>(
      `${environment.apiUrl}/EmployeePayRoll/GetAllSalaryStructures/${userId}`
    );
  }

  // ✅ Get Salary Structure By Id
  getSalaryStructureById(id: number, userId: number): Observable<SalaryStructure> {
    return this.http.get<SalaryStructure>(
      `${environment.apiUrl}/EmployeePayRoll/GetSalaryStructureById/${id}/${userId}`
    );
  }

  // ✅ Create Salary Structure
  createSalaryStructure(userId: number, data: SalaryStructure): Observable<SalaryStructure> {
    return this.http.post<SalaryStructure>(
      `${environment.apiUrl}/EmployeePayRoll/CreateSalaryStructure/${userId}`,
      data
    );
  }

  // ✅ Update Salary Structure
  updateSalaryStructure(id: number, userId: number, data: SalaryStructure): Observable<SalaryStructure> {
    return this.http.put<SalaryStructure>(
      `${environment.apiUrl}/EmployeePayRoll/UpdateSalaryStructure/${id}/${userId}`,
      data
    );
  }

  // ✅ Delete Salary Structure
  deleteSalaryStructure(id: number, userId: number): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/EmployeePayRoll/DeleteSalaryStructure/${id}/${userId}`
    );
  }


// ================= Department Dropdown =================
// Department
getDepartments(userId: number): Observable<any> {
  return this.http.get<any>(
    `${environment.apiUrl}/MasterData/GetDepartments?userId=${userId}`
  );
}

// ================= Designation Dropdown =================
// Designation
getDesignations(userId: number): Observable<any> {
  return this.http.get<any>(
    `${environment.apiUrl}/MasterData/GetDesignations?userId=${userId}`
  );
}

// ================= Employee Dropdown =================

getEmployees(userId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${environment.apiUrl}/UserManagement/GetAllUsers/${userId}`
  );
}


// ================= Assign Salary =================


// 🔥 Get All Assigned Salaries
getAllAssignedSalaries(userId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${environment.apiUrl}/EmployeePayRoll/employee-salary/${userId}`
  );
}

assignSalary(userId: number, data: EmployeeSalary): Observable<EmployeeSalary> {
  return this.http.post<EmployeeSalary>(
    `${environment.apiUrl}/EmployeePayRoll/employee-salary/${userId}`,
    data
  );
}

getEmployeeSalary(employeeId: number, userId: number): Observable<EmployeeSalary[]> {
  return this.http.get<EmployeeSalary[]>(
    `${environment.apiUrl}/EmployeePayRoll/employee-salary/${employeeId}/${userId}`
  );
}

// ================= Payroll Processing =================

// 🔥 Process Payroll
processPayroll(userId: number, data: any): Observable<any> {
  return this.http.post(
    `${environment.apiUrl}/EmployeePayRoll/process/${userId}`,
    data
  );
}

// 🔥 Get Payroll By Month
getPayrollByMonth(month: number, year: number, userId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${environment.apiUrl}/EmployeePayRoll/${month}/${year}/${userId}`
  );
}

previewPayroll(userId: number, data: any) {
  return this.http.post<any[]>(
    `${environment.apiUrl}/EmployeePayRoll/preview/${userId}`,
    data
  );
}
}
