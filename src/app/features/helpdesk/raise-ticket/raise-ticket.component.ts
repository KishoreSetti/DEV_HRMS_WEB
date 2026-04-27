import { Component } from '@angular/core';
import { HelpdeskService } from '../service/helpdesk.service';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

interface Ticket {
  ticketNumber: string;
  categoryName: string;
  subject: string;
  priorityName: string;
  status: string;
  createdAt: string | Date;
  fileName?: string;   // ✅ ADD THIS
  filePath?: string;   // ✅ ADD
}


@Component({
  selector: 'app-raise-ticket',
  standalone: false,
  templateUrl: './raise-ticket.component.html',
  styleUrl: './raise-ticket.component.css'
})
export class RaiseTicketComponent {
userId!: number;
  companyId!: number;
  regionId!: number;

 employeeName = '';
  departmentName = '--';

 Category: any[] = [];
 selectedCategoryId: number | null = null;
tickets: Ticket[] = [];


  priorities: any[] = [];
  selectedPriorityId: number | null = null;
  selectedFile: File | null = null;

  model: any = {
    categoryId: null,
    subject: '',
    priorityId: null,
    description: '',
     hrEmail: ''   // ✅ ADD THIS
  };
  // Sorting
sortColumn: keyof Ticket | null = null;
sortDirection: 'asc' | 'desc' = 'asc';

// Pagination
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50];




  constructor(private helpdeskService: HelpdeskService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
    this.loadUserProfile();
    this.loadCategory();
    this.loadPriorities();
      this.loadMyTickets();
  }
   loadUserProfile() {
    this.helpdeskService.getUserProfile(this.userId).subscribe({
      next: res => {
        this.employeeName = res?.fullName ?? '';
        this.departmentName = res?.departmentName ?? '--';
      },
      error: err => {
        console.error('Failed to load user profile', err);
      }
    });
  }

  loadPriorities() {
    this.helpdeskService
      .getPriorities(this.companyId, this.regionId)
      .subscribe(res => {
        this.priorities = res;
      });
  }

   loadCategory() {
    this.helpdeskService
      .getCategory(this.companyId, this.regionId)
      .subscribe(res => {
        this.Category = res;
      });
  }
  loadMyTickets() {
  this.helpdeskService.getMyTickets(this.userId)
    .subscribe(res => {
      this.tickets = res;
      this.currentPage = 1; // reset page after reload
    });
}


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

 submitTicket() {

  if (!this.model.categoryId || !this.model.subject || 
      !this.model.priorityId || !this.model.description) {

    Swal.fire({
      icon: 'warning',
      title: 'Missing Fields',
      text: 'Please fill all required fields.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  const formData = new FormData();
  formData.append("userId", this.userId.toString());
  formData.append("companyId", this.companyId.toString());
  formData.append("regionId", this.regionId.toString());
  formData.append("categoryId", this.model.categoryId);
  formData.append("subject", this.model.subject);
  formData.append("priorityId", this.model.priorityId);
  formData.append("description", this.model.description);
  formData.append("hrEmail", this.model.hrEmail || '');

  if (this.selectedFile) {
    formData.append("attachment", this.selectedFile);
  }

  this.helpdeskService.submitTicket(formData).subscribe({
    next: (res) => {

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Ticket submitted successfully.',
        confirmButtonColor: '#28a745'
      });

      this.resetModel();
      this.loadMyTickets();
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#d33'
      });
    }
  });
}

viewDocument(filePath?: string): void {
  if (!filePath) {
    Swal.fire('Error', 'No file available.', 'error');
    return;
  }

  const fullPath = `${environment.apiUrl}/${filePath}`;
  window.open(fullPath, '_blank');
}

resetForm(form: NgForm) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to clear the form?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, reset it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.resetModel();
      form.resetForm();

      Swal.fire({
        icon: 'success',
        title: 'Reset!',
        text: 'Form cleared successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}
resetModel() {
  this.model = {
    categoryId: null,
    subject: '',
    priorityId: null,
    description: ''
  };

  this.selectedFile = null;

  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}


  // ---------- SORTING ----------
sortBy(column: keyof Ticket): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

getSortedTickets(): Ticket[] {
  let data = [...this.tickets];

  if (this.sortColumn) {
    data.sort((a: any, b: any) => {
      const valA = a[this.sortColumn!] ?? '';
      const valB = b[this.sortColumn!] ?? '';

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return data;
}

// ---------- PAGINATION ----------
pagedTickets(): Ticket[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.getSortedTickets().slice(startIndex, startIndex + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.tickets.length / this.pageSize);
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
}
