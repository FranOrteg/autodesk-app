import { Component, OnInit } from '@angular/core';
import { AccService } from '../../services/acc.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [NgFor],
  templateUrl: './file-browser.component.html',
  styleUrl: './file-browser.component.css'
})
export class FileBrowserComponent implements OnInit {

  arrProjects: any[] = [];

  constructor(private accService: AccService) { }

  async ngOnInit() {
    try {
      const response = await this.accService.getProjects('b.1bb899d4-8dd4-42d8-aefd-6c0e35acd825');
      
      // Extraer solo el array de proyectos
      this.arrProjects = response
  
      console.log('Projects:', this.arrProjects); // Verifica que ahora sí sea un array
  
    } catch (error) {
      console.error('Error fetching projects:', error);
      this.arrProjects = [];
    }
  }
  
  async listProjectContents(projectId: string) {
    try {
      const response = await this.accService.listProjectContents('b.1bb899d4-8dd4-42d8-aefd-6c0e35acd825', projectId);
      console.log('Project contents:', response);
    } catch (error) {
      console.error('Error listing project contents:', error);
    }
  }
  
}
