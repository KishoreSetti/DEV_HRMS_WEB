import { Component } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';

@Component({
  selector: 'app-expense-management',
  standalone: false,
  templateUrl: './expense-management.component.html',
  styleUrl: './expense-management.component.css'
})
export class ExpenseManagementComponent {
// canCreateExpense: boolean = false;
// canViewAllExpense: boolean = false;
// canApproveExpense: boolean = false;

//  constructor(private adminService: AdminService) { }
// ngOnInit() {
//   this.loadExpensePermissions();
// }
// loadPermission() {
//   const userId = Number(sessionStorage.getItem("UserId"));
//   const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

//   // ✅ Create Expense
//   const createMenu = menus.find(
//     (m: any) => m.menuName?.trim().toLowerCase() === "create expense"
//   );

//   // ✅ All Expenses
//   const allMenu = menus.find(
//     (m: any) => m.menuName?.trim().toLowerCase() === "all expenses"
//   );

//   // ✅ Approve Expenses
//   const approveMenu = menus.find(
//     (m: any) => m.menuName?.trim().toLowerCase() === "approve expenses"
//   );

//   this.canCreateExpense = createMenu?.canAdd ?? false;
//   this.canViewAllExpense = allMenu?.canView ?? false;
//   this.canApproveExpense = approveMenu?.canEdit ?? false;

//   // 🔥 Optional API calls (same pattern)
//   if (createMenu) {
//     this.adminService.getPermission(userId, createMenu.menuId, 'create')
//       .subscribe(res => this.canCreateExpense = this.canCreateExpense && res);
//   }

//   if (allMenu) {
//     this.adminService.getPermission(userId, allMenu.menuId, 'view')
//       .subscribe(res => this.canViewAllExpense = this.canViewAllExpense && res);
//   }

//   if (approveMenu) {
//     this.adminService.getPermission(userId, approveMenu.menuId, 'edit')
//       .subscribe(res => this.canApproveExpense = this.canApproveExpense && res);
//   }

//   console.log("Expense Permissions:", {
//     create: this.canCreateExpense,
//     view: this.canViewAllExpense,
//     approve: this.canApproveExpense
//   });
// }

// loadExpensePermissions() {

//   const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

//   // 👉 Parent
//   const parentMenu = menus.find((m: any) =>
//     m.menuName?.trim().toLowerCase() === "expenses"
//   );

//   const parentId = parentMenu?.menuId;

//   // ❗ Safety check
//   if (!parentId) {
//     console.warn("Expenses parent not found");
//     return;
//   }

//   // 👉 Children
//   const expenseMenus = menus.filter((m: any) => m.parentId === parentId);

//   console.log("Expense Child Menus:", expenseMenus);

//   // 👉 Permission function
//   const getPermission = (name: string) =>
//     expenseMenus.find((m: any) =>
//       m.menuName?.trim().toLowerCase() === name.toLowerCase()
//     )?.canView ?? false;

//   // 👉 Assign
//   this.canCreateExpense = getPermission("Create Expense");
//   this.canViewAllExpense = getPermission("All Expenses");
//   this.canApproveExpense = getPermission("Approve Expenses");
// }
}
