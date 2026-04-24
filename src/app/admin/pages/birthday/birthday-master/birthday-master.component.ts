import { Component, OnInit } from '@angular/core';
import { BirthdayService } from '../services/birthday.service';
import { BirthdayEmployee } from '../../../layout/models/birthday.model';

@Component({
  selector: 'app-birthday-master',
  standalone: false,
  templateUrl: './birthday-master.component.html',
  styleUrl: './birthday-master.component.css'
})
export class BirthdayMasterComponent {
  // Dummy Company Data
  companies = [
    { companyId: 1, companyName: 'ABC Pvt Ltd' },
    { companyId: 2, companyName: 'XYZ Ltd' }
  ];

  // Dummy Region Data
  regions = [
    { regionId: 1, regionName: 'Hyderabad', companyId: 1 },
    { regionId: 2, regionName: 'Bangalore', companyId: 1 },
    { regionId: 3, regionName: 'Chennai', companyId: 2 }
  ];

  // Dummy Employees
  employees = [
    { employeeId: 1, firstName: 'Durga', email: 'durga@gmail.com', companyId: 1, regionId: 1 },
  
    { employeeId: 2, firstName: 'Suresh', email: 'suresh@gmail.com', companyId: 2, regionId: 3 }
  ];

  // Selected values
  selectedCompanyId: number | null = null;
  selectedRegionId: number | null = null;
  selectedEmployeeId: number | null = null;
  selectedEmployeeEmail: string = '';
  dateOfBirth: string = '';

  // Filtered lists
  filteredRegions: any[] = [];
  filteredEmployees: any[] = [];

  // Birthday List
  birthdayList: any[] = [];

  ngOnInit(): void {}

  // Company change
  onCompanyChange() {
    this.selectedRegionId = null;
    this.selectedEmployeeId = null;
    this.selectedEmployeeEmail = '';

    this.filteredRegions = this.regions.filter(r => r.companyId === this.selectedCompanyId);
    this.filteredEmployees = [];
  }

  // Region change
  onRegionChange() {
    this.selectedEmployeeId = null;
    this.selectedEmployeeEmail = '';

    this.filteredEmployees = this.employees.filter(e =>
      e.companyId === this.selectedCompanyId &&
      e.regionId === this.selectedRegionId
    );
  }

  // Employee change
  onEmployeeChange() {
    const emp = this.filteredEmployees.find(e => e.employeeId === this.selectedEmployeeId);
    this.selectedEmployeeEmail = emp ? emp.email : '';
  }

  // Save
  onSubmit() {
    if (!this.selectedCompanyId || !this.selectedRegionId || !this.selectedEmployeeId || !this.dateOfBirth) {
      alert('Please fill all fields');
      return;
    }

    const emp = this.filteredEmployees.find(e => e.employeeId === this.selectedEmployeeId);

    const newRecord = {
      id: Date.now(),
      companyId: this.selectedCompanyId,
      regionId: this.selectedRegionId,
      employeeId: this.selectedEmployeeId,
      firstName: emp?.firstName,
      email: this.selectedEmployeeEmail,
      dateOfBirth: this.dateOfBirth
    };

    this.birthdayList.push(newRecord);

    alert('Birthday Added Successfully');
    this.resetForm();
  }

  // Delete
  delete(id: number) {
    if (confirm('Are you sure?')) {
      this.birthdayList = this.birthdayList.filter(x => x.id !== id);
    }
  }

  // Helpers
  getCompanyName(id: number) {
    return this.companies.find(c => c.companyId === id)?.companyName || '-';
  }

  getRegionName(id: number) {
    return this.regions.find(r => r.regionId === id)?.regionName || '-';
  }

  // Reset
  resetForm() {
    this.selectedCompanyId = null;
    this.selectedRegionId = null;
    this.selectedEmployeeId = null;
    this.selectedEmployeeEmail = '';
    this.dateOfBirth = '';
    this.filteredRegions = [];
    this.filteredEmployees = [];
  }
}
