import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/util/service/data.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private _data: DataService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {}

  ngOnInit() {} // END ngOninnit
}
