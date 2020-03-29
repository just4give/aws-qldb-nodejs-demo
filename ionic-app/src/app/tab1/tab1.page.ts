import { Component, OnInit } from '@angular/core';
import { QldbService } from '../services/qldb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  public apiKey:string;
  public data:any[];

  constructor(private qldbService:QldbService,private router: Router) {}

  async ngOnInit() {
    const path = '/api/ledger/Deal' ;
    this.data = await this.qldbService.get(path, null).toPromise();
    console.log(this.data);
  } 

  setApiKey(key:string){
    localStorage.setItem('x-api-key',key);
    this.apiKey = key;
  }
  

  async viewHistory(record:any){
    this.router.navigate(['/tabs/tab1/history'], {state: {record: record}});
  }

}
