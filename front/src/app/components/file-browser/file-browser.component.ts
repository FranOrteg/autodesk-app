import { Component, OnInit } from '@angular/core';
import { AccService } from '../../services/acc.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './file-browser.component.html',
  styleUrl: './file-browser.component.css'
})
export class FileBrowserComponent implements OnInit {

  arrProjects: any[] = [];
  arrProjectContents: any[] = [];
  projectIdSelected: string = '';
  labitHubId: string = 'b.1bb899d4-8dd4-42d8-aefd-6c0e35acd825';

  constructor(private accService: AccService) { }

  async ngOnInit() {
    try {
      this.arrProjects = await this.accService.getProjects(this.labitHubId);
      console.log('Projects:', this.arrProjects); 
  
    } catch (error) {
      console.error('Error fetching projects:', error);
      this.arrProjects = [];
    }
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
  
}
