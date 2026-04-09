import { Component } from '@angular/core';
import { AdminService, Department, News } from '../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-company-news',
  standalone: false,
  templateUrl: './company-news.component.html',
  styleUrl: './company-news.component.css'
})
export class CompanyNewsComponent {
     companies: any[] = [];
  regions: any[] = [];
  userId!: number;
  companyId!: number;
  regionId!: number;
  categories: any[] = [];
  filteredRegions: any[] = [];


  departments: Department[] = [];

  // News
  newsList: News[] = [];
  news: News = this.resetNews();
  isEditMode: boolean = false;
  editIndex: number | null = null;

  // Filters
  searchText: string = '';
  searchCategory: string = '';
  startDate: string = '';
  endDate: string = '';

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) return;

    this.loadCompanies();
    this.loadRegions();
    this.loadDepartments();
    this.getNewsList();
    this.loadCategories();
  }
  loadCompanies(): void {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        this.companies = res;
      },
      error: () => Swal.fire('Error', 'Failed to load companies', 'error')
    });
  }

loadRegions(): void {
  this.adminService.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      this.regions = res || [];
    },
    error: () => Swal.fire('Error', 'Failed to load regions', 'error')
  });
}
onCompanyChange(): void {
  this.news.RegionId = null;

  this.filteredRegions = this.news.CompanyId
    ? this.regions.filter(r => Number(r.companyID) === Number(this.news.CompanyId))
    : [];
}
loadCategories(): void {
  this.adminService.getCompanyNewsCategoryList(this.userId).subscribe({
    next: (res: any) => {
      console.log("Categories:", res);
      this.categories = res;
    },
    error: () => Swal.fire('Error', 'Failed to load categories', 'error')
  });
}
 getDepartmentName(departmentId?: number | null): string {
    if (!departmentId) return '-';

    const dept = this.departments.find(d => d.departmentId === departmentId);
    return dept ? dept.departmentName : '-';
  }
  // -----------------------------
  // Load Departments
  // -----------------------------
  loadDepartments() {
    this.spinner.show();
    this.adminService.getDepartments(this.userId).subscribe({
      next: (data: any) => {
        debugger;
        // Only active departments
        this.departments = data.data.data.filter((d: any) => d.isActive);
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading departments', err);
        Swal.fire('Error', 'Failed to load departments', 'error');
        this.spinner.hide();
      }
    });
  }

  // -----------------------------
  // Load News
  // -----------------------------
  getNewsList() {
    this.spinner.show();
    this.adminService.getAllNews(this.userId).subscribe({
      next: (res) => {
        console.log("API Response:", res);
        this.newsList = res.map(item => ({
          NewsId: item.newsId,
          CompanyId: item.companyId,
          RegionId: item.regionId,
          departmentId: item.departmentId,
          Title: item.title,
          userId: item.userId,
          Category: item.category ?? item.Category ?? '',
          Description: item.description,
          Date: item.postedDate ? new Date(item.postedDate) : new Date(),
          PublishedDate: item.postedDate
            ? new Date(item.postedDate).toISOString().split('T')[0]
            : '',
          Attachment: null
        }));
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching news list', err);
        Swal.fire('Error', 'Failed to load news', 'error');
        this.spinner.hide();
      }
    });
  }

  // -----------------------------
  // Reset form
  // -----------------------------
resetNews(): News {
  return {
    NewsId: undefined,
    userId: this.userId,

    CompanyId: this.companyId,
    RegionId: this.regionId,

    departmentId: null,

    Title: '',
    Category: '',
    Description: '',

    Date: new Date(),
    PublishedDate: new Date().toISOString().split('T')[0],

    Attachment: null
  };
}

  resetForm() {
    this.news = this.resetNews();
    this.isEditMode = false;
    this.editIndex = null;
  }

  // -----------------------------
  // File Selection
  // -----------------------------
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) this.news.Attachment = file;
  }

  // -----------------------------
  // Add / Update News
  // -----------------------------
onSubmit() {
debugger;
  const postedDate = this.news.PublishedDate
    ? this.news.PublishedDate
    : new Date().toISOString().split('T')[0];

  const payload = {
    newsId: this.news.NewsId ?? 0,

    userId: this.userId,

    companyId: Number(this.news.CompanyId ?? this.companyId),
    regionId: Number(this.news.RegionId ?? this.regionId),

    title: this.news.Title,
    description: this.news.Description,
    category: this.news.Category,

    departmentId: this.news.departmentId
      ? Number(this.news.departmentId)
      : null,

    postedDate: postedDate,

    fromDate: postedDate,
    toDate: postedDate,

    expiryDate: null,
    isActive: true,

    createdBy: this.userId,
    updatedBy: this.isEditMode ? this.userId : null
  };

  console.log("FINAL PAYLOAD:", payload);

  this.spinner.show();

  const request$ = this.isEditMode
    ? this.adminService.updateNews(this.news.NewsId!, payload)
    : this.adminService.saveNews(payload);

  request$.subscribe({
    next: () => {
      Swal.fire('Success', 'News saved successfully', 'success');
      this.getNewsList();
      this.resetForm();
      this.spinner.hide();
    },
    error: (err) => {
      console.error('Error saving news', err);
      Swal.fire('Error', 'Failed to save news', 'error');
      this.spinner.hide();
    }
  });

}


  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // -----------------------------
  // Edit News
  // -----------------------------
  editNews(n: News) {
    this.isEditMode = true;
    this.editIndex = this.newsList.indexOf(n);

    // ❗ Make sure NewsId exists and PublishedDate is string
    this.news = { ...n };
    this.news.PublishedDate = n.Date ? new Date(n.Date).toISOString().split('T')[0] : '';
    this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.news.CompanyId)
  );
  }

  // -----------------------------
  // Delete News
  // -----------------------------
  confirmDelete(n: News) {
    if (!n.NewsId) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the news',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteNews(n.NewsId!, this.userId).subscribe({
          next: (res) => {
            Swal.fire('Deleted', 'News deleted successfully', 'success');
            this.getNewsList();
            this.spinner.hide();
          },
          error: (err) => {
            console.error('Error deleting news', err);
            Swal.fire('Error', 'Failed to delete news', 'error');
            this.spinner.hide();
          }
        });
      }
    });
  }

  // -----------------------------
  // Filtered News
  // -----------------------------
  filteredNews(): News[] {
    return this.newsList.filter(n => {
      const matchesText = n.Title.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCategory = this.searchCategory ? n.Category === this.searchCategory : true;
      const matchesStart = this.startDate ? new Date(n.Date) >= new Date(this.startDate) : true;
      const matchesEnd = this.endDate ? new Date(n.Date) <= new Date(this.endDate) : true;
      return matchesText && matchesCategory && matchesStart && matchesEnd;
    });
  }
}
