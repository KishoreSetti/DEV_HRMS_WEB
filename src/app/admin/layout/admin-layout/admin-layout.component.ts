import { Component } from '@angular/core';
import { Router } from '@angular/router';

export interface Submenu {
  title: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  isSidebarCollapsed = false;
  selectedSubmenus: Submenu[] = [];
  activeRoute: string = '';
  activeMenu: string = '';
  selectedMenu: string = '';

  menuMap: Record<string, Submenu[]> = {
     '  ': [],
    'Master Data': [
      { title: 'Company', route: '/admin/company' },
      { title: 'Region', route: '/admin/region' },
      { title: 'Menu Master', route: '/admin/menumaster' },
      { title: 'Roles & Permissions', route: '/admin/roles-permission' },
      { title: 'Department', route: '/admin/department' },
      { title: 'User Management', route: '/admin/users' },     
      { title: 'Designation', route: '/admin/designation' },
      { title: 'Gender', route: '/admin/gender' },
      { title: 'Blood Group', route: '/admin/blood-group' },
      { title: 'Marital Status', route: '/admin/marital-status' },
      { title: 'Relationship', route: '/admin/relationship' },
      { title: 'Certification Type', route: '/admin/certification-type' },
      { title: 'Policy Category', route: '/admin/policy-category' },
     // { title: 'KPI Category', route: '/admin/kpi-category' },
      { title: 'Attachment Type', route: '/admin/attachment-type' },
      { title: 'Project Status', route: '/admin/project-status' },
      { title: 'Asset Status', route: '/admin/asset-status' },
      { title: 'Help Desk Category', route: '/admin/helpdesk-category' },
      { title: 'Expense Category Type', route: '/admin/expense-category' },
    //  { title: 'Expense Status', route: '/admin/expense-status' },
      { title: 'Leave Type', route: '/admin/leave-type' },
       { title: 'Leave Status', route: '/admin/leave-status' },
      { title: 'Attendance Status', route: '/admin/attendance-status' },
        { title: 'Ticket priority', route: '/admin/priority' },
         { title: 'Holiday List', route: '/admin/holiday-list' },
      { title: 'Week-Off', route: '/admin/week-off' },
      { title: 'Shifts', route: '/admin/shifts' },
       { title: 'Resignation Master', route: '/admin/resignationmaster' },
       { title: 'My Team Configuration', route: '/admin/hierarchy-config' },
         { title: 'Recruitment Notice Period', route: '/admin/recruitment-notice-period' }, 
       { title: 'Screnning Result', route: '/admin/screening-result' },
       { title: 'Interview Level', route: '/admin/interview-level' },
     { title: 'company-news-category', route: '/admin/company-news-category' },
     { title: 'EmploymentType', route: '/admin/employment-type'},
     { title: 'Grade', route: '/admin/grade'},
     { title: 'Asset Type', route: '/admin/asset-type'},
     { title: 'Asset Category', route: '/admin/asset-category'},
     { title: 'Currency', route: '/admin/currency'}
    ],  
    // 'Configuration': [
    //   { title: 'Approval Workflows', route: '/admin/approval-workflow' },
    //   { title: 'Shift Settings', route: '/admin/shift-setting' },
    //   { title: 'Payroll Settings', route: '/admin/payroll-setting' },
    //   { title: 'Leave Policy', route: '/admin/Leave-policy' },
    //   { title: 'Notification Settings', route: '/admin/notification-setting' },
    //   { title: 'General Configuration', route: '/admin/general-configuration' },
    //   { title: 'Attendance Configuration', route: '/admin/attendance-configuration' },
    //   { title: 'Timesheet Configuration', route: '/admin/timesheet-configuration' },
    //   { title: 'Mobile App Configuration', route: '/admin/mobileapp-configuration' },
    //   { title: 'My Team Configuration', route: '/admin/hierarchy-config' },
    //   { title: 'Events Configuration', route: '/admin/events-config' },
    // ],
    // 'Email & Notification': [
    //   { title: 'Email Templates', route: '#' },
    //   { title: 'SMS Templates', route: '/admin/sms-template' },
    //   { title: 'Push Notifications', route: '/admin/push-notification' },
    //   { title: 'SMTP Settings', route: '/admin/smtp-settings' },
    //   { title: 'Notification Logs', route: '/admin/notification-log' },
    // ],
    // 'Payroll': [
    //   { title: 'Earnings & Deductions', route: '/admin/earning-deductions' },
    //     { title: 'Salary Structures', route: '/admin/tax-settings' },
    //   { title: 'Assign Salary', route: '/admin/pay-groups' }
    //   // { title: 'Payrolls', route: '/admin/payslip-template' },
    // ],
    'System & Security': [
      // { title: 'Audit Logs', route: '/admin/audit-log' },
      // { title: 'System Logs', route: '/admin/system-log' },
      { title: 'Company News', route: '/admin/company-news' },
      { title: 'Company Policies', route: '/admin/company-policies' },
      { title: 'Company Events', route: '/admin/company-events' }

    ],
    // 'Reports': [
    //   { title: 'Custom Reports', route: '#' },
    //   { title: 'Dashboard Widgets', route: '/admin/dashboardwidgets' },
    // ]
  };

  constructor(private router: Router) {}
 toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // ✅ Called when a sidebar menu is clicked
  onMenuSelected(menuName: string) {
    if (this.selectedMenu === menuName) return; // avoid reload same menu

    this.activeMenu = menuName;
    this.selectedMenu = menuName;
    this.selectedSubmenus = []; // clear first to force UI refresh

    setTimeout(() => {
      // Load the new submenu after clearing
      this.selectedSubmenus = this.menuMap[menuName] || [];

      // Navigate to first submenu automatically
      if (this.selectedSubmenus.length) {
        const firstRoute = this.selectedSubmenus[0].route;
        this.activeRoute = firstRoute;
        if (firstRoute !== '#') {
          this.router.navigate([firstRoute]);
        }
      }
    }, 0);
  }

  // ✅ Called when a submenu is clicked
  onSubmenuSelected(route: string) {
    this.activeRoute = route;
    if (route && route !== '#') {
      this.router.navigate([route]);
    }
  }
}
