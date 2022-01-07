import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

// angular material
import { MatInputModule } from '@angular/material/input';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';

// components
import { PagesComponent } from './pages.component';
import { AHRIMatchupsComponent } from './ahri-matchups/ahri-matchups.component';
import { WholeHouseHPRebateComponent } from './whole-house-hp-rebate/whole-house-hp-rebate.component';
import { PartialSupplementalHPRebateComponent } from './partial-supplemental-hp-rebate/partial-supplemental-hp-rebate.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';


// module
import {PagesRoutingModule} from './pages-routing.module';
import { HelpChooseEquipmentComponent } from './ahri-matchups/help-choose-equipment/help-choose-equipment.component';
import { KnowModelNrComponent } from './ahri-matchups/know-model-nr/know-model-nr.component';


@NgModule({
  declarations: [
    PagesComponent,
    AHRIMatchupsComponent,
    WholeHouseHPRebateComponent,
    PartialSupplementalHPRebateComponent,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    HelpChooseEquipmentComponent,
    KnowModelNrComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    // angular Material
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSortModule,
    MatStepperModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule
  ],
  exports:[
    // angular Material
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSortModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule
  ]
})
export class PagesModModule { }
