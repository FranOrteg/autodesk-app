import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccService {

  private BASE_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getProjects(hubId: string){
    return firstValueFrom(
      this.http.get<any[]>(`${this.BASE_URL}/projects/${hubId}`)
    );
  }
}
