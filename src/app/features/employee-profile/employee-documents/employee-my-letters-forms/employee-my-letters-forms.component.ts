import { Component } from '@angular/core';
import { EmployeeLetter } from '../../../../admin/layout/models/employee-letter.model';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../../admin/servies/admin.service';

@Component({
  selector: 'app-employee-my-letters-forms',
  standalone: false,
  templateUrl: './employee-my-letters-forms.component.html',
  styleUrl: './employee-my-letters-forms.component.css'
})
export class EmployeeMyLettersFormsComponent {
sortColumn: keyof EmployeeLetter | null = null;
sortDirection: 'asc' | 'desc' = 'asc';
   documentTypes: any[] = [];
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];
  letters: EmployeeLetter[] = [];


constructor(private adminService: AdminService) {}

getDocumentTypeName(id: string | number): string {
  const numericId = Number(id);
  const doc = this.documentTypes.find(d => d.id === numericId);
  return doc ? doc.typeName : '';
}
 viewDocument(path: string,download = false) {
    this.adminService.ViewDocument(environment.LettersPath+path, download);
  }
    filteredLetters(): EmployeeLetter[] {
    let data = this.getSortedLetters();
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }
   getSortedLetters(): EmployeeLetter[] {
    let data = [...this.letters];

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = a[this.sortColumn!] ?? '';
        const valB = b[this.sortColumn!] ?? '';

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }
    sortBy(column: keyof EmployeeLetter) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

}
