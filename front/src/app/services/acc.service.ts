import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccService {

  private BASE_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getProjects(hubId: string){
    return firstValueFrom(
      this.http.get<any[]>(`${this.BASE_URL}/projects/${hubId}`)
    );
  }

  listProjectContents(hubId: string, projectId: string){
    return firstValueFrom(
      this.http.get<any[]>(`${this.BASE_URL}/root/${hubId}/${projectId}/files`)
    );
  }

  getFileVersion(projectId: string, itemId: string){
    return firstValueFrom(
      this.http.get<any>(`${this.BASE_URL}/root/${projectId}/${itemId}/versionId`)
    );
  }

  listFileMetadata(urnId:string){
    return firstValueFrom(
      this.http.get<any>(`${this.BASE_URL}/properties/meta/${urnId}/metadata`)
    );
  }
}


/* ### Metadata of .rvt
GET {{host}}{{urlRoot}}/{{projectId}}/{{itemId}}/versionId
 */