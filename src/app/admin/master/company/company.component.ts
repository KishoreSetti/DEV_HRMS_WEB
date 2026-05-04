
import { Component, OnInit } from '@angular/core';
import { AdminService,Company } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-company',
  standalone: false,
  templateUrl: './company.component.html',
  styleUrl: './company.component.css'
})
export class CompanyComponent {
   showUploadPopup = false;
  companies: any[] = []; // Replace with real model
// ADD THESE VARIABLES
sortColumn: string = 'companyId';
sortDirection: 'asc' | 'desc' = 'desc'; // default: latest first

 // Model for form
  company: Company = this.getEmptyCompany();

  // List of companies


  // Control variables
  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  selectedLogoFile!: File;
  logoPreview: string | ArrayBuffer | null = null;

  constructor(private adminservice: AdminService,private spinner: NgxSpinnerService) {}

  // ------------------------------------------------------------
  // 🔹 OnInit - Load Companies
  // ------------------------------------------------------------
  ngOnInit(): void {

    this.loadCompanies();
  }
onBulkUploadComplete(message: any) {
  Swal.fire({
    icon: 'success',
    title: 'Upload Complete',
    text: message,
    confirmButtonColor: '#007bff'
  });

  this.loadCompanies(); // reload list after upload
}
showUpload = false;

  openBulkUpload(): void {
    this.showUpload = true;
  }

  closeBulkUpload(): void {
    this.showUpload = false;
     this.showUploadPopup = false;
  }

  handleFileUpload(file: File): void {
    console.log('Uploaded file:', file);
    // TODO: Call service to handle upload
    this.closeBulkUpload();
  }


closeUploadPopup() {
  this.showUploadPopup = false;
     this.showUpload = false;
}
  // ------------------------------------------------------------
  // 🔹 Create empty company model
  // ------------------------------------------------------------
  getEmptyCompany(): Company {
    return {
      companyId: 0,
      companyName: '',
      companyCode: '',
      industryType: '',
      headquarters: '',
      companyAddress: '',
      companyContact: '',
      companyEmail: '',
      isActive: true,
      userId: sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0
    };
  }

  // ------------------------------------------------------------
  // 🔹 Load all companies
  // ------------------------------------------------------------
  loadCompanies(): void {
     this.spinner.show();
    this.adminservice.getCompanies(null,this.company.userId).subscribe({
      next: (res:Company[]) => {
        this.companies = res;
         this.spinner.hide();
         console.log('Loaded companies:', this.companies);
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }
 onLogoSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedLogoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result;
      this.company.CompanyLogo = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

  // ------------------------------------------------------------
  // 🔹 Submit form - Add or Update
  // ------------------------------------------------------------
  onSubmit(): void {
    debugger;
     this.spinner.show();
  //    if (this.selectedLogoFile) {
  //   (this.company as any).companyLogo = this.selectedLogoFile;
  // }
    if (this.isEditMode) {
      // Update existing company
      this.adminservice.updateCompany(this.company.companyId, this.company).subscribe({
        next: () => {
           this.spinner.hide();
         Swal.fire({
          icon: 'success',
          title: 'Updated Successfully!',
          text: `${this.company.companyName} has been updated.`,
         showCloseButton: true,
          showConfirmButton: false
        });
          this.loadCompanies();
          this.resetForm();
        },
        error: (err) =>{
           this.spinner.hide();
          Swal.fire('Error', 'Update failed! Please contact IT Administrator.', 'error');
        }
      });
    } else {
      // Create new company
      this.adminservice.createCompany(this.company).subscribe({
        next: () => {
          this.spinner.hide();
           Swal.fire({
          icon: 'success',
          title: 'Added Successfully!',
          text: `${this.company.companyName} has been Added Successfully.`,
         
          showConfirmButton: false
          ,showCloseButton: true,
        });
         
          this.loadCompanies();
          this.resetForm();
        },
        error: (err) =>{
          this.spinner.hide();
              Swal.fire('Error', 'Create failed! Please contact IT Administrator.', 'error');
       
        }
          
      });
    }
  }

  // ------------------------------------------------------------
  // 🔹 Edit Company
  // ------------------------------------------------------------
  editCompany(c: Company): void {
    this.company = { ...c };
    console.log(this.company);
    this.isEditMode = true;
  }

  // ------------------------------------------------------------
  // 🔹 Delete Company
  // ------------------------------------------------------------
  deleteCompany(c: Company): void {
    Swal.fire({
  title: `Are you sure you want to delete ${c.companyName}?`,
  showDenyButton: true,
  showCancelButton: true,
  confirmButtonText: "Confirm",
  
}).then((result) => {
  /* Read more about isConfirmed, isDenied below */
  if (result.isConfirmed) {
    this.spinner.show();
      this.adminservice.deleteCompany(c.companyId).subscribe({
        next: (res:any) => {
          debugger;
          this.spinner.hide();
           Swal.fire({
          icon: 'success',
          title: 'Deleted Successfully!',
          text: `${this.company.companyName} has been Deleted.`,
         
          showConfirmButton: false
          ,showCloseButton: true,
        });
          this.loadCompanies();
        },
        error: (err) =>{
          debugger;
          this.spinner.hide();
           Swal.fire('Warning', 'Cannot delete due to referenced other module', 'warning');
        }
          
      });
  } else if (result.isDenied) {
    Swal.fire('Error', 'Delete failed! Please contact IT Administrator.', 'error');
      
  }
});
  
  }

  // ------------------------------------------------------------
  // 🔹 Toggle status (Active/Inactive)
  // ------------------------------------------------------------
  toggleStatus(c: Company): void {
    const updatedCompany = { ...c, IsActive: !c.isActive };
    this.adminservice.updateCompany(updatedCompany.companyId, updatedCompany).subscribe({
      next: () => {
        c.isActive = updatedCompany.IsActive;
      },
      error: (err) => {
         Swal.fire('Error', 'Status toggle failed.', 'error');
          console.error('Status toggle failed:', err)
      }
       
    });
  }

  // ------------------------------------------------------------
  // 🔹 Reset Form
  // ------------------------------------------------------------
  resetForm(): void {
    this.company = this.getEmptyCompany();
    this.isEditMode = false;
  }

  // ------------------------------------------------------------
  // 🔹 Filter Companies (search + status)
  // ------------------------------------------------------------
 // Modify filteredCompanies() to include sorting
filteredCompanies(): Company[] {
  if (!this.companies || this.companies.length === 0) return [];

  const search = this.searchText ? this.searchText.toLowerCase() : '';
  let filtered = this.companies.filter(c => {
    const name = c.companyName ? c.companyName.toLowerCase() : '';
    const matchesSearch = search === '' || name.includes(search);
    const matchesStatus = this.statusFilter === '' || c.isActive === this.statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 🔹 Sort by selected column
  filtered = filtered.sort((a, b) => {
    const valA = (a[this.sortColumn] ?? '').toString().toLowerCase();
    const valB = (b[this.sortColumn] ?? '').toString().toLowerCase();

    if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
}

// 🔹 Add toggleSort method
toggleSort(column: string): void {
  if (this.sortColumn === column) {
    // Toggle direction if clicking same column again
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // Switch to new column with ascending default
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}
companyModel:any;
openUploadPopup() {
  this.companyModel = [ { companyName: 'ABC Technologies Pvt Ltd', companyCode: 'ABC001', industryType: 'IT Services', headquarters: 'Bangalore, India', isActive: true }, { companyName: 'Global Solutions Ltd', companyCode: 'GSL002', industryType: 'Manufacturing', headquarters: 'Mumbai, India', isActive: false } ];
  this.showUploadPopup = false;
  setTimeout(() => {
    this.showUploadPopup = true;
  }, 0);
}

  handleBulkUpload(file: File) {
    // Implement backend upload logic here
    console.log('File received:', file.name);
    this.showUploadPopup = false;
  }

  exportAs(type: 'pdf' | 'excel') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.companies);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Companies');
    XLSX.writeFile(wb, 'CompanyList.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Company Name', 'Code', 'Industry', 'Headquarters', 'Status']],
      body: this.companies.map(c => [
        c.companyName,
        c.companyCode,
        c.industryType,
        c.headquarters,
        c.isActive ? 'Active' : 'Inactive'
      ]),
    });
    doc.save('CompanyList.pdf');
  }
  // Pagination
pageSize = 5;
currentPage = 1;

get totalPages(): number {
  return Math.ceil(this.filteredCompanies().length / this.pageSize);
}

get pagedCompanies(): Company[] {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  return this.filteredCompanies().slice(start, end);
}

changePageSize(event: any): void {
  this.pageSize = +event.target.value;
  this.currentPage = 1;
}

goToPage(page: number): void {
  this.currentPage = page;
}
  Math = Math; // <-- Add this line

  onCancel(): void {
  this.resetForm();

}
}
