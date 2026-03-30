import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
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
import { MatTabsModule } from '@angular/material/tabs';
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
import { AccessControlComponent } from './pages/system-security/access-control/access-control.component';
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
import { HttpClientModule } from '@angular/common/http';
import { CommonUploadComponent } from './shared/common-upload/common-upload.component';
import { SubmenuComponent } from './layout/submenu/submenu.component';
import { WelcomedemoComponent } from './pages/welcomedemo/welcomedemo.component';
import { ShiftsComponent } from './pages/shifts/shifts.component';
import { ResignationmasterComponent } from './master/resignationmaster/resignationmaster.component';
import { InterviewLevelComponent } from './pages/master/interview-level/interview-level.component';
import { RecruitmentNoticePeriodComponent } from './pages/master/recruitment-notice-period/recruitment-notice-period.component';
import { ScreeningResultComponent } from './pages/master/screening-result/screening-result.component';
import { CompanyEventsComponent } from './pages/company-events/company-events.component';
import { CompanyNewsCategoryComponent } from './company-news-category/company-news-category.component';
import { EmploymentTypeComponent } from './pages/master/employment-type/employment-type.component';
import { GradeComponent } from './pages/master/grade/grade.component';
import { AssetTypeComponent } from './pages/master/asset-type/asset-type.component';
import { AssetCategoryComponent } from './pages/master/asset-category/asset-category.component';
import { CurrencyComponent } from './pages/master/currency/currency.component';

@NgModule({
  declarations: [
    TopbarComponent,
    SidebarComponent,
    FooterComponent,
    AdminDashboardComponent,
    BloodGroupMasterComponent,
    AdminLayoutComponent,
    GenderComponent,
    MaritalStatusComponent,
    RolesPermissionsComponent,
    
    ApprovalWorkflowComponent,
    LeavePolicyComponent,
    AttendanceSettingComponent,
    PayrollSettingsComponent,
    NotificationSettingsComponent,
    SmsTemplatesComponent,
    PushNotificationsComponent,
    SmtpSettingsComponent,
    NotificationLogComponent,

    TaxSettingsComponent,
    
    PayslipTemplateComponent,
    EmployeeComponent,
    DepartmentComponent,
    DesignationComponent,
    LocationComponent,
    RelationshipComponent,
    CertificationTypeComponent,
    PolicyCategoryComponent,
    KpiCategoryComponent,
    AttachmentTypeComponent,
    ProjectStatusComponent,
    AssetStatusComponent,
    HelpdeskCategoryComponent,
    ExpenseCategoryComponent,
    ExpenseStatusComponent,
    LeaveTypeComponent,
    LeaveStatusComponent,
    AttendanceStatusComponent,
    HolidayCalendarComponent,
    UserManagementComponent,
    AuditLogComponent,
    AccessControlComponent,
    SystemLogComponent,
    RequiredFieldsComponent,
    GeneralConfigurationComponent,
    AttendanceConfigurationComponent,
    TimesheetConfigurationComponent,
    MobileAppConfigurationComponent,
    CompanyNewsComponent,
    CompanyPoliciesComponent,
    HierarchyConfigurationComponent,
    EventsConfigurationComponent,
    CompanyComponent,
    RegionComponent,
    UsersComponent,
    MenusComponent,
    CommonUploadComponent,
    SubmenuComponent,
    WelcomedemoComponent,
    ShiftsComponent,
    ResignationmasterComponent,
    InterviewLevelComponent,
    RecruitmentNoticePeriodComponent,
    ScreeningResultComponent,
    CompanyEventsComponent,
    CompanyNewsCategoryComponent,
    EmploymentTypeComponent,
    GradeComponent,
    AssetTypeComponent,
    AssetCategoryComponent,
    CurrencyComponent
 
  

  ],
  imports: [
    CommonModule,ReactiveFormsModule,FormsModule,
    AdminRoutingModule,MatTabsModule,HttpClientModule
  ],
 
})
export class AdminModule { }
