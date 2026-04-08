import { Component, OnInit } from '@angular/core';
import { TaxSetting } from '../../../layout/models/tax-setting.model';
import { EmployeePayRollService, SalaryComponent } from '../../../../employee-pay-roll.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-tax-settings',
  standalone: false,
  templateUrl: './tax-settings.component.html',
  styleUrl: './tax-settings.component.css'
})
export class TaxSettingsComponent {

  userId!: number;
  companyId!: string;
  regionId!: string;

  structure: any;
  structures: any[] = [];
  salaryComponents: any[] = [];

  companies: any[] = [];
  regions: any[] = [];

  companyMap: { [key: string]: string } = {};
  regionMap: { [key: string]: string } = {};

  isEditMode = false;
  searchText = '';
  currentPage = 1;
  pageSize = 5;

  departments: any[] = [];
  designations: any[] = [];

  departmentMap: { [key: number]: string } = {};
  designationMap: { [key: number]: string } = {};

  constructor(
    private payrollService: EmployeePayRollService
  ) { }

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem('userCompanyId'));
    this.companyId = sessionStorage.getItem('CompanyId') || '';
    this.regionId = sessionStorage.getItem('RegionId') || '';

    this.structure = this.getEmptyStructure();

    this.loadStructures();
    this.loadSalaryComponents();
    this.loadCompanies();
    this.loadRegions();
    this.loadDepartments();
    this.loadDesignations();
  }

  getEmptyStructure() {
    return {
      structureName: '',
      departmentId: null,
      designationId: null,
      gradeId: null,
      isActive: true,
      companyId: null,
      regionId: null,
      components: []
    };
  }

  loadStructures() {
    this.payrollService.getAllSalaryStructures(this.userId)
      .subscribe((res: any) => this.structures = res || []);
  }

  loadSalaryComponents() {
    this.payrollService.getComponents(this.userId)
      .subscribe((res: any) => this.salaryComponents = res || []);
  }

  loadCompanies() {
    this.payrollService.getCompanies(this.userId)
      .subscribe((res: any) => {
        this.companies = res || [];
        console.log('Companies:', res);
        this.companies.forEach(c => {
          this.companyMap[c.companyId] = c.companyName;
        });
      });
  }

  loadRegions() {
    this.payrollService.getRegions(this.userId)
      .subscribe((res: any) => {

        console.log('Regions API:', res);

        if (res && Array.isArray(res)) {

          this.regions = res.map((r: any) => ({
            regionId: r.regionID,        // ✅ FIX HERE
            regionName: r.regionName
          }));

          // Mapping (for table display)
          this.regions.forEach(r => {
            this.regionMap[r.regionId] = r.regionName;
          });

        } else {
          this.regions = [];
        }
      });
  }
  loadDepartments() {
    this.payrollService.getDepartments(this.userId)
      .subscribe((res: any) => {
        console.log("Departments API:", res);

        if (res && res.success && Array.isArray(res.data)) {

          this.departments = res.data;  // ✅ IMPORTANT

          // Optional mapping
          this.departments.forEach((d: any) => {
            this.departmentMap[d.departmentId] = d.description;
          });

        } else {
          this.departments = [];
        }
      });
  }
  loadDesignations() {
    this.payrollService.getDesignations(this.userId)
      .subscribe((res: any) => {

        if (res && res.success && Array.isArray(res.data)) {

          this.designations = res.data.map((d: any) => ({
            designationId: d.designationID,   // ✅ mapping fix
            designationName: d.designationName
          }));

        } else {
          this.designations = [];
        }
      });
  }

  addComponent() {
    this.structure.components.push({
      componentId: null,
      value: null,
      calculationType: ''
    });
  }

  removeComponent(index: number) {
    this.structure.components.splice(index, 1);
  }

  onSubmit() {
    this.structure.departmentId = this.structure.departmentId ? Number(this.structure.departmentId) : null;
    this.structure.designationId = this.structure.designationId ? Number(this.structure.designationId) : null;
    this.structure.regionId = this.structure.regionId ? String(this.structure.regionId) : null;
    this.structure.companyId = this.structure.companyId ? String(this.structure.companyId) : null;

    console.log("Final Payload:", this.structure);

    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    if (this.isEditMode && this.structure.structureId) {

      this.payrollService.updateSalaryStructure(
        this.structure.structureId,
        this.userId,
        this.structure
      ).subscribe(() => {
        Swal.close();
        Swal.fire('Updated!', '', 'success');
        this.loadStructures();
        this.resetForm();
      });

    } else {

      this.payrollService.createSalaryStructure(
        this.userId,
        this.structure
      ).subscribe(() => {
        Swal.close();
        Swal.fire('Created!', '', 'success');
        this.loadStructures();
        this.resetForm();
      });
    }
  }

  editStructure(s: any) {
    this.payrollService
      .getSalaryStructureById(s.structureId, this.userId)
      .subscribe((res: any) => {
        res.companyId = res.companyId ? Number(res.companyId) : null;
        res.regionId = res.regionId ? Number(res.regionId) : null;

        this.structure = res;
        this.isEditMode = true;
      });
  }

  deleteStructure(s: any) {

    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {

      if (result.isConfirmed) {

        this.payrollService
          .deleteSalaryStructure(s.structureId, this.userId)
          .subscribe(() => {
            Swal.fire('Deleted!', '', 'success');
            this.loadStructures();
          });
      }
    });
  }

  resetForm() {
    this.structure = this.getEmptyStructure();
    this.isEditMode = false;
  }
  filteredStructures() {
    return this.structures.filter(s =>
      s.structureName?.toLowerCase()
        .includes(this.searchText.toLowerCase())
    );
  }

  paginatedStructures() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStructures().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredStructures().length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      console.log("Page:", this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  onSearchChange() {
    this.currentPage = 1;
  }

  
}
