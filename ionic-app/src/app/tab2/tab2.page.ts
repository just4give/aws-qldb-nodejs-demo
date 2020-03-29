import { Component, OnInit } from '@angular/core';
import { QldbService } from '../services/qldb.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  public obj:any={};

  constructor(private qldbService:QldbService,private router: Router,public alertController: AlertController) {}

  async ngOnInit() {
    
  } 

  async updateStatus(){
    const path = '/api/update-status' ;
    await this.qldbService.put(path, this.obj).toPromise();

    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Deal status has been updated.',
      buttons: ['OK']
    });

    await alert.present();
    
  }

}
