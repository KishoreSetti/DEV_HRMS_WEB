import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/login/login/login.component';
import { LayoutComponent } from './features/layout/layout/layout.component';
import { HeaderComponent } from './features/header/header.component';
import { SidebarComponent } from './features/sidebar/sidebar.component';
import { FooterComponent } from './features/footer/footer.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/employee-profile/profile/profile.component';
import { DigitalBusinessCardComponent } from './features/employee-profile/digital-business-card/digital-business-card.component';
import { EmployeeDetailsComponent } from './features/employee-profile/employee-details/employee-details.component';
import { EmployeePersonalDetailsComponent } from './features/employee-profile/employee-details/employee-personal-details/employee-personal-details.component';
import { EmployeeFamilyDetailsComponent } from './features/employee-profile/employee-details/employee-family-details/employee-family-details.component';
import { EmployeeEmergencyContactComponent } from './features/employee-profile/employee-emergency-contact/employee-emergency-contact.component';
import { EmployeeReferencesComponent } from './features/employee-profile/employee-references/employee-references.component';
import { FormsModule } from '@angular/forms';
import { ManagerDashboardComponent } from './features/auth/manager-dashboard/manager-dashboard.component';
import { FinanceDashboardComponent } from './features/auth/finance-dashboard/finance-dashboard.component';
import { EmployeeDashboardComponent } from './features/auth/employee-dashboard/employee-dashboard.component';
import { NavbarHrComponent } from './hr/layout/navbar-hr/navbar-hr.component';
import { NavbarHrLayoutComponent } from './hr/layout/navbar-hr-layout/navbar-hr-layout.component';
import { NavbarManagerComponent } from './manager/layout/navbar-manager/navbar-manager.component';
import { NavbarManagerLayoutComponent } from './manager/layout/navbar-manager-layout/navbar-manager-layout.component';
import { NavbarEmployeeComponent } from './employee/layout/navbar-employee/navbar-employee.component';
import { NavbarEmployeeLayoutComponent } from './employee/layout/navbar-employee-layout/navbar-employee-layout.component';
import { NavbarFinanceComponent } from './finance/layout/navbar-finance/navbar-finance.component';
import { NavbarFinanceLayoutComponent } from './finance/layout/navbar-finance-layout/navbar-finance-layout.component';
import { NavbarHeaderEmployeeComponent } from './employee/layout/navbar-header-employee/navbar-header-employee.component';
import { NavbarFooterEmployeeComponent } from './employee/layout/navbar-footer-employee/navbar-footer-employee.component';
import { EmployeeSkillsComponent } from './features/employee-profile/employee-skills/employee-skills.component';
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
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonUploadComponent } from './shared/common-upload/common-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LocationStrategy,HashLocationStrategy } from '@angular/common';
import { EmployeeCertificationsComponent } from './features/employee-profile/employee-skills/employee-certifications/employee-certifications.component';
import { EmployeeEducationComponent } from './features/employee-profile/employee-skills/employee-education/employee-education.component';
import { EmployeeJobhistoryComponent } from './features/employee-profile/employee-skills/employee-jobhistory/employee-jobhistory.component';
import { EmployeeDocumentComponent } from './features/employee-profile/employee-documents/employee-document/employee-document.component';
import { EmployeeFormsComponent } from './features/employee-profile/employee-documents/employee-forms/employee-forms.component';
import { EmployeeLettersComponent } from './features/employee-profile/employee-documents/employee-letters/employee-letters.component';
import { EmployeeBankDetailsComponent } from './features/employee-profile/employee-finance/employee-bank-details/employee-bank-details.component';
import { EmployeeDdDetailsComponent } from './features/employee-profile/employee-finance/employee-dd-details/employee-dd-details.component';
import { EmployeeW4DetailsComponent } from './features/employee-profile/employee-finance/employee-w4-details/employee-w4-details.component';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ApplyLeaveComponent } from './features/leave/apply-leave/apply-leave.component';
import { LeaveApprovalsComponent } from './features/leave/leave-approvals/leave-approvals.component';
import { LeaveCalendarComponent } from './features/leave/leave-calendar/leave-calendar.component';
import { AllExpensesComponent } from './features/expenses/all-expenses/all-expenses.component';
import { ApproveExpensesComponent } from './features/expenses/approve-expenses/approve-expenses.component';
import { CreateExpensesComponent } from './features/expenses/create-expenses/create-expenses.component';
import { EmployeeKpiSubmissionComponent } from './features/performance/employee-kpi-submission/employee-kpi-submission.component';
import { ManagerKpiReviewComponent } from './features/performance/manager-kpi-review/manager-kpi-review.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { StrongPasswordDirective } from "./admin/layout/models/strong-password.directive";
import { AddAssetsComponent } from './features/asset/add-assets/add-assets.component';
import { AssetApprovalComponent } from './features/asset/asset-approval/asset-approval.component';
import { MyAssetComponent } from './features/asset/my-asset/my-asset.component';
import { TimesheetApplicationComponent } from './features/timesheet/timesheet-application/timesheet-application.component';
import { TimesheetApprovalComponent } from './features/timesheet/timesheet-approval/timesheet-approval.component';
import { AppointmentComponent } from './features/recruitment/appointment/appointment.component';
import { InterviewComponent } from './features/recruitment/interview/interview.component';
import { OfferComponent } from './features/recruitment/offer/offer.component';
import { OnboardingComponent } from './features/recruitment/onboarding/onboarding.component';
import { ResumeUploadComponent } from './features/recruitment/resume-upload/resume-upload.component';
import { ScreeningComponent } from './features/recruitment/screening/screening.component';
import { EmployeeResignationHrApprovalComponent } from './features/employee-profile/employee-resignation/employee-resignation-hr-approval/employee-resignation-hr-approval.component';
import { EmployeeResignationManagerApprovalComponent } from './features/employee-profile/employee-resignation/employee-resignation-manager-approval/employee-resignation-manager-approval.component';
import { EmployeeResignationDetailsComponent } from './features/employee-profile/employee-resignation/employee-resignation-details/employee-resignation-details.component';
import { ApproveTicketsComponent } from './features/helpdesk/approve-tickets/approve-tickets.component';
import { MyTicketsComponent } from './features/helpdesk/my-tickets/my-tickets.component';
import { RaiseTicketComponent } from './features/helpdesk/raise-ticket/raise-ticket.component';
import { PriorityComponent } from './pages/master/priority/priority.component';
import { HolidayListComponent } from './pages/master/holiday-list/holiday-list.component';
import { WeekOffComponent } from './pages/master/week-off/week-off.component';
import { PayGroupsComponent } from './pages/payroll/pay-groups/pay-groups.component';
import { EarningDeductionsComponent } from './pages/payroll/earning-deductions/earning-deductions.component';
import { ForgotPasswordComponent } from './features/login/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/login/reset-password/reset-password.component';
import { VerifyOtpComponent } from './features/login/verify-otp/verify-otp.component';
import { CompanyEventsComponent } from './features/company-events/company-events/company-events.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SuperAdminTopbarComponent } from './superAdmin/super-admin-topbar/super-admin-topbar.component';
import { SuperAdminSidebarComponent } from './superAdmin/super-admin-sidebar/super-admin-sidebar.component';
import { SuperAdminSubmenuComponent } from './superAdmin/super-admin-submenu/super-admin-submenu.component';
import { SuperAdminLayoutComponent } from './superAdmin/super-admin-layout/super-admin-layout.component';
import { SuperAdminFooterComponent } from './superAdmin/super-admin-footer/super-admin-footer.component';
import { AttendanceListComponent } from './features/attendance/attendance-list/attendance-list.component';
import { MainUsersComponent } from './main-users/main-users.component';
import { SuperAdminDashboardComponent } from './superAdmin/super-admin-dashboard/super-admin-dashboard.component';
import { SuperAdminDemousersComponent } from './superAdmin/super-admin-demousers/super-admin-demousers.component';
import { SubscriptionPlansComponent } from './superAdmin/subscription-plans/subscription-plans.component';
import { SpinnerInterceptor } from './admin/shared/interceptor.interceptor';
import { SpinnerComponent } from './spinner/spinner.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    SpinnerComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DashboardComponent,
    ProfileComponent,
    DigitalBusinessCardComponent,
    EmployeeDetailsComponent,
    EmployeePersonalDetailsComponent,
    EmployeeFamilyDetailsComponent,
    EmployeeEmergencyContactComponent,
    EmployeeReferencesComponent,
    ManagerDashboardComponent,
    FinanceDashboardComponent,
    EmployeeDashboardComponent,
    NavbarHrComponent,
    NavbarHrLayoutComponent,
    NavbarManagerComponent,
    NavbarManagerLayoutComponent,
    NavbarEmployeeComponent,
    NavbarEmployeeLayoutComponent,
    NavbarFinanceComponent,
    NavbarFinanceLayoutComponent,
    NavbarHeaderEmployeeComponent,
    NavbarFooterEmployeeComponent,
    EmployeeSkillsComponent,
    EmployeeDocumentsComponent,
    EmployeeFinanceComponent,
    EmployeeResignationComponent,
    EmployeeImmigrationComponent,
    ClockinClockoutComponent,
    ShiftAllocationComponent,
    DailyWorkingHoursComponent,
    LateArrivalsComponent,
    EarlyDeparturesComponent,
    WfoRemoteRequestComponent,
    MissedPunchRequestComponent,
    LeaveManagementComponent,
    ExpenseManagementComponent,
    AssetManagementComponent,
    TimesheetManagementComponent,
    KpiPerformanceComponent,
    HelpDeskManagementComponent,
    ComanyNewsComponent,
    EmployeePolicyComponent,
    MyTeamHierarchyComponent,
    MyCalendarComponent,
    MyEventsComponent,
    CompensationComponent,
    RecruitmentProcessComponent,
    CommonUploadComponent,
    EmployeeCertificationsComponent,
    EmployeeEducationComponent,
    EmployeeJobhistoryComponent,
    EmployeeDocumentComponent,
    EmployeeFormsComponent,
    EmployeeLettersComponent,
    EmployeeBankDetailsComponent,
    EmployeeDdDetailsComponent,
    EmployeeW4DetailsComponent,
    ApplyLeaveComponent,
    LeaveApprovalsComponent,
    LeaveCalendarComponent,
    AllExpensesComponent,
    ApproveExpensesComponent,
    CreateExpensesComponent,
    EmployeeKpiSubmissionComponent,
    ManagerKpiReviewComponent,
    ChangePasswordComponent,
    AddAssetsComponent,
    AssetApprovalComponent,
    MyAssetComponent,
    TimesheetApplicationComponent,
    TimesheetApprovalComponent,
    AppointmentComponent,
    InterviewComponent,
    OfferComponent,
    OnboardingComponent,
    ResumeUploadComponent,
    ScreeningComponent,
    EmployeeResignationHrApprovalComponent,
    EmployeeResignationManagerApprovalComponent,
    EmployeeResignationDetailsComponent,
    ApproveTicketsComponent,
    MyTicketsComponent,
    RaiseTicketComponent,
    PriorityComponent,
    HolidayListComponent,
    WeekOffComponent,
    PayGroupsComponent,
    EarningDeductionsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    VerifyOtpComponent,
    CompanyEventsComponent,
    SuperAdminTopbarComponent,
    SuperAdminSidebarComponent,
    SuperAdminSubmenuComponent,
    SuperAdminLayoutComponent,
    SuperAdminFooterComponent,
    AttendanceListComponent,
    MainUsersComponent,
    SuperAdminDashboardComponent,
    
    SuperAdminDemousersComponent,
          SubscriptionPlansComponent,
   
    
    
  ],
  imports: [
    BrowserModule, ReactiveFormsModule,FullCalendarModule,
    AppRoutingModule, FormsModule, HttpClientModule, NgxSpinnerModule,
    StrongPasswordDirective,
],

  providers: [
    provideClientHydration(withEventReplay()),
   {provide: LocationStrategy, useClass: HashLocationStrategy},
   {
    provide: HTTP_INTERCEPTORS,
    useClass: SpinnerInterceptor,
    multi: true
  },
     { provide: MAT_DATE_FORMATS, useValue: {
    parse: { dateInput: 'DD/MM/YYYY' },
    display: { dateInput: 'DD/MM/YYYY' }
  }}

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
