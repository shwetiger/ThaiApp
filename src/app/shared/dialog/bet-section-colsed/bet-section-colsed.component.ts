import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bet-section-colsed',
  templateUrl: './bet-section-colsed.component.html',
  styleUrls: ['./bet-section-colsed.component.scss']
})

export class BetSectionColsedComponent implements OnInit {

  constructor( public modalRef: BsModalRef,) { }

  ngOnInit(): void {
  }

  sectionclosediglogclose()
  {
    this.modalRef.hide();
  }

}
