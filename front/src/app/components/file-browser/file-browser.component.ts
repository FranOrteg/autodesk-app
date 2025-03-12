import { Component, OnInit } from '@angular/core';
import { AccService } from '../../services/acc.service';

@Component({
  selector: 'app-file-browser',
  imports: [],
  templateUrl: './file-browser.component.html',
  styleUrl: './file-browser.component.css'
})
export class FileBrowserComponent implements OnInit {

  arrProjects: any[] = [];

  constructor(private accService: AccService) { }

  async ngOnInit(){
    const response = await this.accService.getProjects
    ('b.1bb899d4-8dd4-42d8-aefd-6c0e35acd825');

    this.arrProjects = response;
    console.log(this.arrProjects);
  }
}
