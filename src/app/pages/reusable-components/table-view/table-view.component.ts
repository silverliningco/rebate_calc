import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BestDetail } from '../../../models/detailBestOption';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements OnInit {

  commerceInfo: any;
  requiredRebates: any = [];
  mySystems: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialog
  ) {
    this.commerceInfo = data.commerceInfo;
    this.requiredRebates = data.requiredRebates;
    this.mySystems = data.systems;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.closeAll();
  }

  sendModelNrs(myCombination: BestDetail) {

    let myAHRIs: String[] = []
    myCombination.components!.forEach(element => {
      myAHRIs.push(element.SKU!)
    });

    let body = {
      commerceInfo: this.commerceInfo,
      skus: myAHRIs,
      requiredRebates: this.requiredRebates
    }
    let url = '/home/detail/' + JSON.stringify(body);
    window.open(url)
  }
}
