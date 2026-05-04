export interface EmployeeResignation {
  resignationId?: number | undefined;        // Auto-increment primary key
  employeeId?: string;           // Changedg to string (varchar)
  resignationType?: string;
  noticePeriod?: string;
  lastWorkingDay?: string;       // Use string for date binding in Angular
  resignationReason?: string;
  status?: string;
  createdBy?: string;
  createdAt?: string;            // string => ISO date format from API
  modifiedBy?: string;
  modifiedAt?: string;
  companyId?: number;
  regionId?: number;
  userId?: number;
  employeeCode?: number; 
    // ✅ ADD THESE
  managerComments?: string;
  managerApprovedDate?: Date;
  managerRejectedDate?: Date;
  // UI-only fields
  approveChecked?: boolean;
  rejectChecked?: boolean;

    managerReason?: string;
  hrReason?: string;
   hrEmail?: string;  // New field for HR email
}