import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ElectronService } from 'ngx-electron';
import { Endpoint } from './endpoint';
// import * as uuid from 'uuid';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private electron: ElectronService,
    private storage: Storage) { }

  async saveData(data: any, id?: string): Promise<any> {
    // add the logic
    data = {
      name: 'TestData'
    };
    data.id = id ? id : '123';

    // storage automatically serialize object to json. 
    await this.storage.set(data.id, data);
    this.updateDataMenu([data]); // send the data to electron
    return data;
  }

  async getAllData(): Promise<any[]> {
    const Data: any[] = [];
    await this.storage.forEach((value: any, key: string, index: number) => {
      if(value.id) {
        Data.push(value);
      }
    });
    this.updateDataMenu(Data);
    return Data;
  }

  getData(id: string): Promise<any> {
    return this.storage.get(id);
  }

  deleteData(id: string): Promise<any> {
    this.updateDataMenu();
    return this.storage.remove(id);
  }

  async updateDataMenu(dataList: any[] = null) {
    if (this.electron.isElectronApp) {
      const data = dataList || await this.getAllData();
      this.electron.ipcRenderer.send('data', data); // automatically serialize data to json. It sends message in async way
    }
  }

  setEndpoint(endpoint: Endpoint): Promise<void> {
    return this.storage.set('endpoint', endpoint);
  }

  async getEndpoint(): Promise<Endpoint> {
    const endpoint = await this.storage.get('endpoint');
    return endpoint || {};
  }
}
