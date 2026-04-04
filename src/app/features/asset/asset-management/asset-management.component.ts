import { Component } from '@angular/core';

@Component({
  selector: 'app-asset-management',
  standalone: false,
  templateUrl: './asset-management.component.html',
  styleUrl: './asset-management.component.css'
})
export class AssetManagementComponent {
canViewAddAsset = false;
canViewAssetRequests = false;
canViewAssetApproval = false;
canViewAssignAssetScreen = false;
canViewMyAssets = false;
selectedTab: string = '';
ngOnInit() {
  this.loadTabPermissions();
}

loadTabPermissions() {
const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const addasset = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "add asset"
  );

  const assignasset = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "assign asset"
  );

  const assetrequests = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "asset request"
  );

  const assetapproval = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "asset approval"
  );

   const myassets = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "my asset"
  );


  this.canViewAddAsset = addasset?.canView ?? false;
  this.canViewAssetRequests = assetrequests?.canView ?? false;
  this.canViewAssetApproval = assetapproval?.canView ?? false;
  this.canViewAssignAssetScreen = assignasset?.canView ?? false;
  this.canViewMyAssets = myassets?.canView ?? false;
  

  if (this.canViewAddAsset) this.selectedTab = 'tab1';
  else if (this.canViewAssetRequests) this.selectedTab = 'tab4';
  else if (this.canViewAssetApproval) this.selectedTab = 'tab3';
  else if (this.canViewAssignAssetScreen) this.selectedTab = 'tab5';
  else if (this.canViewMyAssets) this.selectedTab = 'tab2';
}

}
