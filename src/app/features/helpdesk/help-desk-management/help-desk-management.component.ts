import { Component } from '@angular/core';

@Component({
  selector: 'app-help-desk-management',
  standalone: false,
  templateUrl: './help-desk-management.component.html',
  styleUrl: './help-desk-management.component.css'
})
export class HelpDeskManagementComponent {
canViewRaiseTicket = false;
canViewMyTickets = false;
canViewTicketApproval = false;
selectedTab: string = '';

ngOnInit(): void {
  this.LoadTabPermissions();
}
LoadTabPermissions() {
  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const raise = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "raise ticket"
  );

  const mytickets = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "my tickets"
  );

  const ticketapproval = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "ticket approval"
  );

 

  this.canViewRaiseTicket = raise?.canView ?? false;
  this.canViewMyTickets = mytickets?.canView ?? false;
  this.canViewTicketApproval = ticketapproval?.canView ?? false;

  if (this.canViewRaiseTicket) this.selectedTab = 'tab1';
  else if (this.canViewMyTickets) this.selectedTab = 'tab2';
  else if (this.canViewTicketApproval) this.selectedTab = 'tab3';
}


}
