import { Component, OnInit } from '@angular/core';
import { QldbService } from '../services/qldb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})
export class VerificationPage implements OnInit {

  public record:any;
  public data:any[];
  public digest:any;
  public proof:any;

  constructor(private qldbService:QldbService,private router: Router) { 
    this.record = history.state['record'];
    if(!this.record){
      if(localStorage.getItem('verification')){
        this.record  = JSON.parse(localStorage.getItem('verification'));
      }
      
    }else{
      localStorage.setItem('verification', JSON.stringify(this.record));
    }
    console.log(this.record);
  }

  async ngOnInit() {
   // this.proof={ "Proof": { "IonText": "[{{qlPIdGSm1ZhxZ8Li8Yk53r2v5+XKdZ8nI7wH0Hbaun4=}},{{UmutikAHiCYR7B9Bh3qERIihSj6BewHOAI99pkfClwA=}},{{ISR5Dkpiyek3c/bEizPRO7zYcK83JYDY3yHtBT3Ws+s=}},{{ISR5Dkpiyek3c/bEizPRO7zYcK83JYDY3yHtBT3Ws+s=}},{{0X+Z5sATBXt/osJ/3Sr6RA3yCs3KHFBCh68ctvsZGQU=}},{{Ug14MLDdndff7SVphMdurJfWz400Ww3pMavJ/wxHK6Y=}},{{3hbjKxtjqogdNHIbMIS8vtZtvSQTi/lmgsjyCfwWhnQ=}},{{xBwqyfBlNiBd+d57ys1w1cM9YleshkYRK/IQBJEfs3o=}},{{euVYAe1rSfLaXjzbdoikadXpWZeIBV2LBLyJeoAofXk=}},{{Jemb7FVcAcv3PBohaqGhIt3+T3rZ+15fSoix+vQjX1Q=}},{{RloMpn8CTIGE9BU9I2Fkxjp8RK/OobBdkV2/bQffLp4=}},{{B6HXnAozhiybsLQF0rbzMkn5bif8s+LLCoAsiJu6vic=}}]" }, "Revision": { "IonText": "{blockAddress:{strandId:\"BfvSL5DYUKE3spPDrWewCC\",sequenceNo:85},hash:{{1UTehcLFWqQMb8FvE3KU9O8Fsx83PmVFi7fo5HOQBLM=}},data:{dealId:\"108569\",vin:\"4S3BMBC62C3013571\",vehicle:{id:\"KGDuWFM2WypBURpRFRywrR\"},status:\"scanned\"},metadata:{id:\"9cAroezvMXQGBcAeWjt9T0\",version:2,txTime:2020-03-26T18:11:07.407Z,txId:\"InjUdGnCHzo0aokwpzFmPe\"}}" } };
  }
  async getDigest(){
    const path = `/api/digest` ;
    this.digest = await this.qldbService.get(path, null).toPromise();
    console.log(this.digest);
    //console.log(this.getDigestAsString(this.digest.Digest.data))
  }

  getProofAsList(){
    if(this.proof){
      let s:string = this.proof.Proof.IonText;
      s =  s.substring(1,s.length-1);
      return s.split(",") ;
    }else{
      return [];
    }
    
  }
  // async verify(record:any){
  //   this.router.navigate(['/tabs/tab1/verification'], {state: {record: record}});
  // }

  getDigestAsString(array){
    const STRING_CHAR = array.reduce((data, byte)=> {
      return data + String.fromCharCode(byte);
      }, '');

      let base64String = btoa(STRING_CHAR);
    return base64String;
  }

  async getProof(){
    const path = `/api/verification` ;
    let data = {
      metadata: this.record.metadata,
      blockAddress: this.record.blockAddress,
      digest:{DigestTipAddress:this.digest.DigestTipAddress}
    }
    this.proof = await this.qldbService.post(path, data).toPromise();
    console.log(this.proof);
  }

}
