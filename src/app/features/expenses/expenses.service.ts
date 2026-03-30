import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from 'process';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Expense {
  expenseId: number;
  projectName: string;
  location: string;
  country: string;
  expenseCategoryId: number;
  expenseCategoryName?: string;
  departmentId?: number | null;
  currencyCode: string;
  amount: number;
  expenseDate: string;
  reason: string;
  userId: number;
  userFullName?: string;
  companyId: number;
  regionId: number;
  receiptPath?: string;
  status?: string;
  checked?: boolean;
  visible?: boolean;

}
export interface ExpenseApprovalDto {
  managerId?: number;
  action: string;
  expenseIds?: number[];
}
@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
 private baseUrl = environment.apiUrl + '/Expenses';


  constructor(private http: HttpClient) {}

  createExpense(formData: FormData) {
    return this.http.post<any>(`${this.baseUrl}/CreateExpense`, formData);
  }

 getExpensesByUser(userId: number) {
  return this.http.get<any>(`${this.baseUrl}/GetByUserExpenses/${userId}`);
}


   // ----------------------------------------------------
  // GET EXPENSE LIMIT (FIXED)
  // ----------------------------------------------------
  getExpenseLimit(
    companyId: number,
    regionId: number,
    departmentName: string | null,   // ✅ FIX
    categoryId: number
  ): Observable<any> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('regionId', regionId.toString())
      .set('categoryId', categoryId.toString());

    // ✅ Only append departmentId if available
    if (departmentName !== null) {
      params = params.set('departmentName', departmentName.toString());
    }

    return this.http.get<any>(
      `${this.baseUrl}/GetExpenseLimit`,
      { params }
    );
  }


 // ✅ Call new API without parameters
//  getExpenseCategories(): Observable<any> {
//   debugger;
//   return this.http.get<any>(`${this.baseUrl}/GetAllExpenseCategoriesAsync`);
// }
getExpenseCategories(companyId: number, regionId: number): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/GetAllExpenseCategoriesAsync?companyId=${companyId}&regionId=${regionId}`
  );
}

// ----------------------------------------------------
// GET EXPENSES FOR MANAGER APPROVAL
// ----------------------------------------------------
getExpensesForApproval(managerId: number): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/GetExpensesForApproval/${managerId}`
  );
}

// ----------------------------------------------------
// APPROVE / REJECT EXPENSES
// ----------------------------------------------------
approveRejectExpenses(payload: ExpenseApprovalDto): Observable<any> {
  return this.http.post<any>(
    `${this.baseUrl}/expensesApproveReject`,
    payload
  );
}
 getAllExpenses(companyId: number, regionId: number): Observable<{ success: boolean, data: Expense[], companyId: number, regionId: number }> {
    return this.http.get<{ success: boolean, data: Expense[], companyId: number, regionId: number }>(`${this.baseUrl}/GetExpensesAll?companyId=${companyId}&regionId=${regionId}`);
  }
}
