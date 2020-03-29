import { Component, OnInit } from '@angular/core';
import { QldbService } from '../services/qldb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  public record:any;
  public data:any[];

  constructor(private qldbService:QldbService,private router: Router) { 
    this.record = history.state['record'];
    if(!this.record){
      if(localStorage.getItem('record')){
        this.record  = JSON.parse(localStorage.getItem('record'));
      }
      
    }else{
      localStorage.setItem('record', JSON.stringify(this.record));
    }
    console.log(this.record);
  }

  async ngOnInit() {
    const path = `/api/history/Deal/${this.record.metadata.id}` ;
    this.data = await this.qldbService.get(path, null).toPromise();
    console.log(this.data);
  }

  async verify(record:any){

    this.router.navigate(['/tabs/tab1/verification'], {state: {record: record}});
  }

}
