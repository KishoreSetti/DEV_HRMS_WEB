import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AdminService } from '../../../admin/servies/admin.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { timeEnd } from 'node:console';

interface AttendanceRecord {
  attendanceDate: string;
  employeeName: string;
  department: string;
  actionType: string;
  actionTime: string;
}
@Component({
  selector: 'app-clockin-clockout',
  standalone: false,
  templateUrl: './clockin-clockout.component.html',
  styleUrl: './clockin-clockout.component.css'
})
export class ClockinClockoutComponent {
  attendanceForm!: FormGroup;
  attendanceRecords: AttendanceRecord[] = [];
  currentUser: any;
  loading = false;
  lateLoginText: string = '';
  message = '';
  todayClockIn = '--:--';
  todayClockOut = '--:--';
  availableActions: string[] = [];
  todayDuration = '--:--';
  currentDate = new Date();
  records: any[] = [];

  employeeCode = sessionStorage.getItem('EmployeeCode');
  companyId = sessionStorage.getItem('CompanyId') as unknown as number;
  regionId = sessionStorage.getItem('RegionId') as unknown as number;
  constructor(private fb: FormBuilder, private adminService: AdminService, private employeeResignationService: EmployeeResignationService) { }

  ngOnInit(): void {
    this.loadSessionUser();
    this.initForm();
    this.patchEmployeeData();
    this.loadAttendance();
    this.getshiftallocationName();
  }

  initForm() {
    this.attendanceForm = this.fb.group({
      employeeCode: [{ value: '', disabled: true }, Validators.required],
      employeeName: [{ value: '', disabled: true }, Validators.required],
      department: [{ value: '', disabled: true }, Validators.required],
      clockType: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  patchEmployeeData() {
    if (!this.currentUser) return;
    this.attendanceForm.patchValue({
      employeeCode: this.currentUser.employeeCode,
      employeeName: this.currentUser.fullName,
      department: this.currentUser.roleId,
    });
  }
  setAvailableActions() {
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = this.attendanceRecords
      .filter(r => r.attendanceDate.startsWith(today))
      .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

    // FIRST record of the day
    if (todayRecords.length === 0) {
      this.availableActions = ['ClockIn'];
      this.attendanceForm.patchValue({ clockType: 'ClockIn' });
      return;
    }

    // LAST record decides next action
    const lastAction = todayRecords[todayRecords.length - 1].actionType;

    if (lastAction === 'ClockIn') {
      this.availableActions = ['ClockOut'];
      this.attendanceForm.patchValue({ clockType: 'ClockOut' });
    } else {
      this.availableActions = ['ClockIn'];
      this.attendanceForm.patchValue({ clockType: 'ClockIn' });
    }
  }


  onSubmit() {
    // if (this.attendanceForm.invalid) return;
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }
    const form = this.attendanceForm.getRawValue();
    const payload = {
      regionId: this.currentUser.regionId,
      companyId: this.currentUser.companyId,
      employeeCode: String(this.currentUser.userId),
      employeeName: form.employeeName,
      // department: form.department,
      department: String(form.department), // OR actual department name
      attendanceDate: new Date(),
      actionType: form.clockType,
      actionTime: form.time
    };

    this.loading = true;
    this.message = '';
    this.adminService.createClockInOut(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.message = 'Attendance saved successfully';
          this.attendanceForm.patchValue({ clockType: '', time: '' });
          this.loadAttendance();
          this.ngOnInit();
        },
        error: () => this.message = 'Failed to save attendance'
      });
  }

  loadAttendance() {
    this.adminService.getTodayAttendance(
      String(this.currentUser.employeeCode),
      this.currentUser.companyId,
      this.currentUser.regionId
    ).subscribe(res => {
      this.attendanceRecords = res;
      this.setTodaySummary();
      this.setAvailableActions();
    });
  }


  parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  setTodaySummary() {
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = this.attendanceRecords
      .filter(r => r.attendanceDate.startsWith(today))
      .sort((a, b) => a.actionTime.localeCompare(b.actionTime));

    const clockIns = todayRecords.filter(r => r.actionType === 'ClockIn');
    const clockOuts = todayRecords.filter(r => r.actionType === 'ClockOut');

    // First ClockIn
    this.todayClockIn = clockIns.length
      ? clockIns[0].actionTime
      : '--:--';

    // Last ClockOut
    this.todayClockOut = clockOuts.length
      ? clockOuts[clockOuts.length - 1].actionTime
      : '--:--';

    // 🟢 Calculate duration
    if (this.todayClockIn !== '--:--' && this.todayClockOut !== '--:--') {
      const start = this.parseTime(this.todayClockIn);
      const end = this.parseTime(this.todayClockOut);

      const diffMs = end.getTime() - start.getTime();

      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        this.todayDuration =
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        this.todayDuration = '--:--';
      }
    } else {
      this.todayDuration = '--:--';
    }
    this.calculateLateLogin();
  }

  shiftAllocationName: string = '';
  ShiftstartTime: string = '';
  ShiftendTime: string = '';
  getshiftallocationName() {
    this.employeeCode = sessionStorage.getItem('EmployeeCode') as string;
    const companyId = Number(sessionStorage.getItem('CompanyId'));
    const regionId = Number(sessionStorage.getItem('RegionId'));

    this.employeeResignationService
      .getShiftallocationNameForClockInOut(this.employeeCode, companyId, regionId)
      .subscribe(res => {
        console.log('Shift Allocation Name:', res);
        this.shiftAllocationName = res.shiftName;
        this.ShiftstartTime = res.shiftStartTime;
        this.ShiftendTime = res.shiftEndTime;
      });
  }

  loadSessionUser() {
    const user = sessionStorage.getItem('currentUser');
    if (user) this.currentUser = JSON.parse(user);
  }
  loadAll() {
    this.employeeResignationService.getClockInOutAll().subscribe(res => {
      this.records = res;
    });
  }

  loadTodayAttendance() {
    this.employeeResignationService
      .getTodayByEmployee(this.employeeCode, this.companyId, this.regionId)
      .subscribe(res => {
        this.records = res;
      });
  }
  getSystemTime24(): string {
    const now = new Date(); // USER SYSTEM TIME
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;   // HH:mm
  }
  //   clockIn() {
  //     const now = new Date();
  // debugger;
  // // Extract HH:mm in 24-hour format
  // const time24 = now.toISOString().substring(11, 16);
  //     const payload = {
  //       employeeCode: this.employeeCode,
  //       employeeName: sessionStorage.getItem('Name') || '',
  //       department: 0,
  //       attendanceDate: new Date(),
  //       actionType: this.todayClockIn === '--:--' ? 'ClockIn' : 'ClockOut',
  //       actionTime: this.getSystemTime24(),
  //       clockOutTime:this.todayClockIn==='--:--' ? '' : this.getSystemTime24(),
  //       clockInTime: this.todayClockIn==='--:--' ? this.getSystemTime24() : '',
  //       companyId: this.companyId,
  //       regionId: this.regionId
  //     };

  //     this.employeeResignationService.addClockInOut(payload).subscribe(() => {
  //       this.loadTodayAttendance();
  //     });
  //   }
  clockIn() {

    const time = this.getSystemTime24();

    const payload = {
      employeeCode: this.employeeCode,
      employeeName: sessionStorage.getItem('Name') || '',
      department: 0,

      attendanceDate: new Date(),

      actionType: this.todayClockIn === '--:--' ? 'ClockIn' : 'ClockOut',

      actionTime: time,

      companyId: this.companyId,
      regionId: this.regionId
    };

    this.employeeResignationService.addClockInOut(payload).subscribe(() => {
      this.loadTodayAttendance();
    });
  }

  delete(id: number) {
    this.employeeResignationService.deleteClockInOut(id).subscribe(() => {
      this.loadAll();
    });
  }

  calculateLateLogin() {
    if (!this.ShiftstartTime || this.todayClockIn === '--:--') {
      this.lateLoginText = '';
      return;
    }

    // Convert shift start time
    const [shiftH, shiftM] = this.ShiftstartTime.split(':').map(Number);
    const shiftStart = new Date();
    shiftStart.setHours(shiftH, shiftM, 0, 0);

    // Add 15 min grace
    const graceTime = new Date(shiftStart.getTime() + 15 * 60000);

    // Convert clock-in time
    const [inH, inM] = this.todayClockIn.split(':').map(Number);
    const clockIn = new Date();
    clockIn.setHours(inH, inM, 0, 0);

    // Check late
    if (clockIn > graceTime) {
      const diffMs = clockIn.getTime() - graceTime.getTime();

      const minutes = Math.floor(diffMs / (1000 * 60));

      this.lateLoginText = `(Late by ${minutes} mins)`;
    } else {
      this.lateLoginText = '';
    }
  }
}
