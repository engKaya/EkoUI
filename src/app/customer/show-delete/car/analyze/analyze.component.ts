import { Component, OnInit, Input, ElementRef, ViewChild} from '@angular/core';
import { Observable, Subscription } from 'rxjs';



@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.css']
})
export class AnalyzeComponent implements OnInit {

  constructor() { }

  @ViewChild('inspectModal') inspectModal!: ElementRef<HTMLElement>;

  @Input() analyzeEvent!: Observable<any[]>;

  private eventsSubscription!: Subscription;

  public results!: any[];

  ngOnInit(): void {
    this.eventsSubscription = this.analyzeEvent.subscribe((inspectedData: any)=>{
      this.results = inspectedData['responses'][0]['labelAnnotations']
      this.openInspectModal()
    })
  }

  openInspectModal() {
    this.inspectModal.nativeElement.classList.remove('fade');
    this.inspectModal.nativeElement.classList.add('show');
  }

  closeInspectModal() {
    this.inspectModal.nativeElement.classList.add('fade');
    this.inspectModal.nativeElement.classList.remove('show');
  }
}
