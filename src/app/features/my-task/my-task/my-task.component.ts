import { Component } from '@angular/core';

@Component({
  selector: 'app-my-task',
  standalone: false,
  templateUrl: './my-task.component.html',
  styleUrl: './my-task.component.css'
})
export class MyTaskComponent {
 canViewMyTask = false;
  canViewTeamTask = false;
  canViewTaskReport = false;
  selectedTab: string = '';

  ngOnInit(): void {
    this.loadTabPermissions();
  }

  loadTabPermissions(): void {
    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const mytask = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'my task'
    );

    const teamtask = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'team task'
    );

    const taskreport = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'task report'
    );

    this.canViewMyTask = mytask?.canView ?? false;
    this.canViewTeamTask = teamtask?.canView ?? false;
    this.canViewTaskReport = taskreport?.canView ?? false;

    if (this.canViewMyTask) {
      this.selectedTab = 'tab1';
    } else if (this.canViewTeamTask) {
      this.selectedTab = 'tab2';
    } else if (this.canViewTaskReport) {
      this.selectedTab = 'tab3';
    }
  }
}
