import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { payloadForm } from '../../../models/payloadFrom';
import { Rebate, RebateTier } from '../../../models/rebate';
import { resultsSearch} from '../../../models/resultSearch';
import { BestDetail } from '../../../models/detailBestOption';
import { bridgeService } from '../../../services/bridge.service';
import { MatDialog } from '@angular/material/dialog';
import { TableViewComponent } from '../table-view/table-view.component';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  /* FORM GRUP */
  commerceInfoGroup !: FormGroup;
  productLinesGroup !: FormGroup;
  filtersGroup !: FormGroup;

  /* PRODUC LINE */
  productLines!: any;
  noResultsPL!: boolean;
  noResultsSearch!: boolean;
  results!: any;
  resultSearch: resultsSearch = new resultsSearch;
  bestResults!: any;
  filters: Array<any> = [];

  /*  receives information from the other components*/
  myPayloadForm: payloadForm = new payloadForm; 
  myPayloadRebate!: any;

  /* display title when exist filter */
  showIndoorUnitConfig: boolean = false;
  showCoilType: boolean = false;
  showcoilCasing: boolean = false;
  showFurnaceUnits: boolean = false;
  showIndoorUnits: boolean = false;
  showCardRebate: boolean = false;

  /*  AVAILABLE REBATES */
  showRebates: boolean = false;
  availableRebates!: Array<Rebate>;
  NoExistAvailableRebates: boolean = false;

  showSpinner:boolean = false;
  index: number = 0;


  tabs = ['REBATES','FILTERS'];

  constructor(
    private _formBuilder: FormBuilder,
    private _api: ApiService,
    public _bridge: bridgeService,
    private dialogRef: MatDialog
  ) { }

  ngOnInit(): void {
    this.showSpinner = true;
    /* receiving form data */
       this._bridge.sentRebateParams
                 .subscribe((payload: any) => {
                    this.myPayloadForm = payload.data;
                    this.CallProductLines();
                    
                    /* call GetAvailableRebates if home = 'rebate'  */
                    if (this.myPayloadForm.home === 'ahri'){
                      this.showRebates = false;
                      this.showCardRebate = false;
                      // remove rebates tab
                      this.tabs.splice(0, 1);
                    }else {
                      this.showRebates = true;
                      this.showCardRebate = true;
                      this.GetAvailableRebates();
                    }
                    
         });
   
    /* form control */
    this.commerceInfoGroup = this._formBuilder.group({
      storeId: 1,
      showAllResults: [false],
    });

    this.productLinesGroup = this._formBuilder.group({
      productLine: [''],
    });

    this.filtersGroup = this._formBuilder.group({
      indoorUnitConfiguration: null,
      coilType: null,
      coilCasing: null
    });

  }


/* ****************************************************************************************************************************************************** */
/*                                                          PRODUCT LINE                                                                                  */
/* ****************************************************************************************************************************************************** */
  PrepareProductLines(){

    let {commerceInfo, nominalSize, fuelSource, levelOneSystemTypeId, sizingConstraint} = this.myPayloadForm;

      let body = {
        commerceInfo: commerceInfo,
        nominalSize: nominalSize,
        fuelSource: fuelSource,
        levelOneSystemTypeId: levelOneSystemTypeId,
        sizingConstraint: sizingConstraint
      }

    //update commerce info with "updated show all results" input.
    body.commerceInfo!.showAllResults = this.commerceInfoGroup.controls['showAllResults'].value;

      return body;

  }
  
  CallProductLines() {

    this._api.ProductLines(this.PrepareProductLines()).subscribe({
      next: (resp) => {
        if (resp.length > 0) {
          this.productLines = resp

          this.productLinesGroup.controls['productLine'].setValue(resp[0].id);
          this.CallFilters();
          this.noResultsPL = false;
        } else {
          this.noResultsPL = true;
        }
      },
      error: (e) => alert(e.error),
      complete: () => console.info('complete')
    })
  }

  // Function that reset filters and load filters with selected product line
  SelectProductLine() {
    this.filtersGroup.reset();

    this.filters = [];

    this.CallFilters();
  }

/* ****************************************************************************************************************************************************** */
/*                                                          PRODUCT LINE END                                                                              */
/* ****************************************************************************************************************************************************** */


/* ****************************************************************************************************************************************************** */
/*                                                        AVAILABLE REBATES                                                                               */
/* ****************************************************************************************************************************************************** */
  PrepareDataAvailableRebates(){

    let {state, utilityProviders, fuelSource, eligibilityCriteria, rebateTypes} = this.myPayloadForm;

    let body= {
      country: "US",
      state: state,
      utilityProviders: utilityProviders,
      fuelSource: fuelSource,
      rebateTypes: rebateTypes,
      OEM: "Carrier",
      storeIds: [],
      eligibilityCriteria: eligibilityCriteria
    }

    return body;
  }  

  GetAvailableRebates() {
   
    this._api.AvailableRebates(this.PrepareDataAvailableRebates()).subscribe({
      next: (resp: any) => {
        this.processingAvailableRebates(resp)
      },
      error: (e) => alert(e.error),
      complete: () => console.info('complete')
    });
  }

  processingAvailableRebates(myResp: any) {
    this.availableRebates = [];

    /* confirm if exists data */
    if (myResp.length === 0) {
      this.NoExistAvailableRebates = true;
    } else {
      this.NoExistAvailableRebates = false;
    }

    /* processing data */
    if (myResp.length > 0) {
      for (let indx = 0; indx < myResp.length; indx++) {
        const reb = myResp[indx];

        /* matches the level RebateTier in the defined model */
        let myTier: Array<RebateTier> = [];

        var myMax = Math.max.apply(Math, reb.rebateTiers.map(function (rt: any) { return rt.accessibilityRank; }))

        let myFirstOccurrence = false;

        reb.rebateTiers?.forEach((element: any) => {
          let myDefault = false;
          if (!myFirstOccurrence && myMax == element.accessibilityRank) {
            myFirstOccurrence = true;
            myDefault = (myMax == element.accessibilityRank) ? true : false;
          }

          myTier.push({
            title: element.title,
            rebateTierId: element.rebateTierId,
            completed: myDefault,
            defaultTier: myDefault,
            notes: element.notes
          });
        });

        this.availableRebates.push({
          title: reb.title,
          rebateId: reb.rebateId,
          rebateTiers: myTier,
          notes: reb.notes,
          rebateType: reb.rebateNotes,
          completed: true
        });
      }
    }

  }


  /* Elegibility detail codes */
  reb_tier_change(rebTier: RebateTier, reb: Rebate) {

    // If there are multiple rebate tiers in a given rebate,
    // checking one rebate tier should always uncheck the remaining tier(s).
    this.uncheckRemainingTiers(rebTier, reb);


    // Call search.
    this.CallSearch();

  }

  // If there are multiple rebate tiers in a given rebate,
  // checking one rebate tier should always uncheck the remaining tier(s).
  uncheckRemainingTiers(rebTier: RebateTier, reb: Rebate) {

    const resultTier = reb.rebateTiers?.filter(rt => rt.completed == true);

    if (resultTier!.length > 0) {
      reb.completed = true;
    } else {
      reb.completed = false;
    }

    reb.rebateTiers?.forEach(element => {

      if (element.title != rebTier.title) {
        // Uncheck rebate tier.
        element.completed = false;
      }
    });
  }


  rebate_change(reb: Rebate) {
    // add rebate tier  selections TODO
    //...
    reb.rebateTiers?.forEach(tier => {
      if (!reb.completed) {
        tier.completed = reb.completed!;
      } else {
        tier.completed = tier.defaultTier;
      }
    })

    // Call search.
    this.CallSearch();
  }

  getSelectedRebates() {

    let getformat!: any;
    let collectFormat: Array<JSON> = [];

    // available Rebates selected (completed = true)
    this.availableRebates?.filter(e => {

      if (e.completed === true) {

        e.rebateTiers?.filter(e2 => {

          if (e2.completed == true) {
            getformat = { "rebateId": e.rebateId, "rebateTierId": e2.rebateTierId, "isRequired": false };
            collectFormat.push(getformat);
          }

        });

      }

    });
    return collectFormat;

  }

/* ****************************************************************************************************************************************************** */
/*                                                        AVAILABLE REBATES END                                                                           */
/* ****************************************************************************************************************************************************** */

PrepareFilters(){
  let myFilters: any = null;
  let indoorUnitConfiguration: any = null;
  let coilType: any = null;
  let coilCasing: any = null;

  Object.entries(this.filtersGroup.value).forEach(
    ([key, value]) => {
      if (value != null) {
        switch  (key){
          case 'indoorUnitConfiguration':
            let val1 = JSON.stringify(value);
            indoorUnitConfiguration = `"${key}": ${val1}`;
            break;
          case 'coilType':
            let val2 = JSON.stringify(value);
            coilType = `"${key}": ${val2}`;
            break;
          case 'coilCasing':
            let val3 = JSON.stringify(value);
            coilCasing = `"${key}": ${val3}`;
            break;
        }
      } else {
        switch  (key){
          case 'indoorUnitConfiguration':
            indoorUnitConfiguration = null;
            break;
          case 'coilType':
            coilType = null;
            break;
          case 'coilCasing':
            coilCasing = null;
            break;
        }
      }
    }
  );

  
  if (indoorUnitConfiguration === null && coilType === null &&  coilCasing === null){
    myFilters = null;
    return myFilters;
  } else if (indoorUnitConfiguration != null && coilType === null &&  coilCasing === null){
    myFilters= `{ ${indoorUnitConfiguration} }`;
  } else if (indoorUnitConfiguration === null && coilType != null &&  coilCasing === null){
    myFilters= `{ ${coilType} }`;
  } else if (indoorUnitConfiguration === null && coilType === null &&  coilCasing != null){
    myFilters= `{ ${coilCasing} }`;
  } else if (indoorUnitConfiguration != null && coilType != null &&  coilCasing === null){
    myFilters= `{ ${indoorUnitConfiguration}, ${coilType} }`;
  } else if (indoorUnitConfiguration === null && coilType != null &&  coilCasing != null){
    myFilters= `{ ${coilType}, ${coilCasing} }`;
  } else if (indoorUnitConfiguration != null && coilType === null &&  coilCasing != null){
    myFilters= `{ ${indoorUnitConfiguration}, ${coilCasing} }`;
  } else if (indoorUnitConfiguration != null && coilType != null &&  coilCasing != null){
    myFilters= `{ ${indoorUnitConfiguration}, ${coilType}, ${coilCasing} }`;
  }

  return decodeURIComponent(myFilters);
}


// Function that gets input values from UI and returns payload.
Payload() {

  let {commerceInfo, nominalSize, fuelSource, levelOneSystemTypeId, sizingConstraint} = this.myPayloadForm;

  let rebate:any;
    if (this.myPayloadForm.home === 'ahri'){
      rebate = null;
    }else {
      rebate = this.getSelectedRebates();
    }

  let body = {
    commerceInfo: commerceInfo,
    nominalSize: nominalSize,
    fuelSource: fuelSource,
    levelOneSystemTypeId: levelOneSystemTypeId,
    levelTwoSystemTypeId: this.productLinesGroup.controls['productLine'].value,
    sizingConstraint: sizingConstraint,
    filters: JSON.parse(this.PrepareFilters()),
    requiredRebates: rebate
  };

  return JSON.stringify(body);
}

CallSearch() {
  this.showSpinner = true;
   this._api.Search(this.Payload()).subscribe({
    next: (resp) => {
      if (resp.length > 0) {
        this.noResultsSearch = false;
        this.results = resp;
        let myBestResults = this.filterBestResults(resp);
        myBestResults.sort(function(a:any, b:any) {
          return b.totalAvailableRebates - a.totalAvailableRebates;
        });
        this.bestResults = myBestResults;
      } else {
        this.results = [];
        this.bestResults = [];
        this.noResultsSearch = true;
      }

      this.showSpinner = false;
    }
  })
}

// Function that call filters from API and update UI. 
// also calls Search function to load results.
CallFilters() { 

  this.filtersGroup.disable();

  this._api.Filters(this.Payload()).subscribe({
    next: (resp) => {
      if (resp.length > 0) {
        this.filters = resp;

        this.filtersGroup.reset();
        // Set selected values
        resp.forEach((filter: any) => {
          if (filter.filterName === 'coastal') {
            this.filtersGroup.controls[filter.filterName].setValue(filter.selectedValues[0]);
          } else {
            this.filtersGroup.controls[filter.filterName].setValue(filter.selectedValues);
          }
        });

        this.filtersGroup.enable();

      }

      this.showTitleFilter(this.filters);

      // Call search.
      this.CallSearch();
    },
    error: (e) => alert(e.error),
    complete: () => console.info('complete')
  })
}

showTitleFilter(filters: any) {

  this.showIndoorUnitConfig = false;
  this.showCoilType = false;
  this.showcoilCasing = false;

  filters.forEach((ele: any) => {
    if (ele.filterName === 'indoorUnitConfiguration') {
      this.showIndoorUnitConfig = true
    }
  });

  filters.forEach((ele: any) => {
    if (ele.filterName === 'coilType') {
      this.showCoilType = true
    }
  });

  filters.forEach((ele: any) => {
    if (ele.filterName === 'coilCasing') {
      this.showcoilCasing = true
    }
  });

}

// Function to compose options for specified model type
loadOptionsModelNrs(myDetails:BestDetail[], modelType:string){
   
  let myModelNrs: Array<any> = [];

  myDetails.forEach(subel => {
    subel.components?.forEach(element => {
      if(element.type == modelType) {
        myModelNrs.push(element)
      }
    })
    
  });

  // remove duplicates and asign to variables.
  const skus = myModelNrs.map(o => o.SKU)
  

  return myModelNrs.filter(({SKU}, index) => !skus.includes(SKU, index + 1));

}

// Function to Get element with the highest rebate amount.  
GetHighestRebateAmount(myDetails:BestDetail[]){
  let myBestTotalAvailableRebate = Math.max.apply(
    Math, myDetails.map(function (rt: any) {
      return rt.totalAvailableRebates;
    }));
  return myDetails?.filter(sys => sys.totalAvailableRebates == myBestTotalAvailableRebate)[0];
}

filterBestResults(resp: BestDetail[][]) {
  var bestResults: any = [];
  resp.forEach(details => {
  
    // Get element with the highest rebate amount.
    let mySystem = this.GetHighestRebateAmount(details);
    if(!mySystem){
      mySystem = details[0]
    }

    mySystem.indoorUnits = this.loadOptionsModelNrs(details,"indoorUnit");
    mySystem.furnaceUnits = this.loadOptionsModelNrs(details,"furnace");

    if (mySystem.furnaceUnits.length === 0){
      this.showFurnaceUnits = false;
    } else {
      this.showFurnaceUnits = true;
    }

    if (mySystem.indoorUnits.length === 0){
      this.showIndoorUnits = false;
    } else {
      this.showIndoorUnits = true;
    }

    bestResults.push(mySystem);
  });

  // this.searchMore(bestResults);
  return this.searchMore(bestResults);
  // return (bestResults);
}

searchMore(bestResults: any){

  let myOutdoorUnit: string = '';
  let myIndoorUnit: string = '';
  let myfurnace: string = 'null';
  let myCombination1: BestDetail[] = [];
  let myCombination2: Array<BestDetail>  = [];
  let myCombination3: Array<BestDetail> = [];

console.log(bestResults.length);

  bestResults.forEach((element:any) => {

    myOutdoorUnit = '';
    myIndoorUnit = '';
    myfurnace = 'null';
    myCombination1 = [];
    myCombination2 = [];
    myCombination3 = [];
    
    element.components.forEach((ele1:any) => {
      switch (ele1.type) {
        case 'outdoorUnit':
          myOutdoorUnit = ele1.SKU;
          break;
        case 'indoorUnit':
          myIndoorUnit = ele1.SKU;
          break;
        case 'furnace':
          myfurnace = ele1.SKU;
          break;
      }
    });

    this.results.forEach((subel:BestDetail[]) => {
      subel.forEach(ele2 => {
        let myFind = ele2.components?.filter((item: any)=> item.type == "outdoorUnit")[0].SKU;
        if(myFind == myOutdoorUnit){
          myCombination1 = subel
        }
      });
      
    });

    if (myfurnace === 'null'){

        myCombination1.forEach(ele3 => {
          let myFind = ele3.components?.filter((item: any)=> item.type == "indoorUnit")[0].SKU;
          if(myFind == myIndoorUnit){
            
            myCombination2.push(ele3);
            element.anyCombination = myCombination2;
            element.lengthAnyCombination = myCombination2.length;
          }
        });

    } else {
      myCombination1.forEach(ele4 => {
        let myFind = ele4.components?.filter((item: any)=> item.type == "furnace")[0].SKU;
        if(myFind === myfurnace){
          myCombination2.push(ele4);
        }
      });

      if(myIndoorUnit){

        myCombination2.forEach(ele5 => {
          let myFind = ele5.components?.filter((item: any)=> item.type == "indoorUnit")[0].SKU;
          if(myFind === myIndoorUnit){
            myCombination3.push(ele5);
            element.anyCombination = myCombination3;
            element.lengthAnyCombination = myCombination3.length;
          }
        });
    
      }
    }

  });

  return bestResults;
}

filterIndoorBySKU(myIndoorUnit: string, i:number) {
  
  this.bestResults[i].lengthAnyCombination = 0;
  let myfurnace!: any;
  let myCombination1: BestDetail[] = [];
  let myCombination2: Array<BestDetail>  = [];
  let myCombination3: Array<BestDetail> = [];

  //Search bestOption with user selections
  let myOutdoorUnit = this.bestResults[i].components.filter((item: any)=> item.type == "outdoorUnit")[0].SKU;
  this.bestResults[i].components.forEach((element: any) => {
    if (element.type === 'furnace'){
      myfurnace = this.bestResults[i].components.filter((item: any)=> item.type == "furnace")[0].SKU;
    } else {
      myfurnace = null;
    }
  });
  
  this.results.forEach((subel:BestDetail[]) => {
    subel.forEach(element => {
      let myFind = element.components?.filter((item: any)=> item.type == "outdoorUnit")[0].SKU;
      if(myFind == myOutdoorUnit){
        myCombination1 = subel
      }
    });
    
  });

  if (myfurnace === null){
    if(myIndoorUnit){

      myCombination1.forEach(element => {
        let myFind = element.components?.filter((item: any)=> item.type == "indoorUnit")[0].SKU;
        if(myFind == myIndoorUnit){
          myCombination2.push(element);
          this.bestResults[i] = element;
          this.bestResults[i].anyCombination = myCombination2;
          this.bestResults[i].lengthAnyCombination = myCombination2.length;;
        }
      });

      console.log(this.bestResults[i]);
  
      // compose options for specified model type
      this.bestResults[i].indoorUnits = this.loadOptionsModelNrs(myCombination1,"indoorUnit");
      this.bestResults[i].furnaceUnits = this.loadOptionsModelNrs(myCombination1,"furnace");
    }

  } else {
    myCombination1.forEach(element => {
      let myFind = element.components?.filter((item: any)=> item.type == "furnace")[0].SKU;
      if(myFind === myfurnace){
        myCombination2.push(element);
      }
    });

    if(myIndoorUnit){

      myCombination2.forEach(element => {
        let myFind = element.components?.filter((item: any)=> item.type == "indoorUnit")[0].SKU;
        if(myFind === myIndoorUnit){
          myCombination3.push(element);
          this.bestResults[i] = element;
          this.bestResults[i].anyCombination = myCombination3;
          this.bestResults[i].lengthAnyCombination = myCombination3.length;;
        }
      });

      console.log(myCombination3);

      console.log(this.bestResults[i]);
  
      // compose options for specified model type
      this.bestResults[i].indoorUnits = this.loadOptionsModelNrs(myCombination1,"indoorUnit");
      this.bestResults[i].furnaceUnits = this.loadOptionsModelNrs(myCombination1,"furnace");
    }

  }

}


filterFurnaceBySKU(myFurnaceUnit: string, i:number) {

  this.bestResults[i].lengthAnyCombination = 0;

  //Search bestOption with user selections
  let myOutdoorUnit = this.bestResults[i].components.filter((item: any)=> item.type == "outdoorUnit")[0].SKU;
  let myIndoorUnit = this.bestResults[i].components.filter((item: any)=> item.type == "indoorUnit")[0].SKU;
  let myCombination1: BestDetail[] = [];
  let myCombination2: Array<BestDetail>  = [];
  let myCombination3: Array<BestDetail> = [];

  // select by outdoor unit
  this.results.forEach((subel:BestDetail[]) => {

    subel.forEach(element => {
      let myFind = element.components?.filter((item: any)=> item.type == "outdoorUnit")[0].SKU;
      if(myFind === myOutdoorUnit){
        myCombination1 = subel
      }
    });
    
  });

  // select by indoor unit
  myCombination1.forEach(element => {
    let myFind = element.components?.filter((item: any)=> item.type == "indoorUnit")[0].SKU;
    if(myFind === myIndoorUnit){
      myCombination2.push(element);
    }
  });

  // select by furnace
  if(myFurnaceUnit){

    myCombination2.forEach(element => {
      let myFind = element.components?.filter((item: any)=> item.type == "furnace")[0].SKU;
      if(myFind === myFurnaceUnit){
        myCombination3.push(element);
        this.bestResults[i] = element;
        this.bestResults[i].anyCombination = myCombination3;
        this.bestResults[i].lengthAnyCombination = myCombination3.length;;
      }
    });

    // compose options for specified model type
    this.bestResults[i].indoorUnits = this.loadOptionsModelNrs(myCombination1,"indoorUnit");
    this.bestResults[i].furnaceUnits = this.loadOptionsModelNrs(myCombination1,"furnace");
  }
}

  // function to remove selections filters from my filters.
  removeFilter(myFilter: any, option: any): void {
    if (option) {
      this.filtersGroup.controls[myFilter].setValue(this.filtersGroup.controls[myFilter].value.filter((e: string) => e !== option))
    } else {
      this.filtersGroup.controls[myFilter].reset();
    }
    this.CallSearch()
  }

  isArray(obj: any) {
    if (Array.isArray(obj)) {
      return true

    } else {
      return false
    }
  }


  prepareDataToSend(myCombination:BestDetail){
    let myAHRIs: String[] = []
    myCombination.components!.forEach(element => {
      myAHRIs.push(element.SKU!)
    });
    
    let rebate:any;
    if (this.myPayloadForm.home === 'ahri'){
      rebate = null;
    }else {
      rebate = this.getSelectedRebates();
    }

    let {commerceInfo} = this.myPayloadForm;

    let body = {
      "commerceInfo": commerceInfo,
      "skus": myAHRIs, 
	    "requiredRebates": rebate
    }

    let myBody = JSON.stringify(body)
    return myBody
  }


  sentmodelNrs(myCombination:BestDetail) {

    let myBody = this.prepareDataToSend(myCombination);

   let url= '/home/detail/' + myBody;
   window.open(url) 
 }


  openDialog(myCombination:BestDetail, i:number) {

    //Get systems with selected outdoor unit
    let myOutdoorUnit = this.bestResults[i].components.filter((item: any)=> item.type == "outdoorUnit")[0].SKU;
    let mySystems: BestDetail[] = []
    this.results.forEach((subel:BestDetail[]) => {
      subel.forEach(element => {
        let myFind = element.components?.filter((item: any)=> item.type == "outdoorUnit")[0].SKU;
        if(myFind == myOutdoorUnit){
          mySystems = subel
        }
      });
    });
  
    this.dialogRef.open(TableViewComponent, {
      data: {
        commerceInfo:  this.myPayloadForm.commerceInfo,
        requiredRebates: this.getSelectedRebates(),
        systems:mySystems,
        home : this.myPayloadForm.home
      }
    });
  }


  public demo1TabIndex = 1;
  public demo1BtnClick() {
    const tabCount = 2;
    this.demo1TabIndex = (this.demo1TabIndex + 1) % tabCount;
  }

}

/* 
  * arreglar los estilos del togle
  * se debe de mostrar los resultados del togle ordenamos de mayor a menor
  * en el caso en que aparece furnace, siempre hay indoor? por que no se evalua si hay o no, se da por hecho que 
    siempre hay
*/


