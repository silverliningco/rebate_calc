import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'; 

// url endpoint
import {URL_SERVICIOS}  from '../config/config';


@Injectable({
    providedIn: 'root'
  })
  export class AHRICombinationService {

    constructor(
      public http: HttpClient
    ) { } 

  // step 1 for to find a combination
   ProductLines(params: any){

    let url = URL_SERVICIOS + '/product-lines?params=' + params; 

    return this.http.get(url)
    .pipe(
        map((resp: any) => {
          return resp ;
        })
    )
  }

  // step 1 for to find a combination
 /*  newProductLines(params: any, payloadDetailParams: any){

    // capturando los valores del formilario que se necesitan para luego ser enviados en el detail
    //this.paramsDetail = payloadDetailParams;
    paramsDetail  = JSON.stringify( payloadDetailParams);
    console.log(paramsDetail );

    // enviandos los parametros a product line
    let url = URL_SERVICIOS + '/product-lines?params=' + params; 

    return this.http.get(url)
    .pipe(
        map((resp: any) => {
          return resp ;
        })
    )
  } */
  
  
  // step 2 to find a combination
  search (params: any){

    let url = URL_SERVICIOS + '/search-equipment?params=' + params;

    return this.http.get(url)
    .pipe(
        map((resp: any) => {
          return resp;
        })
    )
  }

  // step 3 to find a combination
  getResultDetail(skus: any, ahri_refs: any){

    let url = URL_SERVICIOS + '/view-detail?skus='+ skus + '&ahri_refs=' + ahri_refs + '&params=' ;

    return this.http.get(url)
    .pipe(
        map((resp: any) => {
            return resp;
        })
    )
  }

  newGetResultDetail(skus: any, ahri_refs: any, detailParams:any){

    let url = URL_SERVICIOS + '/view-detail?skus='+ skus + '&ahri_refs=' + ahri_refs + '&params=' + detailParams ;

    return this.http.get(url)
    .pipe(
        map((resp: any) => {
            return resp;
        })
    )
  }
  

  //get itulities
  getUtilities(state: any, furnaceFuel: any){

    console.log(state, furnaceFuel);

    let url = URL_SERVICIOS + '/load-utilities?state='+ state + '&furnaceFuel=' + furnaceFuel;

    return this.http.get(url)
    .pipe(
        map((resp: any) => {
            //console.log(resp);
            return 'esta es la respuesta del servicio';
        })
    )
    
  }
  
}


