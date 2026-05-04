export interface EmployeeForm {
  id: number;
  type: string;
  name: string;
  employee: string;
  date: string;
  remarks: string;
  confidential: boolean;
 fileNames?: string[];   // ✅ make optional
  filePaths?: string[];   // ✅ make optional
    employeeUploadedFiles?: string[];
}