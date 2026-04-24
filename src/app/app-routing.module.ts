import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LayoutComponent } from './features/layout/layout/layout.component';
import { ProfileComponent } from './features/employee-profile/profile/profile.component';
import { DigitalBusinessCardComponent } from './features/employee-profile/digital-business-card/digital-business-card.component';
import { EmployeeDetailsComponent } from './features/employee-profile/employee-details/employee-details.component';
import { EmployeeEmergencyContactComponent } from './features/employee-profile/employee-emergency-contact/employee-emergency-contact.component';
import { EmployeeReferencesComponent } from './features/employee-profile/employee-references/employee-references.component';
import { FinanceDashboardComponent } from './features/auth/finance-dashboard/finance-dashboard.component';
import { ManagerDashboardComponent } from './features/auth/manager-dashboard/manager-dashboard.component';
import { EmployeeDashboardComponent } from './features/auth/employee-dashboard/employee-dashboard.component';
import { NavbarHrLayoutComponent } from './hr/layout/navbar-hr-layout/navbar-hr-layout.component';
import { NavbarManagerLayoutComponent } from './manager/layout/navbar-manager-layout/navbar-manager-layout.component';
import { NavbarEmployeeLayoutComponent } from './employee/layout/navbar-employee-layout/navbar-employee-layout.component';
import { EmployeeSkillsComponent } from './features/employee-profile/employee-skills/employee-skills.component';
import { EmployeeFamilyDetailsComponent } from './features/employee-profile/employee-details/employee-family-details/employee-family-details.component';
import { EmployeeDocumentsComponent } from './features/employee-profile/employee-documents/employee-documents.component';
import { EmployeeFinanceComponent } from './features/employee-profile/employee-finance/employee-finance.component';
import { EmployeeResignationComponent } from './features/employee-profile/employee-resignation/employee-resignation.component';
import { EmployeeImmigrationComponent } from './features/employee-profile/employee-immigration/employee-immigration.component';
import { ClockinClockoutComponent } from './features/attendance/clockin-clockout/clockin-clockout.component';
import { ShiftAllocationComponent } from './features/attendance/shift-allocation/shift-allocation.component';
import { DailyWorkingHoursComponent } from './features/attendance/daily-working-hours/daily-working-hours.component';
import { LateArrivalsComponent } from './features/attendance/late-arrivals/late-arrivals.component';
import { EarlyDeparturesComponent } from './features/attendance/early-departures/early-departures.component';
import { WfoRemoteRequestComponent } from './features/attendance/wfo-remote-request/wfo-remote-request.component';
import { MissedPunchRequestComponent } from './features/attendance/missed-punch-request/missed-punch-request.component';
import { LeaveManagementComponent } from './features/leave/leave-management/leave-management.component';
import { ExpenseManagementComponent } from './features/expenses/expense-management/expense-management.component';
import { AssetManagementComponent } from './features/asset/asset-management/asset-management.component';
import { TimesheetManagementComponent } from './features/timesheet/timesheet-management/timesheet-management.component';
import { KpiPerformanceComponent } from './features/performance/kpi-performance/kpi-performance.component';
import { HelpDeskManagementComponent } from './features/helpdesk/help-desk-management/help-desk-management.component';
import { ComanyNewsComponent } from './features/company-news/comany-news/comany-news.component';
import { EmployeePolicyComponent } from './features/company-policies/employee-policy/employee-policy.component';
import { MyTeamHierarchyComponent } from './features/my-team/my-team-hierarchy/my-team-hierarchy.component';
import { MyCalendarComponent } from './features/my-calendar/my-calendar/my-calendar.component';
import { MyEventsComponent } from './features/events/my-events/my-events.component';
import { CompensationComponent } from './features/compensation/compensation/compensation.component';
import { RecruitmentProcessComponent } from './features/recruitment/recruitment-process/recruitment-process.component';
import { WelcomedemoComponent } from './admin/pages/welcomedemo/welcomedemo.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ForgotPasswordComponent } from './features/login/forgot-password/forgot-password.component';
import { VerifyOtpComponent } from './features/login/verify-otp/verify-otp.component';
import { ResetPasswordComponent } from './features/login/reset-password/reset-password.component';
import { EarningDeductionsComponent } from './pages/payroll/earning-deductions/earning-deductions.component';
import { TaxSettingsComponent } from './admin/pages/payroll/tax-settings/tax-settings.component';
import { PayGroupsComponent } from './pages/payroll/pay-groups/pay-groups.component';
import { PayslipTemplateComponent } from './admin/pages/payroll/payslip-template/payslip-template.component';
import { SuperAdminLayoutComponent } from './superAdmin/super-admin-layout/super-admin-layout.component';
import { AttendanceListComponent } from './features/attendance/attendance-list/attendance-list.component';
import { SuperAdminDemousersComponent } from './superAdmin/super-admin-demousers/super-admin-demousers.component';
import { SubscriptionPlansComponent } from './superAdmin/subscription-plans/subscription-plans.component';
import { EmployeePayslipComponent } from './features/compensation/payroll/employee-payslip/employee-payslip.component';
import { HrPayslipComponent } from './features/compensation/payroll/hr-payslip/hr-payslip.component';
import { EmployeePersonalDetailsComponent } from './features/employee-profile/employee-details/employee-personal-details/employee-personal-details.component';
import { BirthdayMasterComponent } from './admin/pages/birthday/birthday-master/birthday-master.component';
import { JobApplicationComponent } from './admin/pages/job-application/job-application.component';
const routes: Routes = [
  { path: '', component: LoginComponent },
   { path: 'forgot-password', component: ForgotPasswordComponent },
{ path: 'verify-otp', component: VerifyOtpComponent },
{ path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: LayoutComponent },
  {path:'Welcomedemo',component:WelcomedemoComponent},
    {path:'jobapply',component:JobApplicationComponent},
  {path : 'change-password', component : ChangePasswordComponent},
  // { path: 'hr-dashboard', component: NavbarHrLayoutComponent },
  // // { path: 'manager-dashboard', component: NavbarManagerLayoutComponent },
  // { path: 'employee-dashboard', component: NavbarEmployeeLayoutComponent },
  // { path: 'finance-dashboard', component: FinanceDashboardComponent },
  { path: 'profile', component: ProfileComponent },
  {
  path: 'employee',
  children: [
    { path: 'personal', component: EmployeePersonalDetailsComponent },
    { path: 'family', component: EmployeeFamilyDetailsComponent },
    { path: 'emergency', component: EmployeeEmergencyContactComponent },
    { path: 'reference', component: EmployeeReferencesComponent }
  ]
},
  { path: 'digitalbusiness', component: DigitalBusinessCardComponent },
  { path: 'details', component: EmployeeDetailsComponent },
  { path: 'emergency', component: EmployeeEmergencyContactComponent },
{ path: 'references', component: EmployeeReferencesComponent },
{ path: 'skills', component: EmployeeSkillsComponent },
{ path: 'documents', component: EmployeeDocumentsComponent },
{ path: 'finance', component: EmployeeFinanceComponent },
{ path: 'resignation', component: EmployeeResignationComponent },
{ path: 'immigration', component: EmployeeImmigrationComponent },
{ path: 'clockin-out', component: ClockinClockoutComponent },
{ path: 'shift-allocation', component: ShiftAllocationComponent },
{ path: 'daily-working-hours', component: DailyWorkingHoursComponent },
{ path: 'late-arrivals', component: LateArrivalsComponent },
{ path: 'early-departures', component: EarlyDeparturesComponent },
{ path: 'wfh-remote-request', component: WfoRemoteRequestComponent },
{ path: 'missed-punch-request', component: MissedPunchRequestComponent },
{ path: 'leave-management', component: LeaveManagementComponent },
{ path: 'expenses', component: ExpenseManagementComponent },
{ path: 'asset', component: AssetManagementComponent },
{ path: 'timesheet', component: TimesheetManagementComponent },
{ path: 'kpi-performance', component: KpiPerformanceComponent },
{ path: 'help-desk', component: HelpDeskManagementComponent },
{ path: 'company-news', component: ComanyNewsComponent },
{ path: 'company-policies', component: EmployeePolicyComponent },
{ path: 'my-team', component: MyTeamHierarchyComponent },
{ path: 'my-event', component: MyEventsComponent },
{
  path: 'compensation',
  component: CompensationComponent,
  children: [
    { path: '', redirectTo: 'employee-payslip', pathMatch: 'full' },

    { path: 'employee-payslip', component: EmployeePayslipComponent },
    { path: 'hr-payslip', component: HrPayslipComponent }
  ]
},
 { path: 'superadmin-template', component: SuperAdminLayoutComponent},
{ path: 'recruitment', component: RecruitmentProcessComponent },
{path:'superadmin-dashboard',component:SuperAdminLayoutComponent},
{ path: 'attendance-list', component: AttendanceListComponent },
{ path: 'my-calendar', component: MyCalendarComponent },
{ path: 'financedashboard', component: FinanceDashboardComponent },
{ path: 'managerdashboard', component: ManagerDashboardComponent },
{ path: 'empdashboard', component: EmployeeDashboardComponent },
{ path: 'demo-users', component: SuperAdminDemousersComponent },
{ path: 'subscription-plans', component: SubscriptionPlansComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
