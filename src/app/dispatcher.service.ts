import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Endpoint } from './endpoint';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DispatcherService {

  // use this dispatcherService in storage if we need to update data to a webserver
  constructor(private http: HttpClient) { } 

  public async saveEndpointAsync(endpoint: Endpoint) {
    const saved = endpoint.id ? await this.updateAsync(endpoint) : await this.addAsync(endpoint);
    return this.provisionAsync(saved);
  }

  private async addAsync(endpoint: Endpoint) {
    const url = `${environment.dispatchBaseUrl}/endpoints`;
    const ep = await this.http.post<Endpoint>(url, endpoint).toPromise();
    endpoint.id = ep.id;
    return endpoint;
  }
  private async updateAsync(endpoint: Endpoint) {
    const url = `${environment.dispatchBaseUrl}/endpoints/${endpoint.id}`;
    const ep = await this.http.put<Endpoint>(url, endpoint).toPromise();
    return endpoint;
  }
  private async provisionAsync(endpoint: Endpoint) {
    const url = `${environment.dispatchBaseUrl}/endpoints/${endpoint.id}/provision`;
    const ep = await this.http.put<Endpoint>(url, endpoint).toPromise();
    endpoint.data = ep.data;
    return endpoint;
  }
}
