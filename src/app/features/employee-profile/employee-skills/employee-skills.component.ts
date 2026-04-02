import { Component } from '@angular/core';
import { AdminService, EmployeeCertificationDto } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-employee-skills',
  standalone: false,
  templateUrl: './employee-skills.component.html',
  styleUrl: './employee-skills.component.css'
})
export class EmployeeSkillsComponent {
activeTab = 'skills';

  // Skills & Job History
  skillsJobHistory = [
    { label: 'Employer', type: 'text', required: true, placeholder: 'Enter employer name' },
    { label: 'Upload Documents', type: 'file', required: true, placeholder: 'Upload supporting documents (Offer/Relieving/Experience letter)' },
    { label: 'Job Title', type: 'text', required: true, placeholder: 'Enter job title/designation' },
    { label: 'Tenure – From Date', type: 'date', required: true, placeholder: 'Select start date' },
    { label: 'Tenure – To Date', type: 'date', required: true, placeholder: 'Select end date' },
    { label: 'Last CTC', type: 'text', required: true, placeholder: 'Enter last drawn CTC' },
    { label: 'Website', type: 'url', required: true, placeholder: 'Enter company website' },
    { label: 'Employee Code', type: 'text', required: true, placeholder: 'Enter employee code provided by employer' },
    { label: 'Reason for Leaving', type: 'textarea', required: true, placeholder: 'Enter reason for leaving previous job' },
  ];

  // Certification
  certification = [
    { label: 'Certification Name', type: 'text', required: true, placeholder: 'Enter certification name' },
    { label: 'Upload Documents', type: 'file', required: true, placeholder: 'Upload certification document' },
    { label: 'Description', type: 'textarea', required: false, placeholder: 'Enter certification description' },
    { label: 'Type', type: 'select', required: true, options: ['Technical', 'Professional', 'Language', 'Other'], placeholder: 'Select certification type' },
  ];

  // Education
  education = [
    { label: 'Qualification / Degree', type: 'text', required: true, placeholder: 'Enter qualification or degree (e.g., B.Tech, MBA)' },
    { label: 'Specialization / Major', type: 'text', required: true, placeholder: 'Enter specialization or major (e.g., Computer Science)' },
    { label: 'Institution / University Name', type: 'text', required: true, placeholder: 'Enter institution or university name' },
    { label: 'Board (if applicable)', type: 'text', required: false, placeholder: 'Enter board name (if applicable)' },
    { label: 'Start Date', type: 'date', required: true, placeholder: 'Select start date' },
    { label: 'End Date / Year of Passing', type: 'date', required: true, placeholder: 'Select end date or year of passing' },
    { label: 'Percentage / CGPA / Grade', type: 'text', required: true, placeholder: 'Enter percentage, CGPA, or grade' },
    { label: 'Mode of Study', type: 'select', required: true, options: ['Full-time', 'Part-time', 'Distance'], placeholder: 'Select mode of study' },
    { label: 'Certificate / Document Upload', type: 'file', required: true, placeholder: 'Upload certificate or mark sheet' },
  ];
  canJobHistory: boolean = false;
canEducation: boolean = false;
canCertification: boolean = false;
ngOnInit(){
  this.loadTabPermissions();
}
loadTabPermissions() {

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const jobHistory = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "job history");

  const education = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "education");

  const certification = menus.find((m:any) => 
      m.menuName?.trim().toLowerCase() === "certification");

  this.canJobHistory = jobHistory?.canView ?? false;
  this.canEducation = education?.canView ?? false;
  this.canCertification = certification?.canView ?? false;

}
}
