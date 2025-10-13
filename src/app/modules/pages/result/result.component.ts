import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  type: any;
  showBothHeader: any;
  twoD_Active: any;
  threeD_Active: any;
  parentLink: any;

  constructor(private route: ActivatedRoute,) {
    this.type = history.state.type;
    if (this.type == "2D") {
      this.parentLink = "/twod-page";
      this.twoD_Active = true;
      this.threeD_Active = false;
      this.showBothHeader = false;
    }
    else if (this.type == "3D") {
      this.parentLink = "/threed-page";
      this.twoD_Active = false;
      this.threeD_Active = true;
      this.showBothHeader = false;
    }
    else {
      this.parentLink = "/me-page";
      this.showBothHeader = true;
      this.twoD_Active = true;
      this.threeD_Active = false;
    }
  }

  ngOnInit(): void {
    this.type = this.route.snapshot.paramMap.get("resultType");
    if (this.type == "2D") {
      this.parentLink = "/twod-page";
      this.twoD_Active = true;
      this.threeD_Active = false;
      this.showBothHeader = false;
    }
    else if (this.type == "3D") {
      this.parentLink = "/threed-page";
      this.twoD_Active = false;
      this.threeD_Active = true;
      this.showBothHeader = false;
    }
    else {
      this.parentLink = "/me-page";
      this.showBothHeader = true;
      this.twoD_Active = true;
      this.threeD_Active = false;
    }
  }

  changeResultType(resultType: String) {
    if (resultType == "2D") {
      this.twoD_Active = true;
      this.threeD_Active = false;
    }
    else {
      this.twoD_Active = false;
      this.threeD_Active = true;
    }
  }

}
