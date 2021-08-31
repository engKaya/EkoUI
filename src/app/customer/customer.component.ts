import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs'


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  addEvent: Subject<any[]> = new Subject<any[]>();
  findEvent: Subject<string> = new Subject<string>();
  inspectEvent: Subject<any[]> = new Subject<any[]>();

  newDataMessage:any;

  constructor() { }
  ngOnInit(): void {

  }
  onFormEvent(formData: string) {
    this.findEvent.next(formData);
  }

  onAddEvent(newData: any[]){
    this.addEvent.next(newData);
  }

  onInspectEvent(inspectedData: any) {
    this.inspectEvent.next(inspectedData);
  }
}
