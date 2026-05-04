import { Component } from '@angular/core';
import { AdminService,MenuMaster } from '../../servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-menus',
  standalone: false,
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css'
})
export class MenusComponent {
    menus: MenuMaster[] = [];
  menu: MenuMaster = this.getEmptyMenu();
  isEditMode = false;

  // Filters & Sorting
  searchText = '';
  statusFilter: boolean | '' = '';
  sortColumn: keyof MenuMaster | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5,10, 20, 50, 100];

  constructor(private menuService: AdminService) {}

  ngOnInit(): void {
    this.loadMenus();
  }

  // -------------------------------------------------------------
  // 🔹 Initialize Default Empty Menu
  // -------------------------------------------------------------
  getEmptyMenu(): MenuMaster {
    return {
      menuID: 0,
      menuName: '',
      parentMenuID: undefined,
      url: '',
      icon: '',
      orderNo: undefined,
      isActive: true,
      // ✅ DEFAULTS
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canApprove: false
    };
  }

  // -------------------------------------------------------------
  // 🔹 Load Menus from API
  // -------------------------------------------------------------
  loadMenus(): void {
    this.menuService.getMenus().subscribe({
      next: (res) => {
        this.menus = res.map(m => ({
          ...m,
          isActive: m.isActive === 1 || m.isActive === true
        }));
      },
      error: () => {
        Swal.fire('Error', 'Failed to load menu list.', 'error');
      }
    });
  }

  // -------------------------------------------------------------
  // 🔹 Create or Update Menu
  // -------------------------------------------------------------
  onSubmit(): void {
    const payload: MenuMaster = {
      ...this.menu,
      parentMenuID: this.menu.parentMenuID ?? null,
      isActive: this.menu.isActive ? true : false
    };

    if (this.isEditMode) {
      this.menuService.updateMenu(this.menu.menuID!, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Menu has been updated successfully.',
            timer: 1500,
            showConfirmButton: false
          });
          this.loadMenus();
          this.resetForm();
        },
        error: () => {
          Swal.fire('Error', 'Failed to update menu.', 'error');
        }
      });
    } else {
      this.menuService.createMenu(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'Menu has been created successfully.',
            timer: 1500,
            showConfirmButton: false
          });
          this.loadMenus();
          this.resetForm();
        },
        error: () => {
          Swal.fire('Error', 'Failed to create menu.', 'error');
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 🔹 Edit Menu
  // -------------------------------------------------------------
  editMenu(m: MenuMaster): void {
    this.menu = { ...m, isActive: !!m.isActive };
    this.isEditMode = true;
  }

  // -------------------------------------------------------------
  // 🔹 Delete Menu with SweetAlert Confirmation
  // -------------------------------------------------------------
  deleteMenu(m: MenuMaster): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${m.menuName}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuService.deleteMenu(m.menuID!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Menu has been deleted successfully.',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadMenus();
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete menu.', 'error');
          }
        });
      }
    });
  }

  // -------------------------------------------------------------
  // 🔹 Reset Form
  // -------------------------------------------------------------
  resetForm(): void {
    this.menu = this.getEmptyMenu();
    this.isEditMode = false;
  }

  // -------------------------------------------------------------
  // 🔹 Sorting
  // -------------------------------------------------------------
  sortBy(column: keyof MenuMaster): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedMenus(): MenuMaster[] {
    let data = [...this.menus];

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

  // -------------------------------------------------------------
  // 🔹 Filter + Sort + Pagination
  // -------------------------------------------------------------
  filteredMenus(): MenuMaster[] {
    let data = this.getSortedMenus().filter(m => {
      const matchesSearch = m.menuName?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter === '' || (!!m.isActive === this.statusFilter);
      return matchesSearch && matchesStatus;
    });

    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }

  // -------------------------------------------------------------
  // 🔹 Page Count Helper
  // -------------------------------------------------------------
  get totalPages(): number {
    return Math.ceil(
      this.getSortedMenus().filter(m => {
        const matchesSearch = m.menuName?.toLowerCase().includes(this.searchText.toLowerCase());
        const matchesStatus = this.statusFilter === '' || (!!m.isActive === this.statusFilter);
        return matchesSearch && matchesStatus;
      }).length / this.pageSize
    );
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // -------------------------------------------------------------
  // 🔹 Get Parent Menu Name
  // -------------------------------------------------------------
  getParentMenuName(parentId?: number | null): string | null {
    const parent = this.menus.find(m => m.menuID === parentId);
    return parent ? parent.menuName : null;
  }

  // -------------------------------------------------------------
  // 🔹 Parent Menu Filter
  // -------------------------------------------------------------
  get parentMenus(): MenuMaster[] {
    return this.menus;
  }
}
