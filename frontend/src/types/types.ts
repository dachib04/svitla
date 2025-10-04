export interface File {
  id: number;
  name: string;
  path: string;
  folder_id: number;
  created_at?: string; 
}

export interface Folder {
  id: number;
  name: string;
  parent_id?: number | null;
  subfolders?: Folder[];
  files?: File[];
  created_at?: string; 
}
