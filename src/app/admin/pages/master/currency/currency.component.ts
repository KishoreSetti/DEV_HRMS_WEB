import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService, Company, Region } from '../../../servies/admin.service';

export interface Currency {
  currencyId: number;
  currencyCode: string;
  currencyName: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId?: number;
}

@Component({
  selector: 'app-currency',
  standalone: false,
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.css'
})
export class CurrencyComponent {
  list: Currency[] = [];
  model!: Currency;

  companies: Company[] = [];
  regions: Region[] = [];
  allRegions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  isEditMode = false;
  searchText = '';
  userId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(private service: AdminService) { }

  ngOnInit() {
    this.reset();
    this.loadCompanies();
    this.loadRegions();
    this.load();
  }

  reset() {
    this.model = {
      currencyId: 0,
      currencyCode: '',
      currencyName: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.userId
    };
    this.isEditMode = false;
  }

  load() {
    this.service.getCurrencies(this.userId).subscribe((res: any) => {
      this.list = res?.data ?? res ?? [];
    });

  }

  onCompanyChange() {
    this.model.regionId = 0;
    this.regions = this.allRegions.filter(r => r.companyID == this.model.companyId);
  }

  onSubmit() {
    this.model.userId = this.userId;

    const obs = this.isEditMode
      ? this.service.updateCurrency(this.model)
      : this.service.createCurrency(this.model);

    obs.subscribe((res: any) => {

      if (!res.success) {
        Swal.fire('Warning', 'Duplicate Currency exists', 'warning');
        return;
      }

      Swal.fire('Success', res.message, 'success');
      this.load();
      this.reset();
    });
  }

  edit(x: Currency) {
    this.model = { ...x };
    this.regions = this.allRegions.filter(r => r.companyID == x.companyId);
    this.isEditMode = true;
  }

  delete(x: Currency) {
    Swal.fire({
      title: 'Delete this record?',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.service.deleteCurrency(x.currencyId).subscribe(() => {
          this.load();
        });
      }
    });
  }

  loadCompanies() {
    this.service.getCompanies(null, this.userId).subscribe((res: any) => {
      const data = res.data || res;
      this.companies = data.filter((x: any) => x.isActive);

      this.companies.forEach((c: any) => {
        this.companyMap[c.companyId] = c.companyName;
      });
    });
  }

  loadRegions() {
    this.service.getRegions(null, this.userId).subscribe((res: any) => {
      const data = res.data || res;

      this.allRegions = data.filter((x: any) => x.isActive);

      this.allRegions.forEach((r: any) => {
        this.regionMap[r.regionID] = r.regionName;
      });

      this.regions = [];
    });
  }

  filtered() {
    return this.list.filter(x =>
      (x.currencyName || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
      (x.currencyCode || '').toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
