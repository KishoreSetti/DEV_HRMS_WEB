import { Component, OnInit } from '@angular/core';
import { AdminService, Company, GeoLocation, LateLoginPolicy, Region } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-geo-location',
  standalone: false,
  templateUrl: './geo-location.component.html',
  styleUrl: './geo-location.component.css'
})
export class GeoLocationComponent {
  locations: GeoLocation[] = [];
  location: GeoLocation = this.getEmpty();

  companies: Company[] = [];
  regions: Region[] = [];
  filteredRegions: Region[] = [];

  isEditMode = false;
  userId = Number(sessionStorage.getItem('UserId') || 0);

  constructor(
    private service: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadLocations();
  }

  getEmpty(): GeoLocation {
    return {
      geoLocationId: 0,
      companyId: 0,
      regionId: 0,
      userId: this.userId,
      locationName: '',
      address: '',
      latitude: 0,
      longitude: 0,
      radius: 0,
      isActive: true
    };
  }

  loadCompanies() {
    this.service.getCompanies(null, this.userId).subscribe(res => {
      this.companies = res.filter((c: any) => c.isActive);
    });
  }

  loadRegions() {
    this.service.getRegions(null, this.userId).subscribe(res => {
      this.regions = res.filter((r: any) => r.isActive);
    });
  }

  onCompanyChange() {
    this.filteredRegions = this.regions.filter(r =>
      Number(r.companyID) === Number(this.location.companyId)
    );
    this.location.regionId = 0;
  }

loadLocations() {
  this.spinner.show();

  this.service.getGeoLocations(this.userId).subscribe({
    next: (res: any) => {
      this.locations = res || [];
      this.spinner.hide();
    },
    error: () => this.spinner.hide()
  });
}

  onSubmit() {

    this.location.userId = this.userId;

    const req = this.isEditMode
      ? this.service.updateGeoLocation(this.location.geoLocationId, this.location)
      : this.service.createGeoLocation(this.location);

    req.subscribe(() => {
      this.loadLocations();
      this.resetForm();
    });
  }

  edit(g: GeoLocation) {
    this.location = { ...g };
    this.isEditMode = true;

    this.filteredRegions = this.regions.filter(r =>
      Number(r.companyID) === Number(g.companyId)
    );
  }

  delete(g: GeoLocation) {
    this.service.deleteGeoLocation(g.geoLocationId).subscribe(() => {
      this.loadLocations();
    });
  }

  resetForm() {
    this.location = this.getEmpty();
    this.filteredRegions = [];
    this.isEditMode = false;
  }

  getCompanyName(id: number) {
    return this.companies.find(c => c.companyId == id)?.companyName || 'N/A';
  }

  getRegionName(id: number) {
    return this.regions.find(r => r.regionID == id)?.regionName || 'N/A';
  }
}
