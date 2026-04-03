import { Component } from '@angular/core';
import { AdminService, RoleMaster } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
interface SubmodulePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

interface MenuNode {
  id: number;
  name: string;
  parentId?: number | null;
  selected: boolean;
  expanded: boolean;
  permissions?: SubmodulePermissions;
  children: MenuNode[];
}

interface Submodule {
  name: string;
  permissions: SubmodulePermissions;
}
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve';

export type PermissionSet = {
  [key in PermissionAction]: boolean;
};

interface MenuItem {
  menuID: number;
  parentMenuID: number | null | undefined;
  name: string;
  selected: boolean;
  expanded: boolean;
  permissions: PermissionSet;
  allowedActions: PermissionAction[];

  children: MenuItem[];
}
interface Module {
  name: string;
  selected: boolean;
  expanded: boolean;
  submodules: Submodule[];
}
@Component({
  selector: 'app-roles-permissions',
  standalone: false,
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.css'
})
export class RolesPermissionsComponent {

  Math = Math; // expose for pagination math
  actions: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve'];
  // ---------- Role Data ----------
  roles: RoleMaster[] = [];
  role: RoleMaster = this.getEmptyRole();
  isEditMode = false;

  // ---------- Pagination & Sorting ----------
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  pageSizes = [10, 20, 50, 100];
  totalPages = 0;
  pagedRegions: RoleMaster[] = [];
  sortBy = 'roleName';
  isDescending = false;

  // ---------- Filters ----------
  searchText = '';
  statusFilter: boolean | '' = '';

  // ---------- Permissions ----------
  permissions: MenuItem[] = [];


  constructor(private roleService: AdminService) { }

  ngOnInit(): void {
    this.loadRoles();
    this.loadMenuPermissions(); // ✅ Fetch MenuMaster hierarchy dynamically
  }
  // Called when user clicks checkbox
  // called from (change) on checkbox; event gives the clicked checked value
  toggleModulePermissionsWithSelect(menu: MenuItem, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    // set the selected flag (optional if you use it elsewhere)
    menu.selected = checked;
    // apply permission changes recursively
    this.applyPermissionsAndSelectionRecursive(menu, checked);
    // update parents so their checked/indeterminate reflect child states
    this.updateAncestorsSelection(menu);
  }

  /**
   * Recursively set all permissions and selected flag for menu and its children.
   */
  applyPermissionsAndSelectionRecursive(menu: MenuItem, checked: boolean): void {
    if (!menu) return;

    // set all permission flags on this menu
    if (menu.permissions) {
      (Object.keys(menu.permissions) as PermissionAction[]).forEach((k) => {
        menu.permissions[k] = checked;
      });
    }

    // mark selected flag
    menu.selected = checked;

    // recurse to children
    if (Array.isArray(menu.children) && menu.children.length) {
      menu.children.forEach(child => {
        this.applyPermissionsAndSelectionRecursive(child, checked);
      });
    }
  }

  /**
   * After a change, update parent items so their selected state reflects children.
   * This sets parent.selected = hasAnyPermission(parent) (or all children selected if you prefer).
   */
  updateAncestorsSelection(changedMenu: MenuItem): void {
    const parent = this.findParent(this.permissions, changedMenu);
    if (!parent) return;

    // parent.selected = true if any child has any permission (or you can use all children)
    parent.selected = parent.children.some(c => this.hasAnyPermission(c));
    // also update parent's permission checkboxes if you want parent to mirror
    // parent.selected could be used only for UI; don't auto-set parent's permissions here unless desired

    // recurse upward
    this.updateAncestorsSelection(parent);
  }

  /**
   * findParent: returns parent MenuItem or null
   */
  findParent(list: MenuItem[], child: MenuItem): MenuItem | null {
    for (const item of list) {
      if (item.children && item.children.includes(child)) return item;
      const found = this.findParent(item.children || [], child);
      if (found) return found;
    }
    return null;
  }

  // ---------- Helpers ----------
  getEmptyRole(): RoleMaster {
    return {
      roleName: '',
      roleDescription: '',
      isActive: true,
      userId: Number(sessionStorage.getItem("UserId"))
    };
  }

  getEmptyPermissions(): SubmodulePermissions {
    return { view: false, add: false, edit: false, delete: false, approve: false };
  }

  // ---------- CRUD Operations ----------
  loadRoles(): void {
    this.roleService.getroles(Number(sessionStorage.getItem("UserId"))).subscribe({
      next: (response: any) => {
        this.roles = response.items || response; // handle both array or paginated format
        this.totalCount = response.totalCount || this.roles.length;
      },
      error: () => Swal.fire('Error', 'Failed to load roles.', 'error')
    });
  }


  onSubmit(): void {
    const request = this.isEditMode
      ? this.roleService.updateRoles(this.role.roleId!, this.role)
      : this.roleService.createRoles(this.role);

    request.subscribe({
      next: () => {
        Swal.fire(this.isEditMode ? 'Updated!' : 'Created!', `Role ${this.isEditMode ? 'updated' : 'created'} successfully.`, 'success');
        this.resetForm();
        this.loadRoles();
      },
      error: () => Swal.fire('Error', `Failed to ${this.isEditMode ? 'update' : 'create'} role.`, 'error')
    });
  }

  editRole(role: RoleMaster): void {
    this.role = { ...role };
    this.isEditMode = true;
  }

  deleteRole(role: RoleMaster): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete role "${role.roleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.roleService.deleteRoles(role.roleId!).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Role deleted successfully.', 'success');
            this.loadRoles();
          },
          error: () => Swal.fire('Error', 'Failed to delete role.', 'error')
        });
      }
    });
  }

  resetForm(): void {
    this.role = this.getEmptyRole();
    this.isEditMode = false;
  }

  // ---------- Sorting & Pagination ----------
  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.isDescending = !this.isDescending;
    } else {
      this.sortBy = column;
      this.isDescending = false;
    }
    this.loadRoles();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadRoles();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNumber = 1;
    this.loadRoles();
  }

  // ---------- Permissions Management ----------
  // Determines if any permission is true (used in [checked] binding)
  /**
   * hasAnyPermission: existing helper you already have
   * returns true if this node OR any descendant has any permission=true
   */
  hasAnyPermission(menu: MenuItem | null | undefined): boolean {
    if (!menu) return false;

    const own =
      !!menu.permissions &&
      (!!menu.permissions.view ||
        !!menu.permissions.create ||
        !!menu.permissions.edit ||
        !!menu.permissions.delete ||
        !!menu.permissions.approve);

    const childHas = Array.isArray(menu.children) && menu.children.some(ch => this.hasAnyPermission(ch));

    return !!(own || childHas);
  }

  // ✅ Expand/collapse module
  toggleModule(menu: MenuItem): void {
    menu.expanded = !menu.expanded;
  }
  // Recursively apply permissions and child selections
  toggleModulePermissions(menu: any, checked: boolean): void {
    // Set this menu’s permissions
    if (menu.permissions) {
      Object.keys(menu.permissions).forEach(key => {
        menu.permissions[key] = checked;
      });
    }

    // Apply recursively to children
    if (Array.isArray(menu.children)) {
      menu.children.forEach((child: any) => {
        child.selected = checked;
        this.toggleModulePermissions(child, checked);
      });
    }
  }

  applyPermissionsRecursive(menu: any, checked: boolean): void {
    // Apply to this menu
    if (menu.permissions) {
      Object.keys(menu.permissions).forEach(key => {
        menu.permissions[key] = checked;
      });
    }

    // Apply recursively to all children
    if (Array.isArray(menu.children)) {
      menu.children.forEach((child: any) => {
        this.applyPermissionsRecursive(child, checked);
      });
    }
  }


  updateParentStatus(menu: MenuItem): void {
    const parent = this.findParent(this.permissions, menu);
    if (parent) {
      parent.selected = parent.children.every(c => c.selected);
      this.updateParentStatus(parent);
    }
  }


  resetPermissions(): void {
    this.permissions.forEach(m => this.applyPermissionsRecursive(m, false));
  }

  // resetPermissions(): void {
  //   this.permissions.forEach(module => {
  //     module.selected = false;
  //     module.expanded = false;
  //     module.submodules.forEach(sub =>
  //       this.actions.forEach(action => sub.permissions[action] = false)
  //     );
  //   });
  // }

  // ---------- Fetch Dynamic MenuMaster ----------
  //  ✅ Load Menus and build hierarchy
  loadMenuPermissions(): void {

    this.roleService.getMenus().subscribe({
      next: (menus: any[]) => {
        menus.forEach(m => {
          console.log('MENU:', m.menuName, {
            canView: m.canView,
            canAdd: m.canAdd,
            canEdit: m.canEdit,
            canDelete: m.canDelete,
            canApprove: m.canApprove
          });
        });

        const menuMap = new Map<number, MenuItem>();

        // Step 1: initialize all menu items
        menus.forEach(m => {

          const allowedActions: PermissionAction[] = [];

          if (m.canView) allowedActions.push('view');
          if (m.canAdd) allowedActions.push('create');
          if (m.canEdit) allowedActions.push('edit');
          if (m.canDelete) allowedActions.push('delete');
          if (m.canApprove) allowedActions.push('approve');

          menuMap.set(m.menuID, {
            menuID: m.menuID,
            parentMenuID: m.parentMenuID,
            name: m.menuName,
            selected: false,
            expanded: false,

            permissions: {
              view: false,
              create: false,
              edit: false,
              delete: false,
              approve: false
            },

            // ✅ IMPORTANT
            allowedActions: allowedActions,

            children: []
          });
        });

        // Step 2: build hierarchy
        const roots: MenuItem[] = [];
        menuMap.forEach(menu => {
          if (menu.parentMenuID) {
            const parent = menuMap.get(menu.parentMenuID);
            parent?.children.push(menu);
          } else {
            roots.push(menu);
          }
        });

        this.permissions = roots;
      },
      error: () => Swal.fire('Error', 'Failed to load menu permissions.', 'error')
    });
  }
  // loadMenuPermissions(): void {
  //   if (!this.role.roleId) return;

  //   // Load both menus and role permissions
  //   forkJoin({
  //     menus: this.roleService.getMenus(),
  //     rolePerms: this.roleService.getPermissionsByRole(this.role.roleId)
  //   }).subscribe({
  //     next: ({ menus, rolePerms }) => {
  //       const menuMap = new Map<number, MenuItem>();

  //       menus.forEach(m => {
  //         const perm = rolePerms.find((p: any) => p.menuId === m.menuID);
  //         menuMap.set(m.menuID, {
  //           menuID: m.menuID,
  //           parentMenuID: m.parentMenuID,
  //           name: m.menuName,
  //           selected: perm ? perm.isActive : false,
  //           expanded: false,
  //           permissions: {
  //             view: perm ? perm.canView : false,
  //             create: perm ? perm.canAdd : false,
  //             edit: perm ? perm.canEdit : false,
  //             delete: perm ? perm.canDelete : false,
  //             approve: perm ? perm.canApprove : false
  //           },
  //           children: []
  //         });
  //       });

  //       // build hierarchy
  //       const roots: MenuItem[] = [];
  //       menuMap.forEach(menu => {
  //         if (menu.parentMenuID) {
  //           const parent = menuMap.get(menu.parentMenuID);
  //           parent?.children.push(menu);
  //         } else {
  //           roots.push(menu);
  //         }
  //       });

  //       this.permissions = roots;
  //     },
  //     error: () => Swal.fire('Error', 'Failed to load menu permissions.', 'error')
  //   });
  // }
  fnChangeRoles(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const roleId = Number(selectElement.value);
    if (!roleId) return;

    this.role.roleId = roleId;
    this.loadMenusWithRolePermissions(roleId);
  }
  savePermissions(): void {
    if (!this.role.roleId) {
      Swal.fire('Error', 'Please select or create a role first.', 'warning');
      return;
    }

    const flattened: any[] = [];
    this.flattenPermissions(this.permissions, flattened);

    this.roleService.assignPermissions(this.role.roleId, flattened).subscribe({
      next: () => Swal.fire('Success', 'Permissions saved successfully!', 'success'),
      error: () => Swal.fire('Error', 'Failed to save permissions.', 'error')
    });
  }

  // Helper: Flatten menu tree for API
  flattenPermissions(items: MenuItem[], output: any[]): void {
    items.forEach(menu => {
      output.push({
        menuId: menu.menuID,
        canView: menu.permissions.view,
        canAdd: menu.permissions.create,
        canEdit: menu.permissions.edit,
        canDelete: menu.permissions.delete,
        canApprove: menu.permissions.approve,
        isActive: menu.selected
      });
      if (menu.children?.length) this.flattenPermissions(menu.children, output);
    });
  }
  loadMenusWithRolePermissions(roleId: number): void {
    forkJoin({
      menus: this.roleService.getMenus(),
      rolePerms: this.roleService.getPermissionsByRole(roleId)
    }).subscribe({
      next: ({ menus, rolePerms }) => {
        const menuMap = new Map<number, MenuItem>();

        // Step 1: Create menu items and merge with role permissions
        menus.forEach(m => {

          const allowedActions: PermissionAction[] = [];

          if (m.canView) allowedActions.push('view');
          if (m.canAdd) allowedActions.push('create');
          if (m.canEdit) allowedActions.push('edit');
          if (m.canDelete) allowedActions.push('delete');
          if (m.canApprove) allowedActions.push('approve');

          menuMap.set(m.menuID, {
            menuID: m.menuID,
            parentMenuID: m.parentMenuID,
            name: m.menuName,
            selected: false,
            expanded: false,

            permissions: {
              view: false,
              create: false,
              edit: false,
              delete: false,
              approve: false
            },

            // ✅ IMPORTANT
            allowedActions: allowedActions,

            children: []
          });
        });

        // Step 2: Build hierarchy (parent-child)
        const roots: MenuItem[] = [];
        menuMap.forEach(menu => {
          if (menu.parentMenuID) {
            const parent = menuMap.get(menu.parentMenuID);
            parent?.children.push(menu);
          } else {
            roots.push(menu);
          }
        });

        this.permissions = roots;
      },
      error: () => Swal.fire('Error', 'Failed to load menu permissions for this role.', 'error')
    });
  }

}
