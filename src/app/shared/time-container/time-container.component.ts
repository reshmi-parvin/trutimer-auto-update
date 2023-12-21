import { Component, OnInit, Input } from '@angular/core';
import { interval, Observable,timer} from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-time-container',
  templateUrl: './time-container.component.html',
  styleUrls: ['./time-container.component.css']
})
export class TimeContainerComponent implements OnInit {
  @Input() trackedtime: any;
  test: any;
  constructor() { }

  ngOnInit(): void {
    // interval(1000)
    //   .subscribe(x => { 
    //   var dd= moment(new Date())
    //   .add(1, 'seconds').format('LTS');
    //   this.test = dd;
    // });
    //this.test=this.trackedtime;
  }

  ngOnChanges(){
  }

}
