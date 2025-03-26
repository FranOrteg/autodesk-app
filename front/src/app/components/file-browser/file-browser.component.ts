import { Component, OnInit } from '@angular/core';
import { AccService } from '../../services/acc.service';
import { NgFor, NgIf } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './file-browser.component.html',
  styleUrl: './file-browser.component.css'
})
export class FileBrowserComponent implements OnInit {

  labitHubId: string = 'b.1bb899d4-8dd4-42d8-aefd-6c0e35acd825';
  arrProjects: any[] = [];
  arrProjectContents: any[] = [];
  projectIdSelected: string = '';
  fileIdSelected: string = '';
  fileStatus: string = '';
  formulario: FormGroup;

  constructor(private accService: AccService) { 
    this.formulario = new FormGroup({});
  }

  async ngOnInit() {
    try {
      this.arrProjects = await this.accService.getProjects(this.labitHubId);
      console.log('Projects:', this.arrProjects); 
  
    } catch (error) {
      console.error('Error fetching projects:', error);
      this.arrProjects = [];
    }
  }

  onProjectChange(event:any){
    const selectedProjectId = event.target.value;
    console.log('Project ID:', selectedProjectId);
    this.selectProject(selectedProjectId);
    this.arrProjectContents = [];
  }

  async selectProject(projectId: string) {
    
    this.projectIdSelected = projectId;

    try {
      this.arrProjectContents = await this.accService.listProjectContents(this.labitHubId, projectId);
      console.log('Archivos RVT:', this.arrProjectContents);
    } catch (error) {
      console.error('Error al listar contenidos:', error);
      this.arrProjectContents = [];
    }
  }
  
  async selectFile(fileId: string) {
    
    this.fileIdSelected = encodeFileIdToUrn(fileId);
    console.log('File ID:', this.fileIdSelected);
    
    try {
      const fileVersion = await this.accService.getFileVersion(this.projectIdSelected,fileId);
      console.log('Version:', fileVersion);
      const fileVersiontranslate = encodeFileIdToUrn(fileVersion);

      this.fileStatus = await this.accService.listFileMetadata(fileVersiontranslate);
      console.log('Metadata:', this.fileStatus);
    } catch (error) {
      console.error('Error al obtener los metadatos:', error);
    }
  }

  async onSubmit(){
    console.log('Formulario enviado');
  }
  
}


function encodeFileIdToUrn(fileId: string) {
    
  // Codificar en Base64
  let base64Encoded = btoa(unescape(encodeURIComponent(fileId)));

  // Reemplazar caracteres
  base64Encoded = base64Encoded.replace(/=/g, "")  // Quitar '=' de relleno
                               .replace(/\//g, "_") // Reemplazar '/' por '_'
                               .replace(/\+/g, "-"); // Reemplazar '+' por '-'

  return base64Encoded;
}