import { Component, Input, OnInit } from '@angular/core';
import { AppHead } from 'src/app/util/interfaces/app-head';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.scss']
})
export class HeadComponent implements OnInit {

  @Input() head!: AppHead;

  constructor() { }

  ngOnInit(): void {
  }

}
