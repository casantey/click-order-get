import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  dateToday: number = Date.now();
  version = this.wrapper.version;

  constructor(private wrapper: LoginComponent) {}

  ngOnInit(): void {}
}
