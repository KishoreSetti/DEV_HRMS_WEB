import { Component } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visatype',
  standalone: false,
  templateUrl: './visatype.component.html',
  styleUrl: './visatype.component.css'
})
export class VisatypeComponent {
  visaTypes: any[] = [];
  companies: any[] = [];
  regions: any[] = [];

  visa: any = this.getEmptyVisa();
  isEditMode = false;
  filteredRegions: any[] = [];

  userId = Number(sessionStorage.getItem("UserId"));
constructor(private service: AdminService) {}
ngOnInit() {
    this.loadVisaTypes();
    this.loadCompanies();
    this.loadRegions();
  }
getEmptyVisa() {
    return {
      visaTypeId: 0,
      visaType1: '',
      description: '',
      companyId: '',
      regionId: '',
      isActive: true,
      userId: Number(sessionStorage.getItem("UserId"))
    };
  }
  loadVisaTypes() {
  this.service.getVisaTypeList(this.userId).subscribe((res:any)=>{
    this.visaTypes = res.data;  
  });
}

  loadCompanies() {
    this.service.getCompanies(null,this.userId)
      .subscribe(res => this.companies = res);
  }

  loadRegions() {
  this.service.getRegions(null, this.userId)
    .subscribe((res: any) => {
      this.regions = res?.data ?? res ?? [];
    });
}
onCompanyChange() {

  // reset region selection
  this.visa.regionId = '';

  if (this.visa.companyId) {
    // ✅ filter regions
    this.filteredRegions = this.regions.filter(r =>
      Number(r.companyID) === Number(this.visa.companyId)
    );
  } else {
    this.filteredRegions = [];
  }
}
  onSubmit() {
    this.visa.userId = Number(sessionStorage.getItem("UserId"));
  if (this.isEditMode) {
    this.service.updateVisaType(this.visa).subscribe(()=>{
      Swal.fire('Updated!', 'Visa Type updated', 'success');
      this.loadVisaTypes();
      this.resetForm();
    });
  } else {
    this.service.createVisaType(this.visa).subscribe(()=>{
      Swal.fire('Added!', 'Visa Type created', 'success');
      this.loadVisaTypes();
      this.resetForm();
    });
  }
}

  editVisa(v:any) {
    this.visa = {...v};
    this.isEditMode = true;
    this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.visa.companyId)
  );
  }

  deleteVisa(v:any) {
  Swal.fire({
    title: `Delete "${v.visaType}"?`,
    icon: 'warning',
    showCancelButton: true
  }).then((result)=>{
    if(result.isConfirmed){
      this.service.deleteVisaType(v.visaTypeId).subscribe(()=>{
        Swal.fire('Deleted!', 'Visa Type removed', 'success');
        this.loadVisaTypes();
      });
    }
  });
}

  resetForm() {
    this.visa = this.getEmptyVisa();
    this.isEditMode = false;
  }

  getCompanyName(id:number){
    return this.companies.find(x=>x.companyId==id)?.companyName || '-';
  }

  getRegionName(id:number){
    return this.regions.find(x=>x.regionID==id)?.regionName || '-';
  }

}
