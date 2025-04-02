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

  getProjectById(hubId: string, projectId: string){
    return firstValueFrom(
      this.http.get<any>(`${this.BASE_URL}/projects/${hubId}/${projectId}`)
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

  getProperties(urnId: string, guid: string){
    return firstValueFrom(
      this.http.get<any>(`${this.BASE_URL}/properties/${urnId}/${guid}/allElementsHard`,
        { headers: {'Cache-Control': 'no-cache'}}
      )
    );
  }

  async saveModelData(modelName: string, urn: string, elements: any[], properties: any){
    if (!modelName || !urn || !elements || !properties) {
      console.error('Error: Datos inválidos para guardar el modelo.');
      return Promise.reject('Datos inválidos');
    }

    const payload = { modelName, urn, elements, properties};
    
    return firstValueFrom(
      this.http.post<any>(`${this.BASE_URL}/model/storeModelData`, payload)
    ).catch(error => {
      console.error('Error al guardar los datos:', error);
      return Promise.reject(error);
    });
  }
}


