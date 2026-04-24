import { Component } from '@angular/core';

@Component({
  selector: 'app-job-application',
  standalone: false,
  templateUrl: './job-application.component.html',
  styleUrl: './job-application.component.css'
})
export class JobApplicationComponent {
model: any = {
    candidateName: '',
    email: '',
    phone: '',
    jobTitle: '',
    companyId: '',
    regionId: '',
    experienceYears: '',
    resumeUrl: '',
    technology: ''
  };

  companies = [
    { id: 1, name: 'ABC Pvt Ltd' },
    { id: 2, name: 'XYZ Solutions' }
  ];

  regions = [
    { id: 1, name: 'Hyderabad' },
    { id: 2, name: 'Bangalore' }
  ];

  technologies: string[] = [
    'Angular', '.NET Core', 'SQL', 'React'
  ];

  selectedTechnologies: string[] = [];
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {

    this.model.technology = this.selectedTechnologies.join(',');

    console.log('Submitted Data:', this.model);

    alert('Application Submitted Successfully!');
  }
}
