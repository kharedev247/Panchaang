import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { StorageService } from '../storage.service';
import { AlertController, IonInput, ToastController } from '@ionic/angular';
import { ElectronService } from 'ngx-electron';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Endpoint } from '../endpoint';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  endpoint: Endpoint = {}; // contains saved value to initialise form
  endpointForm: FormGroup;
  @ViewChild('endpointName', {static: false}) nameField: IonInput;

  constructor(
    private alertController: AlertController,
    private electron: ElectronService,
    private ngZone: NgZone,
    private fb: FormBuilder,
    private toastController: ToastController,
    private storage: StorageService) {
      this.initEndpointForm();
    }

    initEndpointForm() {
      // const phonePattern = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
      this.endpointForm = this.fb.group({
        name: [this.endpoint.name, Validators.required],
        // [Validators.required, Validators.pattern(phonePattern)]
        messageBody: [this.endpoint.data, Validators.required]
      })
    }

  async ngOnInit() {

    await this.loadEndpoint();
    if (!this.endpoint.name) {
      this.promptForInfo();
    }

    if (this.electron.isElectronApp) {
      this.electron.ipcRenderer.on('setData', (event, data) => {
        // alert('data selected from menu: ' + data);
        console.log('data selected from menu: ', data);
        this.ngZone.run(() => {
          // call any method for automatic change detection
        })
      })
    }
  }

  async promptForInfo() {
    const toast = await this.toastController.create({
      position: 'bottom',
      duration: 5000,
      header: 'Panchaang info',
      message: 'We need your name and message'
      // closeButtonText: 'OK',
    });
    this.nameField.setFocus();
    await toast.present();
  }

  async openUrl() {
    console.log('setting test data to storage >>>>>>>>>>>');
    const data = await this.storage.saveData({}, '987');
    console.log(data);
    alert('add new account clicked');
  }

  async onButtonClick() {
    const alert = await this.alertController.create({
      header: 'Title Alert',
      message: 'do you like this alert ?',
      buttons: [
        {
          text: 'No',
          role: 'Cancel',
          cssClass: 'secondary',
          handler: (value?:any) => {
            console.log('No selected');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('yes selected');
          }
        }
      ]
    });

    await alert.present();
  }

  async refreshData() {
    console.log('getting test data from storage >>>>>>>>>');

    const data = await this.storage.getAllData();
    console.log(data);
    alert('refresh panchaang clicked');
  }

  async saveEndpoint() {
    console.log('form submit clicked');
    await this.storage.setEndpoint(this.endpointForm.value);
    return this.loadEndpoint();
  }

  async loadEndpoint() {
    this.endpoint = await this.storage.getEndpoint();
    this.endpointForm.reset(this.endpoint);
  }
}
