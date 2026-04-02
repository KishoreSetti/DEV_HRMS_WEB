import { Component, OnInit } from '@angular/core';
import { LeaveRequest } from '../../../admin/layout/models/apply-leave.model';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-apply-leave',
  standalone: false,
  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.css'
})
export class ApplyLeaveComponent {
// startDate: string = "";
//   endDate: string = "";
//   totalDays: number = 0;
//   today: string = "";
//   startDateError: string = "";
//   endDateError: string = "";
//   reason: string = "";
//   leaveType: string = "";
//   selectedFileName: string = "";
//   reportingManager: string = '';
//   isHalfDay: boolean = false;
// weekoffDays: number[] = []; // store day numbers
//   // LEAVE COUNTS
//   sickTotal: number = 1;
//   casualTotal: number = 1;

//   sickUsed: number = 0;
//   casualUsed: number = 0;

//   sickAvailable: number = 0;
//   casualAvailable: number = 0;

//   leaveTypes: any[] = [];


//   userId!: number;
//   companyId!: number;
//   regionId!: number;
//   reportingManagerName: string = '';
//   reportingManagerId!: number;
//   selectedFile!: File | null;

//   // Sorting
//   sortColumn: keyof LeaveRequest | null = null;
//   sortDirection: 'asc' | 'desc' = 'asc';

//   // Pagination
//   pageSize = 5;
//   currentPage = 1;
//   pageSizeOptions = [5, 10, 20, 50];

//   // Filters
//   searchText = '';

//   // STATIC LEAVE LIST
//   leaveList: LeaveRequest[] = [];
//   selectedLeaveType: any = null;
//   availableLeaves: number = 0;
//   usedLeaves: number = 0;


//   ngOnInit(): void {
//     this.today = this.formatDate(new Date());
//     //   this.leaveList = [];
//     // this.calculateLeaveSummary();
//     //  this.loadLeaveTypes();
//     // this.loadMyLeaves();

//     this.userId = Number(sessionStorage.getItem("UserId"));
//     this.companyId = Number(sessionStorage.getItem("CompanyId"));
//     this.regionId = Number(sessionStorage.getItem("RegionId"));

//     if (!this.userId) {
//       console.error("UserId missing in sessionStorage");
//       return;
//     }
//     this.leaveList = [];
//     this.calculateLeaveSummary();
//     this.loadLeaveTypes();
//     this.loadMyLeaves();
//     this.loadReportingManager();
//  this.loadWeekoffs();
//   }

//   constructor(private leaveService: EmployeeResignationService, private userService: AdminService) { }

//   validateLeaveLimit() {
//     let available = 0;
// debugger;
//     if (this.leaveType === "Sick Leave") {
//       available = this.sickAvailable;
//     }

//     if (this.leaveType === "Casual Leave") {
//       available = this.casualAvailable;
//     }
//      this.leavedays= this.leaveList.reduce((sum, l) => sum + l.totalDays, 0);


//     // If half day -> allow only if available >= 0.5
//     if (this.isHalfDay) {
//       if (this.availableLeaves < 0.5) {
//         Swal.fire("Not Allowed", "You do not have enough leave balance.", "warning");
//         this.totalDays = 0;
//         this.endDate = "";
//       }
//       return;
//     }

//     // If applying full leave days
//     if (this.totalDays > this.availableLeaves) {
//       Swal.fire(
//         "Not Allowed",
//         `You only have ${this.availableLeaves} days available.`,
//         "warning"
//       );

//       this.totalDays = 0;
//       this.endDate = "";
//     }
//   }

//   // FORMAT DATE
//   formatDate(date: Date): string {
//     return date.toISOString().split('T')[0];
//   }
//   loadReportingManager() {
//     if (!this.userId) return;

//     this.leaveService.getReportingManager(this.userId).subscribe({
//       next: (data: any) => {
//         console.log("Manager API response =>", data);

//         this.reportingManagerName = data.managerName;
//         this.reportingManagerId = data.managerId;
//       },
//       error: (err) => {
//         console.error('Reporting manager load error', err);
//       }
//     });
//   }

//   viewDocument(filePath: string | undefined): void {
//     if (!filePath) {
//       Swal.fire('Error', 'No file path available.', 'error');
//       return;
//     }

//     const fullPath = `${environment.apiUrl}${environment.leaveDocumentPath}${filePath}`;
//     window.open(fullPath, '_blank');
//   }



//   loadLeaveTypes() {
//     this.leaveService.getLeaveTypes(this.companyId, this.regionId).subscribe({
//       next: (data: any) => {
//         debugger;
//         this.leaveTypes = data ? data.data : [];

//         // Auto set total days
//         const sick = this.leaveTypes.find(x => x.leaveTypeName === 'Sick Leave');
//         const casual = this.leaveTypes.find(x => x.leaveTypeName === 'Casual Leave');

//         this.sickTotal = sick?.leaveDays || 0;
//         this.casualTotal = casual?.leaveDays || 0;

//         this.calculateLeaveSummary();
//       },
//       error: (err) => {
//         console.error('Leave types load error', err);
//       }
//     });
//   }
//   users: any;
//   loadUsers(): void {
//     this.userService.getAllUsers().subscribe({
//       next: (res: any) => {
//         this.users = res.map((u: any) => ({
//           ...u,
//           reportingTo: u.ReportingTo ?? 0  // ✅ map correct API field to frontend field
//         }));


//       },
//       error: () => this.showError('Failed to load users.')
//     });
//   }

//   showError(msg: string): void {
//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text: msg,
//       timer: 2500,
//       showConfirmButton: false
//     });
//   }

//   loadMyLeaves() {
//      this.leaveService.getMyLeaves(this.userId).subscribe({
//     next: (data) => {
//           console.log("API Response:", data); // 👈 check response

//       this.leaveList = data.map(x => ({
//         appliedDate: x.appliedDate,
//         leaveType: x.leaveTypeName || '',
//         fromDate: x.startDate,
//         toDate: x.endDate,

//         // ✅ FIX HERE
//         totalDays: x.totalDays ?? x.TotalDays,

//         reason: x.reason,
//         fileName: x.fileName,
//         status: x.status,
//         isHalfDay: x.isHalfDay ?? false
//       }));

//       this.calculateLeaveSummary();

//       if (this.leaveType) {
//         this.onLeaveTypeChange();
//       }

//     },
//     error: (err) => {
//       console.error("Load leaves failed", err);
//     }
//   });
//   }




//   onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.selectedFile = file;
//       this.selectedFileName = file.name;  // 👈 only file name saved
//     }
//   }
//   onHalfDayChange() {
//     if (this.isHalfDay) {
//       this.totalDays = 0.5;
//       this.validateLeaveLimit();
//       // If half day selected, force same date
//       if (this.startDate) {
//         this.endDate = this.startDate;
//       }
//     } else {
//       this.calculateTotalDays();
//     }
//   }

//   onLeaveTypeChange() {

//     // Get selected leave type object
//     this.selectedLeaveType = this.leaveTypes
//       .find(x => x.leaveTypeName === this.leaveType);

//     if (!this.selectedLeaveType) {
//       this.availableLeaves = 0;
//       return;
//     }

//     // Calculate used leaves for selected type
//     this.usedLeaves = this.leaveList
//       .filter(l => l.leaveType === this.leaveType)
//       .reduce((sum, l) => sum + l.totalDays, 0);
// debugger;
//     // Available = Total - Used
//     this.availableLeaves =
//       this.selectedLeaveType.leaveDays - this.usedLeaves;
//   }



//  leavedays:any;
//   calculateLeaveSummary() {
//     this.leavedays= this.leaveList.reduce((sum, l) => sum + l.totalDays, 0);
//     this.sickUsed = this.leaveList
//       .filter(l => l.leaveType === "Sick Leave")
//       .reduce((sum, l) => sum + l.totalDays, 0);

//     this.casualUsed = this.leaveList
//       .filter(l => l.leaveType === "Casual Leave")
//       .reduce((sum, l) => sum + l.totalDays, 0);

//     this.sickAvailable = this.sickTotal - this.sickUsed;
//     this.casualAvailable = this.casualTotal - this.casualUsed;
//   }


//   // START DATE CHANGE
//   onStartDateChange() {
//     this.calculateTotalDays();
//     this.validateLeaveLimit();

//     this.startDateError = "";

//     if (!this.startDate) return;
//     if (this.isWeekend(this.startDate)) {
//       this.startDateError = "Start date cannot be Saturday or Sunday.";
//       this.startDate = "";
//       this.totalDays = 0;
//       return;
//     }


//     if (this.isHalfDay) {
//       this.endDate = this.startDate;
//       this.totalDays = 0.5;
//       return;
//     }


//     if (this.startDate < this.today) {
//       this.startDateError = "Start date cannot be a past date.";
//       this.totalDays = 0;
//       return;
//     }

//     if (this.endDate && this.startDate > this.endDate) {
//       this.startDateError = "Start date cannot be later than end date.";
//       this.totalDays = 0;
//       return;
//     }

//     this.calculateTotalDays();
//   }

//   // END DATE CHANGE
//   onEndDateChange() {
//     this.calculateTotalDays();
//     this.validateLeaveLimit();

//     this.endDateError = "";

//     if (this.isWeekend(this.endDate)) {
//       this.endDateError = "End date cannot be Saturday or Sunday.";
//       this.endDate = "";
//       this.totalDays = 0;
//       return;
//     }

//     if (this.isHalfDay) {
//       this.endDate = this.startDate;
//       this.totalDays = 0.5;
//       return;
//     }


//     if (!this.endDate) return;

//     if (this.startDate && this.endDate < this.startDate) {
//       this.endDateError = "End date cannot be earlier than start date.";
//       this.totalDays = 0;
//       return;
//     }

//     this.calculateTotalDays();
//   }
//   isWeekend(dateString: string): boolean {
//     const date = new Date(dateString);
//     const day = date.getDay(); // 0 = Sunday, 6 = Saturday
//     return day === 0 || day === 6;
//   }


//   // TOTAL DAYS CALCULATION
//   calculateTotalDays() {

//     if (this.isHalfDay) {
//       this.totalDays = 0.5;
//       return;
//     }

//     if (!this.startDate || !this.endDate) {
//       this.totalDays = 0;
//       return;
//     }

//     const start = new Date(this.startDate);
//     const end = new Date(this.endDate);

//     let count = 0;
//   let current = new Date(start);

//   while (current <= end) {

//     const day = current.getDay(); // 0-6

//     // Skip weekoff days
//     if (!this.weekoffDays.includes(day)) {
//       count++;
//     }

//     current.setDate(current.getDate() + 1);
//   }

//   this.totalDays = count;
//   }

//   // --------------------- CREATE (SUBMIT LEAVE) ---------------------
//   onSubmit() {
//     debugger;
//     if (!this.leaveType || !this.startDate || !this.endDate || !this.reason) {
//       alert("Please fill all required fields.");
//       return;
//     }
//     let available = this.leaveType === "Sick Leave" ? this.sickAvailable : this.casualAvailable;

//     if (this.totalDays > this.availableLeaves) {
//       Swal.fire(
//         "Insufficient Balance",
//         `You cannot apply for more than ${this.availableLeaves} days.`,
//         "error"
//       );
//       return;
//     }



//     const selected = this.leaveTypes.find(x => x.leaveTypeName === this.leaveType);
//     const leaveTypeId = selected?.leaveTypeID;

//     if (!leaveTypeId) {
//       alert("Invalid Leave Type");
//       return;
//     }

//     const formData = new FormData();

//     formData.append("UserId", this.userId.toString());
//     formData.append("CompanyId", this.companyId.toString());
//     formData.append("RegionId", this.regionId.toString());
//     formData.append("LeaveTypeId", leaveTypeId.toString());
//     formData.append("IsHalfDay", this.isHalfDay.toString());
//     formData.append("StartDate", this.startDate);
//     formData.append("EndDate", this.endDate);
//     formData.append("TotalDays", this.totalDays.toString());
//     formData.append("Reason", this.reason);
//     formData.append("ReportingManagerId", this.reportingManagerId.toString());

//     if (this.selectedFile) {
//       formData.append("SupportingDocument", this.selectedFile);
//     }

//     this.leaveService.submitLeave(formData).subscribe({
//       next: (res) => {
//         Swal.fire({
//           icon: 'success',
//           title: 'Leave Submitted!',
//           text: 'Your leave request was submitted successfully.',
//           timer: 1500,
//           showConfirmButton: false
//         });


//         // ✅ Reload list from DB
//         this.loadMyLeaves();

//         // ✅ Reset form
//         this.leaveType = "";
//         this.startDate = "";
//         this.endDate = "";
//         this.totalDays = 0;
//         this.reason = "";
//         this.selectedFileName = "";
//         this.selectedFile = null;
//         this.isHalfDay = false;
//       },
//       error: (err: any) => {
//         console.error("Submit failed", err);
//         Swal.fire('Error', 'Error while submitting leave.', 'error');

//       }
//     });
//   }

//   resetForm(): void {
//     this.leaveType = "";
//     this.startDate = "";
//     this.endDate = "";
//     this.totalDays = 0;
//     this.reason = "";
//     this.selectedFileName = "";
//     this.selectedFile = null;
//     this.isHalfDay = false;

//     Swal.fire({
//       icon: 'info',
//       title: 'Form Reset',
//       timer: 1000,
//       showConfirmButton: false
//     });
//   }

//   // Sorting
//   sortBy(column: keyof LeaveRequest): void {
//     if (this.sortColumn === column) {
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       this.sortColumn = column;
//       this.sortDirection = 'asc';
//     }
//   }

//   // Sorted list
//   getSortedLeaves(): LeaveRequest[] {
//     let data = [...this.leaveList];

//     if (this.sortColumn) {
//       data.sort((a, b) => {
//         const valA = (a[this.sortColumn!] ?? '') as any;
//         const valB = (b[this.sortColumn!] ?? '') as any;

//         if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
//         if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }
//     return data;
//   }

//   // Pagination + Data
//   filteredLeaves(): LeaveRequest[] {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     return this.getSortedLeaves().slice(startIndex, startIndex + this.pageSize);
//   }

//   // Page Count
//   get totalPages(): number {
//     return Math.ceil(this.leaveList.length / this.pageSize);
//   }

//   changePage(page: number): void {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//     }
//   }

//   changePageSize(size: number): void {
//     this.pageSize = size;
//     this.currentPage = 1;
//   }
// loadWeekoffs() {

//   this.userService.getWeekoffList(this.userId).subscribe((res: any) => {

//     const data = res.data || [];

//     const dayMap: any = {
//       Sunday: 0,
//       Monday: 1,
//       Tuesday: 2,
//       Wednesday: 3,
//       Thursday: 4,
//       Friday: 5,
//       Saturday: 6
//     };

//     this.weekoffDays = [];

//     data.forEach((w: any) => {

//       if (w.isActive) {

//         if (w.weekoff1 && dayMap[w.weekoff1] !== undefined) {
//           this.weekoffDays.push(dayMap[w.weekoff1]);
//         }

//         if (w.weekoff2 && dayMap[w.weekoff2] !== undefined) {
//           this.weekoffDays.push(dayMap[w.weekoff2]);
//         }

//       }

//     });

//     console.log("Weekoff Days:", this.weekoffDays);

//     // ⭐ IMPORTANT
//     this.calculateTotalDays();

//   });

// }
startDate: string = "";
  endDate: string = "";
  totalDays: number = 0;
  today: string = "";
  startDateError: string = "";
  endDateError: string = "";
  reason: string = "";
  leaveType: string = "";
  selectedFileName: string = "";
  reportingManager: string = '';
  isHalfDay: boolean = false;

  // LEAVE COUNTS
  sickTotal: number = 1;
  casualTotal: number = 1;

  sickUsed: number = 0;
  casualUsed: number = 0;

  sickAvailable: number = 0;
  casualAvailable: number = 0;

  leaveTypes: any[] = [];

canCreate: boolean = false;
  userId!: number;
  companyId!: number;
  regionId!: number;
  reportingManagerName: string = '';
  reportingManagerId!: number;
  selectedFile!: File | null;

  // Weekoff configuration (Sat/Sun default, can be loaded from server)
  weekoffDays: Set<string> = new Set();

  // Sorting
  sortColumn: keyof LeaveRequest | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Filters
  searchText = '';

  // STATIC LEAVE LIST
  leaveList: LeaveRequest[] = [];
  selectedLeaveType: any = null;
  availableLeaves: number = 0;
  usedLeaves: number = 0;
  canApprove: any;
  canReject: any;


  ngOnInit(): void {
    this.today = this.formatDate(new Date());
    //   this.leaveList = [];
    // this.calculateLeaveSummary();
    //  this.loadLeaveTypes();
    // this.loadMyLeaves();

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.leaveList = [];
    this.calculateLeaveSummary();
    this.loadLeaveTypes();
    this.loadMyLeaves();
    this.loadReportingManager();
    this.loadWeekoffs();
    this.loadPermission();

  }

  constructor(private leaveService: EmployeeResignationService, private userService: AdminService,private adminService: AdminService) { }

  validateLeaveLimit() {
    let available = 0;
    if (this.leaveType === "Sick Leave") {
      available = this.sickAvailable;
    }

    if (this.leaveType === "Casual Leave") {
      available = this.casualAvailable;
    }
     this.leavedays= this.leaveList.reduce((sum, l) => sum + l.totalDays, 0);


    // If half day -> allow only if available >= 0.5
    if (this.isHalfDay) {
      if (this.availableLeaves < 0.5) {
        Swal.fire("Not Allowed", "You do not have enough leave balance.", "warning");
        this.totalDays = 0;
        this.endDate = "";
      }
      return;
    }

    // If applying full leave days
    if (this.totalDays > this.availableLeaves) {
      Swal.fire(
        "Not Allowed",
        `You only have ${this.availableLeaves} days available.`,
        "warning"
      );

      this.totalDays = 0;
      this.endDate = "";
    }
  }

  // FORMAT DATE
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  loadReportingManager() {
    if (!this.userId) return;

    this.leaveService.getReportingManager(this.userId).subscribe({
      next: (data: any) => {
        console.log("Manager API response =>", data);

        this.reportingManagerName = data.managerName;
        this.reportingManagerId = data.managerId;
      },
      error: (err) => {
        console.error('Reporting manager load error', err);
      }
    });
  }

  viewDocument(filePath: string | undefined): void {
    if (!filePath) {
      Swal.fire('Error', 'No file path available.', 'error');
      return;
    }

    const fullPath = `${environment.apiUrl}${environment.leaveDocumentPath}${filePath}`;
    window.open(fullPath, '_blank');
  }


  // Load the company/region weekoff configuration (e.g., Mon/Wed, Sat/Sun, etc.)
  private loadWeekoffs() {
    if (!this.userId) return;

    this.leaveService.getWeekoffLists(this.companyId, this.regionId).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        const days: string[] = [];

        data.forEach((w: any) => {
          const value = (w.weekoffDate ?? w.WeekoffDate ?? '').toString().trim();
          if (!value) return;

          days.push(value);
          if (value.length >= 3) days.push(value.substring(0, 3));
        });

        this.weekoffDays = new Set(days.map(d => d.toLowerCase()));
      },
      error: (err: any) => {
        console.error('Weekoffs load error', err);
      }
    });
  }

  private isWeekoffName(dayName: string): boolean {
    const name = (dayName || '').toString().trim().toLowerCase();

    // Default to Saturday/Sunday when weekoff configuration isn't loaded yet
    if (!this.weekoffDays || this.weekoffDays.size === 0) {
      return name === 'saturday' || name === 'sunday' || name === 'sat' || name === 'sun';
    }

    return this.weekoffDays.has(name);
  }

  private isWeekoffDate(date: Date): boolean {
    const weekdayLong = date.toLocaleString('en-US', { weekday: 'long' });
    const weekdayShort = date.toLocaleString('en-US', { weekday: 'short' });
    return this.isWeekoffName(weekdayLong) || this.isWeekoffName(weekdayShort);
  }

  isWeekend(dateString: string): boolean {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    return this.isWeekoffDate(date);
  }


  loadLeaveTypes() {
    this.leaveService.getLeaveTypes(this.companyId, this.regionId).subscribe({
      next: (data: any) => {
        this.leaveTypes = data ? data.data : [];

        // Auto set total days
        const sick = this.leaveTypes.find(x => x.leaveTypeName === 'Sick Leave');
        const casual = this.leaveTypes.find(x => x.leaveTypeName === 'Casual Leave');

        this.sickTotal = sick?.leaveDays || 0;
        this.casualTotal = casual?.leaveDays || 0;

        this.calculateLeaveSummary();
      },
      error: (err) => {
        console.error('Leave types load error', err);
      }
    });
  }
  users: any;
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.map((u: any) => ({
          ...u,
          reportingTo: u.ReportingTo ?? 0  // ✅ map correct API field to frontend field
        }));


      },
      error: () => this.showError('Failed to load users.')
    });
  }

  showError(msg: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      timer: 2500,
      showConfirmButton: false
    });
  }

  loadMyLeaves() {
    this.leaveService.getMyLeaves(this.userId).subscribe({
      next: (data) => {
        this.leaveList = data.map(x => ({
          appliedDate: x.appliedDate,
          leaveType: x.leaveTypeName || '',
          fromDate: x.startDate,
          toDate: x.endDate,
          totalDays: x.totalDays,
          reason: x.reason,
          fileName: x.fileName,
          status: x.status,
          isHalfDay: x.isHalfDay ?? false
        }));

        this.calculateLeaveSummary();
        if (this.leaveType) {
          this.onLeaveTypeChange();
        }

      },
      error: (err) => {
        console.error("Load leaves failed", err);
      }
    });
  }




  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;  // 👈 only file name saved
    }
  }
  onHalfDayChange() {
    if (this.isHalfDay) {
      this.totalDays = 0.5;
      this.validateLeaveLimit();
      // If half day selected, force same date
      if (this.startDate) {
        this.endDate = this.startDate;
      }
    } else {
      this.calculateTotalDays();
    }
  }

  onLeaveTypeChange() {

    // Get selected leave type object
    this.selectedLeaveType = this.leaveTypes
      .find(x => x.leaveTypeName === this.leaveType);

    if (!this.selectedLeaveType) {
      this.availableLeaves = 0;
      return;
    }

    // Calculate used leaves for selected type
    this.usedLeaves = this.leaveList
      .filter(l => l.leaveType === this.leaveType)
      .reduce((sum, l) => sum + l.totalDays, 0);
    // Available = Total - Used
    this.availableLeaves =
      this.selectedLeaveType.leaveDays - this.usedLeaves;
  }



 leavedays:any;
  calculateLeaveSummary() {
    this.leavedays= this.leaveList.reduce((sum, l) => sum + l.totalDays, 0);
    this.sickUsed = this.leaveList
      .filter(l => l.leaveType === "Sick Leave")
      .reduce((sum, l) => sum + l.totalDays, 0);

    this.casualUsed = this.leaveList
      .filter(l => l.leaveType === "Casual Leave")
      .reduce((sum, l) => sum + l.totalDays, 0);

    this.sickAvailable = this.sickTotal - this.sickUsed;
    this.casualAvailable = this.casualTotal - this.casualUsed;
  }


  // START DATE CHANGE
  onStartDateChange() {
    this.calculateTotalDays();
    this.validateLeaveLimit();

    this.startDateError = "";

    if (!this.startDate) return;
    if (this.isWeekend(this.startDate)) {
      this.startDateError = "Start date cannot be a weekoff day.";
      this.startDate = "";
      this.totalDays = 0;
      return;
    }


    if (this.isHalfDay) {
      this.endDate = this.startDate;
      this.totalDays = 0.5;
      return;
    }


    if (this.startDate < this.today) {
      this.startDateError = "Start date cannot be a past date.";
      this.totalDays = 0;
      return;
    }

    if (this.endDate && this.startDate > this.endDate) {
      this.startDateError = "Start date cannot be later than end date.";
      this.totalDays = 0;
      return;
    }

    this.calculateTotalDays();
  }

  // END DATE CHANGE
  onEndDateChange() {
    this.calculateTotalDays();
    this.validateLeaveLimit();

    this.endDateError = "";

    if (this.isWeekend(this.endDate)) {
      this.endDateError = "End date cannot be a weekoff day.";
      this.endDate = "";
      this.totalDays = 0;
      return;
    }

    if (this.isHalfDay) {
      this.endDate = this.startDate;
      this.totalDays = 0.5;
      return;
    }


    if (!this.endDate) return;

    if (this.startDate && this.endDate < this.startDate) {
      this.endDateError = "End date cannot be earlier than start date.";
      this.totalDays = 0;
      return;
    }

    this.calculateTotalDays();
  }

   IsWeekoffName(dayName: string): boolean {
    const name = (dayName || '').toString().trim().toLowerCase();

    // Default to Saturday/Sunday when weekoffs aren't configured yet
    if (!this.weekoffDays || this.weekoffDays.size === 0) {
      return name === 'saturday' || name === 'sunday' || name === 'sat' || name === 'sun';
    }

    return this.weekoffDays.has(name);
  }

   LoadWeekoffs() {
    if (!this.userId) return;

    this.leaveService.getWeekoffLists(this.companyId, this.regionId).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        const days: string[] = [];

        data.forEach((w: any) => {
          const value = (w.weekoffDate ?? w.WeekoffDate ?? '').toString().trim();
          if (!value) return;

          days.push(value);
          if (value.length >= 3) days.push(value.substring(0, 3));
        });

        this.weekoffDays = new Set(days.map(d => d.toLowerCase()));
      },
      error: (err) => {
        console.error('Weekoffs load error', err);
      }
    });
  }

  IsWeekend(dateString: string): boolean {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    const weekdayLong = date.toLocaleString('en-US', { weekday: 'long' });
    const weekdayShort = date.toLocaleString('en-US', { weekday: 'short' });

    return this.isWeekoffName(weekdayLong) || this.isWeekoffName(weekdayShort);
  }


  // TOTAL DAYS CALCULATION
  calculateTotalDays() {

    if (this.isHalfDay) {
      this.totalDays = 0.5;
      return;
    }

    if (!this.startDate || !this.endDate) {
      this.totalDays = 0;
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    let total = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = this.formatDate(d);
      if (!this.isWeekend(dayStr)) {
        total++;
      }
    }

    this.totalDays = total;
  }

  // --------------------- CREATE (SUBMIT LEAVE) ---------------------
  onSubmit() {
    if (!this.leaveType || !this.startDate || !this.endDate || !this.reason) {
      alert("Please fill all required fields.");
      return;
    }
    let available = this.leaveType === "Sick Leave" ? this.sickAvailable : this.casualAvailable;

    if (this.totalDays > this.availableLeaves) {
      Swal.fire(
        "Insufficient Balance",
        `You cannot apply for more than ${this.availableLeaves} days.`,
        "error"
      );
      return;
    }



    const selected = this.leaveTypes.find(x => x.leaveTypeName === this.leaveType);
    const leaveTypeId = selected?.leaveTypeID;

    if (!leaveTypeId) {
      alert("Invalid Leave Type");
      return;
    }

    const formData = new FormData();

    formData.append("UserId", this.userId.toString());
    formData.append("CompanyId", this.companyId.toString());
    formData.append("RegionId", this.regionId.toString());
    formData.append("LeaveTypeId", leaveTypeId.toString());
    formData.append("IsHalfDay", this.isHalfDay.toString());
    formData.append("StartDate", this.startDate);
    formData.append("EndDate", this.endDate);
    formData.append("TotalDays", this.totalDays.toString());
    formData.append("Reason", this.reason);
    formData.append("ReportingManagerId", this.reportingManagerId.toString());

    if (this.selectedFile) {
      formData.append("SupportingDocument", this.selectedFile);
    }

    this.leaveService.submitLeave(formData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Leave Submitted!',
          text: 'Your leave request was submitted successfully.',
          timer: 1500,
          showConfirmButton: false
        });


        // ✅ Reload list from DB
        this.loadMyLeaves();

        // ✅ Reset form
        this.leaveType = "";
        this.startDate = "";
        this.endDate = "";
        this.totalDays = 0;
        this.reason = "";
        this.selectedFileName = "";
        this.selectedFile = null;
        this.isHalfDay = false;
      },
      error: (err: any) => {
        console.error("Submit failed", err);
        Swal.fire('Error', 'Error while submitting leave.', 'error');

      }
    });
  }

  resetForm(): void {
    this.leaveType = "";
    this.startDate = "";
    this.endDate = "";
    this.totalDays = 0;
    this.reason = "";
    this.selectedFileName = "";
    this.selectedFile = null;
    this.isHalfDay = false;

    Swal.fire({
      icon: 'info',
      title: 'Form Reset',
      timer: 1000,
      showConfirmButton: false
    });
  }

  // Sorting
  sortBy(column: keyof LeaveRequest): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  // Sorted list
  getSortedLeaves(): LeaveRequest[] {
    let data = [...this.leaveList];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = (a[this.sortColumn!] ?? '') as any;
        const valB = (b[this.sortColumn!] ?? '') as any;

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  // Pagination + Data
  filteredLeaves(): LeaveRequest[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.getSortedLeaves().slice(startIndex, startIndex + this.pageSize);
  }

  // Page Count
  get totalPages(): number {
    return Math.ceil(this.leaveList.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }
loadPermission() {
  const userId = Number(sessionStorage.getItem("UserId"));
  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  // ✅ Get "Leave Approve" menu (child menu)
  const approvalMenu = menus.find(
    (m: any) => m.menuName?.trim().toLowerCase() === "leave approve"
  );

  const menuId = approvalMenu?.menuId || 0;

  // ✅ Set from session
  this.canApprove = approvalMenu?.canEdit ?? false;   // Approve action
  this.canReject = approvalMenu?.canDelete ?? false;  // Reject action

  console.log("Approval Menu:", approvalMenu);
  console.log("canApprove:", this.canApprove);
  console.log("canReject:", this.canReject);

  // ✅ OPTIONAL API (combine, don’t override)
  this.adminService.getPermission(userId, menuId, 'edit').subscribe({
    next: (res: boolean) => {
      console.log("API Approve Permission:", res);
      this.canApprove = this.canApprove && res;
    },
    error: () => {
      this.canApprove = false;
    }
  });

  this.adminService.getPermission(userId, menuId, 'delete').subscribe({
    next: (res: boolean) => {
      console.log("API Reject Permission:", res);
      this.canReject = this.canReject && res;
    },
    error: () => {
      this.canReject = false;
    }
  });
}
}
