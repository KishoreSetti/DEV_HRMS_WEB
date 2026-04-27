import { Component } from '@angular/core';
// import { MenuItem } from '../../admin/layout/models/menu-item.model';
import { AdminService,MenuRoleDto,MenuItem } from '../../admin/servies/admin.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
 menuItems: MenuItem[] = [];
  roleId: number = 1; // e.g. get from logged-in user or JWT
  isMobileMenuOpen = false;

  constructor(private menuService: AdminService) {}
  ngOnInit() {
      const roleId = Number(sessionStorage.getItem('roleId'));
    this.loadMenus(roleId);
    // const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // this.role = currentUser.role;
    // sessionStorage.setItem('role', this.role);
    // this.setMenuByRole(this.role);
  }
  toggle(item: any, event: Event) {
  event.stopPropagation();
  this.menuItems.forEach(i => {
    if (i !== item) {
      i.isOpen = false;
    }
  });

  item.isOpen = !item.isOpen;
}
toggleMobileMenu() {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
}
closeMobileMenu() {
  this.isMobileMenuOpen = false;
}
  loadMenus(roleId: number): void {
    this.menuService.getMenusByRoleId(roleId).subscribe({
      next: (menus: any) => {
      sessionStorage.setItem("Menus",JSON.stringify(menus));
        this.menuItems =this.sortMenuItems(this.mapToMenuItems(menus));
      },
      error: (err) => console.error('Error loading menus', err)
    });
  }
  sortMenuItems(items: any[]): any[] {
  return items
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      ...item,
      children: item.children ? this.sortMenuItems(item.children) : []
    }));
}

//   private mapToMenuItems(menuDtos: MenuRoleDto[]): MenuItem[] {
//   // Build a flat map for quick access
//   const menuMap: { [key: number]: MenuItem } = {};
//   const rootMenus: MenuItem[] = [];

//   for (const dto of menuDtos) {
//     const item: MenuItem = {
//       label: dto.menuName,
//       link: dto.menuUrl,
//       icon: dto.icon,
//       orderNo: dto.orderNo, // 👈 include order field
//       children: []
//     };
//     menuMap[dto.menuId] = item;
//   }

//   // Link children to parents
//   for (const dto of menuDtos) {
//     if (dto.parentId && menuMap[dto.parentId]) {
//       menuMap[dto.parentId].children!.push(menuMap[dto.menuId]);
//     } else {
//       rootMenus.push(menuMap[dto.menuId]);
//     }
//   }

//   // Sort recursively by orderNo
//   const sortByOrder = (items: MenuItem[]) => {
//     items.sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0));
//     items.forEach(item => {
//       if (item.children?.length) {
//         sortByOrder(item.children);
//       }
//     });
//   };

//   sortByOrder(rootMenus);

//   return rootMenus;
// }
private mapToMenuItems(menuDtos: MenuRoleDto[]): MenuItem[] {

  const menuMap: { [key: number]: MenuItem } = {};
  const rootMenus: MenuItem[] = [];

  for (const dto of menuDtos) {
    const item: MenuItem = {
      menuId: dto.menuId,   // 👈 store menuId
      label: dto.menuName,
      link: dto.menuUrl,
      icon: dto.icon,
      orderNo: dto.orderNo,
      children: []
    };

    menuMap[dto.menuId] = item;
  }

  for (const dto of menuDtos) {
    if (dto.parentId && menuMap[dto.parentId]) {
      menuMap[dto.parentId].children!.push(menuMap[dto.menuId]);
    } else {
      rootMenus.push(menuMap[dto.menuId]);
    }
  }

  return rootMenus;
}

  setMenuByRole(role: string) {
     const superadminMenu: MenuItem[] = [
      { label: 'Dashboard', link: '/dashboard',icon: 'fas fa-home' },
        { label: 'Employee Profile', link:'/profile',  icon: 'fas fa-user', children: [
        { label: 'Profile' , link:'/profile'},
        { label: 'Digital Business Card', link:'/digitalbusiness' },
        { label: 'Details', link:'/details',children:[
        {label: 'Personal Details', link:'/details'},
        {label: 'Family Details', link:'/details'},
        { label: 'Emergency Contact', link:'/details'},
        { label: 'References', link:'/details'}]},
        { label: 'Skills', link:'/skills',children:[
        { label: 'Job History', link:'/skills'},
        { label: 'Certification', link:'/skills'},
        { label: 'Education',link:'/skills'}]},
        { label: 'Documents',link:'/documents',children:[
        { label: 'HR Letters',link:'/documents'},
        { label: 'Forms',link:'/documents'},
        { label: 'Employee Documents',link:'/documents'}]},
        { label: 'Finance',link:'/finance',children:[
        { label: 'Bank Details',link:'/finance'},
        { label: 'DD',link:'/finance'},
        { label: 'W4',link:'/finance'}]},
        { label: 'Seperation Request',link:'/resignation',children:[
        { label: 'Resignation/Exit',link:'/resignation'},
        
       ]},
         { label: 'Immigration',link:'/immigration'},
      ]},
      
      { label: 'Attendance',icon: 'fas fa-clock',children: [
        { label: 'Clock-in / Clock-out',link:'/clockin-out' },
        { label: 'Shift allocation',link:'/shift-allocation' },
        { label: 'Daily working hours',link:'/daily-working-hours' },
        { label: 'Late Arrivals',link:'/late-arrivals' },
        { label: 'Early Departures',link:'/early-departures' },
        { label: 'WFH/Remote Requests',link:'/wfh-remote-request' },
        { label: 'Geo Fencing' },
        { label: 'Missed Punched Requests',link:'/missed-punch-request' },
        { label: 'Biometric Integration' }
      ]},
      { label: 'Leaves',link:'/leave-management', icon: 'fas fa-calendar-alt', children: [
        { label: 'View/Apply',link:'/leave-management' },
        { label: 'Approve',link:'/leave-management' },
         { label: 'Leave Calendar' ,link:'/leave-management'}
      ]},
      { label: 'Expenses', link: '/expenses',icon: 'fas fa-money-bill-wave' } ,
      { label: 'Compensation', link: '/compensation',icon: 'fas fa-hand-holding-usd' } ,
      { label: 'Asset', link: '/asset', icon: 'fas fa-boxes' } ,
      { label: 'TimeSheet', link: '/timesheet',icon:'fas fa-calendar-check' } ,
       { label: 'Recruitment', link: '/recruitment',icon:'fas fa-calendar-check' } ,
      
      { label: 'More',icon: 'fas fa-ellipsis-h', children:[
        { label: 'Performance', link: '/kpi-performance',icon: 'fas fa-chart-line' } ,
      { label: 'Help Desk', link: '/help-desk',icon:'fas fa-headset' },
        { label: 'Company News',link: '/company-news',icon:'fas fa-newspaper' },
        { label: 'Policies',link: '/company-policies',icon:'fas fa-file-alt' },
        { label: 'Events',link:'/my-event',icon:'fas fa-calendar-alt' },
        { label: 'My Team' ,link: '/my-team',icon:'fas fa-users'},
        { label: 'My Calendar',link:'/my-calendar',icon:'fas fa-calendar-alt'}
      ] }
    ];
    const commonMenu: MenuItem[] = [
      { label: 'Dashboard', link: '/dashboard' , icon: 'fas fa-tachometer-alt'},
      { label: 'Employee Profile',  icon: 'fas fa-user',children: [
        { label: 'Profile' },
        { label: 'Digital Business Card' },
        { label: 'Details',children:[
        {label: 'Personal Details'},
        {label: 'Family Details'},
        { label: 'Emergency Contact'},
        { label: 'References'}]},
        { label: 'Skills',children:[
        { label: 'Job History'},
        { label: 'Certification'},
        { label: 'Education'}]},
        { label: 'Documents',children:[
        { label: 'HR Letters'},
        { label: 'Forms'},
        { label: 'Employee Documents'}]},
        { label: 'Finance',children:[
        { label: 'Bank Details'},
       ]},
        { label: 'Seperation Request',children:[
        { label: 'Resignation'},
        { label: 'Exit Process'},
       ]},
         { label: 'Immigration'},
      ]},
      { label: 'Attendance',icon: 'fas fa-clock',children: [
        { label: 'Clock-in / Clock-out' },
        { label: 'Shift timings' },
        { label: 'Daily working hours' },
        { label: 'Late Arrivals' },
        { label: 'Early Departures' },
        { label: 'WFH/Remote Requests' },
        { label: 'Geo Fencing' },
        { label: 'Missed Punched Requests' },
        { label: 'Biometric Integration' }
      ]},
      { label: 'Leaves',icon: 'fas fa-calendar-alt', children: [
        { label: 'View/Apply' },
       
      ]},
    
      { label: 'Expenses', link: '/Expenses' ,icon: 'fas fa-money-bill-wave'} ,
      
    ];

    const roleBasedMenu: { [key: string]: MenuItem[] } = {
      'HR': [...commonMenu,
       { label: 'Asset', link: '/Asset', icon: 'fas fa-boxes' } ,
      { label: 'TimeSheet', link: '/TimeSheet',icon:'fas fa-calendar-check' } ,
      { label: 'Performance', link: '/Performance',icon: 'fas fa-chart-line' } ,
      { label: 'Compensation', link: '/Compensation',icon: 'fas fa-hand-holding-usd' } ,
         { label: 'More',icon: 'fas fa-ellipsis-h', children:[
        
      { label: 'Help Desk', link: '/helpdesk' },
        { label: 'Company News' },
        { label: 'Policies' },
        { label: 'Events' },
        { label: 'My Team' },
        { label: 'My Calendar'}
      ] }
      ],
      'Manager': [...commonMenu,
        { label: 'Team Overview' },
        
      ],
      'Finance': [...commonMenu,
        { label: 'Finance', children: [
          { label: 'Bank Details' },
          { label: 'DD' },
          { label: 'W4' }
        ]},
        
      ],
      'Employee': [ ...commonMenu,
       
       
      ],
      'Admin': [ ...commonMenu,
        { label: 'Admin Panel' },
       
      ],
      'SuperAdmin': [ ...superadminMenu
       
      ]
    };

    this.menuItems = roleBasedMenu[role] || commonMenu;
  }
   setMenu(menu: MenuItem) {

  if(menu.menuId){
    sessionStorage.setItem("menuId", menu.menuId.toString());
  }

}
}
