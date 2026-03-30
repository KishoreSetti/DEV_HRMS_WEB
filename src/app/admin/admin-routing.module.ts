import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../features/layout/layout/layout.component';
import { AdminDashboardComponent } from './layout/admin-dashboard/admin-dashboard.component';
import { BloodGroupMasterComponent } from './pages/blood-group-master/blood-group-master.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { GenderComponent } from './pages/gender/gender.component';
import { MaritalStatusComponent } from './pages/marital-status/marital-status.component';
import { RolesPermissionsComponent } from './pages/roles-permissions/roles-permissions.component';
import { ApprovalWorkflowComponent } from './pages/approval-workflow/approval-workflow.component';
import { LeavePolicyComponent } from './pages/leave-policy/leave-policy.component';
import { AttendanceSettingComponent } from './pages/attendance-setting/attendance-setting.component';
import { PayrollSettingsComponent } from './pages/payroll-settings/payroll-settings.component';
import { NotificationSettingsComponent } from './pages/notification-settings/notification-settings.component';
import { SmsTemplatesComponent } from './pages/sms-templates/sms-templates.component';
import { PushNotificationsComponent } from './pages/push-notifications/push-notifications.component';
import { SmtpSettingsComponent } from './pages/smtp-settings/smtp-settings.component';
import { NotificationLogComponent } from './pages/notification-log/notification-log.component';
import { TaxSettingsComponent } from './pages/payroll/tax-settings/tax-settings.component';
import { PayslipTemplateComponent } from './pages/payroll/payslip-template/payslip-template.component';
import { EmployeeComponent } from './pages/master/employee/employee.component';
import { DepartmentComponent } from './pages/master/department/department.component';
import { DesignationComponent } from './pages/master/designation/designation.component';
import { LocationComponent } from './pages/master/location/location.component';
import { RelationshipComponent } from './pages/master/relationship/relationship.component';
import { CertificationTypeComponent } from './pages/master/certification-type/certification-type.component';
import { PolicyCategoryComponent } from './pages/master/policy-category/policy-category.component';
import { KpiCategoryComponent } from './pages/master/kpi-category/kpi-category.component';
import { AttachmentTypeComponent } from './pages/master/attachment-type/attachment-type.component';
import { ProjectStatusComponent } from './pages/master/project-status/project-status.component';
import { AssetStatusComponent } from './pages/master/asset-status/asset-status.component';
import { HelpdeskCategoryComponent } from './pages/master/helpdesk-category/helpdesk-category.component';
import { ExpenseCategoryComponent } from './pages/master/expense-category/expense-category.component';
import { ExpenseStatusComponent } from './pages/master/expense-status/expense-status.component';
import { LeaveTypeComponent } from './pages/master/leave-type/leave-type.component';
import { LeaveStatusComponent } from './pages/master/leave-status/leave-status.component';
import { AttendanceStatusComponent } from './pages/master/attendance-status/attendance-status.component';
import { HolidayCalendarComponent } from './pages/master/holiday-calendar/holiday-calendar.component';
import { UserManagementComponent } from './pages/system-security/user-management/user-management.component';
import { AuditLogComponent } from './pages/system-security/audit-log/audit-log.component';
import { SystemLogComponent } from './pages/system-security/system-log/system-log.component';
import { RequiredFieldsComponent } from './pages/system-security/required-fields/required-fields.component';
import { GeneralConfigurationComponent } from './pages/configuration/general-configuration/general-configuration.component';
import { AttendanceConfigurationComponent } from './pages/configuration/attendance-configuration/attendance-configuration.component';
import { TimesheetConfigurationComponent } from './pages/configuration/timesheet-configuration/timesheet-configuration.component';
import { MobileAppConfigurationComponent } from './pages/configuration/mobile-app-configuration/mobile-app-configuration.component';
import { CompanyNewsComponent } from './system-security/company-news/company-news.component';
import { CompanyPoliciesComponent } from './system-security/company-policies/company-policies.component';
import { HierarchyConfigurationComponent } from './configuration/hierarchy-configuration/hierarchy-configuration.component';
import { EventsConfigurationComponent } from './configuration/events-configuration/events-configuration.component';
import { CompanyComponent } from './master/company/company.component';
import { RegionComponent } from './master/region/region.component';
import { UsersComponent } from './master/users/users.component';
import { MenusComponent } from './master/menus/menus.component';
import { EmployeeBankDetailsComponent } from '../features/employee-profile/employee-finance/employee-bank-details/employee-bank-details.component';
import { PriorityComponent } from '../pages/master/priority/priority.component';
import { HolidayListComponent } from '../pages/master/holiday-list/holiday-list.component';
import { WeekOffComponent } from '../pages/master/week-off/week-off.component';
import { ShiftsComponent } from './pages/shifts/shifts.component';
import { PayGroupsComponent } from '../pages/payroll/pay-groups/pay-groups.component';
import { EarningDeductionsComponent } from '../pages/payroll/earning-deductions/earning-deductions.component';
import { ResignationmasterComponent } from './master/resignationmaster/resignationmaster.component';
import { InterviewLevelComponent } from './pages/master/interview-level/interview-level.component';
import { ScreeningResultComponent } from './pages/master/screening-result/screening-result.component';
import { RecruitmentNoticePeriodComponent } from './pages/master/recruitment-notice-period/recruitment-notice-period.component';
import { CompanyEventsComponent } from './pages/company-events/company-events.component';
import { CompanyNewsCategoryComponent } from './company-news-category/company-news-category.component';
import { EmploymentTypeComponent } from './pages/master/employment-type/employment-type.component';
import { GradeComponent } from './pages/master/grade/grade.component';
import { AssetTypeComponent } from './pages/master/asset-type/asset-type.component';
import { AssetCategoryComponent } from './pages/master/asset-category/asset-category.component';
import { CurrencyComponent } from './pages/master/currency/currency.component';
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,  // Layout wraps all admin pages
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },

      { path: 'blood-group', component: BloodGroupMasterComponent },
      { path: 'gender', component: GenderComponent },
      { path: 'marital-status', component: MaritalStatusComponent },
      { path: 'roles-permission', component: RolesPermissionsComponent },
      { path: 'approval-workflow', component: ApprovalWorkflowComponent },
      { path: 'leave-policy', component: LeavePolicyComponent },
      { path: 'shift-setting', component: AttendanceSettingComponent },
      { path: 'payroll-setting', component: PayrollSettingsComponent },
      { path: 'notification-setting', component: NotificationSettingsComponent },
      { path: 'sms-template', component: SmsTemplatesComponent },
      { path: 'push-notification', component: PushNotificationsComponent },
      { path: 'smtp-settings', component: SmtpSettingsComponent },
      { path: 'notification-log', component: NotificationLogComponent },
      { path: 'earning-deductions', component: EarningDeductionsComponent },
      { path: 'tax-settings', component: TaxSettingsComponent },
      { path: 'pay-groups', component: PayGroupsComponent },
      { path: 'payslip-template', component: PayslipTemplateComponent },
      { path: 'employee', component: EmployeeComponent },
      { path: 'department', component: DepartmentComponent },
      { path: 'designation', component: DesignationComponent },
      { path: 'location', component: LocationComponent },
      { path: 'relationship', component: RelationshipComponent },
      { path: 'certification-type', component: CertificationTypeComponent },
      { path: 'policy-category', component: PolicyCategoryComponent },
      { path: 'kpi-category', component: KpiCategoryComponent },
      { path: 'attachment-type', component: AttachmentTypeComponent },
      { path: 'project-status', component: ProjectStatusComponent },
      { path: 'asset-status', component: AssetStatusComponent },
      { path: 'helpdesk-category', component: HelpdeskCategoryComponent },
      { path: 'expense-category', component: ExpenseCategoryComponent },
      { path: 'expense-status', component: ExpenseStatusComponent },
      { path: 'leave-type', component: LeaveTypeComponent },
      { path: 'leave-status', component: LeaveStatusComponent },
      { path: 'attendance-status', component: AttendanceStatusComponent },
      { path: 'holiday-calendar', component: HolidayCalendarComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'audit-log', component: AuditLogComponent },
      { path: 'system-log', component: SystemLogComponent },
      { path: 'required-fields', component: RequiredFieldsComponent },
      { path: 'general-configuration', component: GeneralConfigurationComponent },
      { path: 'attendance-configuration', component: AttendanceConfigurationComponent },
      { path: 'timesheet-configuration', component: TimesheetConfigurationComponent },
      { path: 'mobileapp-configuration', component: MobileAppConfigurationComponent },
      { path: 'company-news', component: CompanyNewsComponent },
      { path: 'company-policies', component: CompanyPoliciesComponent },
      { path: 'hierarchy-config', component: HierarchyConfigurationComponent },
      { path: 'events-config', component: EventsConfigurationComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'region', component: RegionComponent },
      { path: 'users', component: UsersComponent },
      { path: 'menumaster', component: MenusComponent },
      { path: 'bank-details', component: EmployeeBankDetailsComponent },
      { path: 'priority', component: PriorityComponent },
      { path: 'holiday-list', component: HolidayListComponent },
      { path: 'week-off', component: WeekOffComponent },
      { path: 'shifts', component: ShiftsComponent },
      { path: 'resignationmaster', component: ResignationmasterComponent },
      { path: 'recruitment-notice-period', component: RecruitmentNoticePeriodComponent },
      { path: 'screening-result', component: ScreeningResultComponent },
      { path: 'interview-level', component: InterviewLevelComponent },
      { path: 'company-events', component: CompanyEventsComponent },
      { path: 'company-news-category', component: CompanyNewsCategoryComponent },
      // Add more admin pages here

      { path: 'employment-type', component: EmploymentTypeComponent },
      { path: 'grade', component: GradeComponent },
      { path: 'asset-type', component: AssetTypeComponent },
      { path: 'asset-category', component: AssetCategoryComponent },
      { path: 'currency', component: CurrencyComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
