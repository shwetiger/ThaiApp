import { Component, OnInit,Input} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-qr-view-dialog',
  templateUrl: './qr-view-dialog.component.html',
  styleUrls: ['./qr-view-dialog.component.scss']
})
export class QrViewDialogComponent implements OnInit {
  currentImageUrl:any;
  @Input() data: any=[]; 
  constructor(public bsModalRef: BsModalRef) {

   }

  ngOnInit(): void {
    this.currentImageUrl = this.data.imageUrl;

  }

 
  QrviewHide(){
    this.bsModalRef.hide();
  }

  
}
