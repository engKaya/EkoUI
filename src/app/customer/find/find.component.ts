import { Component, Output, ViewChild, ElementRef, EventEmitter, OnInit, Input } from '@angular/core';
import { NgForm, FormGroup, Validators, FormBuilder} from '@angular/forms';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css'],
})
export class FindComponent implements OnInit {

  public addForm_!: FormGroup;

  @Input() Message!: string;
  @Output() findEvent = new EventEmitter<string>();
  @Output() addEvent = new EventEmitter<any[]>();

  //@ViewChild('popup-background') popupBg;
  @ViewChild("popupAdd") popupAdd!: ElementRef<HTMLElement>;
  public Cities: any= [];
  public Towns: any = [];
  constructor(private service: SharedService, private formBuilder: FormBuilder) {}
  ngOnInit(): void {

    this.service.getCities().subscribe((data)=>{
      this.Cities = data
    })


    this.addForm_ = this.formBuilder.group({
      MusteriIsim:['', Validators.required],
      MusteriSoyIsim:['', Validators.required],
      MusteriTel:['', [Validators.required,
       Validators.pattern('0[0-9]{3}-[0-9]{3}-[0-9]{2}-[0-9]{2}'), Validators.maxLength(14)]],
      MusteriMail:['', [Validators.required, Validators.email]],
      MusteriSehir:['', Validators.required],
      MusteriIlce:['', Validators.required],
      MusteriAdres:['', Validators.required],
      MusteriSikayet:['', Validators.required],
    })
  }

  openModal(){
    this.popupAdd.nativeElement.classList.remove('fade');
    this.popupAdd.nativeElement.classList.add('show')
  }

  closeModal(){
    this.popupAdd.nativeElement.classList.remove('show');
    this.popupAdd.nativeElement.classList.add('fade')
  }

  onPhoneChange(tel: any, telInput: any) {
    if (tel.length == 4 || tel.length == 8 || tel.length == 11) {
      telInput.value = telInput.value + '-'
    }
  }

  onChangeSehir(id: any){
    let param = {"SehirId": id}
    this.service.getTowns(param).subscribe(data =>{
      this.Towns = data
    })
  }

  get f() {return this.addForm_.controls;}

  onSubmitAdd() {
    for(let data of this.Cities){
      if (data.SehirId==this.addForm_.value.MusteriSehir) {
        this.addForm_.controls['MusteriSehir'].setValue(data.SehirAdi)
      }
    }

    if (this.addForm_.valid){
    this.service.addComplaint(this.addForm_.value).subscribe((data) => {
      this.service.getComplaintList().subscribe((newData) => {
         this.addEvent.emit(newData);
      });
    })
    this.addForm_.reset()
    this.closeModal();
    }
  }

  onSubmit(form: NgForm) {
    this.findEvent.emit(form.value);
     form.reset();
  }
}
