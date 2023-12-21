import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  classToggled: any=false;
  smallToggled:any =false;
  largeToggled: any=false;
  constructor() { }

  ngOnInit(): void {
   }
   public toggleField() {
    this.classToggled = !this.classToggled;
    this.smallToggled = !this.smallToggled;
    this.largeToggled = !this.largeToggled;
  }
  newStatus() {
    this.toggleField();
  }

  public removetoggle() {
    this.smallToggled = false;
  }
}
