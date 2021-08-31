import {
  Component,
  EventEmitter,
  OnInit,
  Input,
  Output,
  SimpleChanges,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';

import { SharedService } from '../../shared.service';
import { NgForm, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable, Subscription, Subject } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SocialAuthService } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

@Component({
  selector: 'app-show-delete',
  templateUrl: './show-delete.component.html',
  styleUrls: ['./show-delete.component.css'],
})
export class ShowDeleteComponent implements OnInit {
  constructor(
    private service: SharedService,
    private formBuilder: FormBuilder,
    public sanitizer: DomSanitizer,
    private authService: SocialAuthService
  ) {}


  private eventsSubscription!: Subscription;

  onUpdateOpen: Subject<any[]> = new Subject<any[]>();
  onUpdateClose: Subject<void> = new Subject<void>();


  public reader: FileReader = new FileReader();

  public updateForm!: FormGroup;

  public checkPopupHeaderString!: string;
  public checkPopupBodyString!: string;
  public checkPopUpBackUp: any;
  public updatedCustomer: any;

  public CustomerList: any = [];
  public Cities: any = [];
  public Towns: any = [];

  public user!: any;
  public loggedIn: boolean = false;

  public ImgBinary!: any;
  public ImgBase64!: any;

  public ImgType!: any;
  public ImgName!: any;

  public OpenedCustomerId!: any;

  @ViewChild('popupUpdate') popupUpdate!: ElementRef<HTMLElement>;
  @ViewChild('checkPopup') checkPopup!: ElementRef<HTMLElement>;

  @Input() addEvent!: Observable<any[]>;
  @Input() findEvent!: Observable<string>;

  @Output() deleteReq = new EventEmitter();

  public config = {
    scope:
      'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cloud-vision https://www.googleapis.com/auth/photoslibrary https://www.googleapis.com/auth/photoslibrary.appendonly https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
  };

  ngOnInit(): void {

    /*setTimeout(() => {
      if (this.user != true)
        this.signInWGoogle();
    }, 4500);*/

    this.service.getCities().subscribe((data) => {
      this.Cities = data;
    });

    this.updateForm = this.formBuilder.group({
      MusteriId: [''],
      MusteriIsim: ['', Validators.required],
      MusteriSoyIsim: ['', Validators.required],
      MusteriTel: [
        '',
        [
          Validators.required,
          Validators.pattern('0[0-9]{3}-[0-9]{3}-[0-9]{2}-[0-9]{2}'),
          Validators.maxLength(14),
        ],
      ],
      MusteriMail: ['', [Validators.required, Validators.email]],
      MusteriSehir: ['', Validators.required],
      MusteriIlce: ['', Validators.required],
      MusteriAdres: ['', Validators.required],
      MusteriSikayet: ['', Validators.required],
    });

    this.getCustomerList();
    this.eventsSubscription = this.addEvent.subscribe((newData) => {
      this.CustomerList = newData;
    });
    this.eventsSubscription = this.findEvent.subscribe((formData) => {
      this.service.findComplaint(formData).subscribe((data) => {
        this.CustomerList = data;
      });
    });
  }

  signInWGoogle = async (): Promise<void> => {
    await this.authService
      .signIn(GoogleLoginProvider.PROVIDER_ID, this.config)
      .then(
        async () => {
          await this.authService.authState.subscribe((user) => {
            this.user = user;
            this.loggedIn = user != null;
            return new Promise<void>((resolve) => {
              resolve(this.user);
            });
          });
        },
        (error) => {
          if (error=="Login providers not ready yet. Are there errors on your console?") {
            this.signInWGoogle()
          };
        }
      );
  };

  get f() {
    return this.updateForm.controls;
  }
  refreshEvent() {
    this.getCustomerList();
  }

  getCustomerList() {
    this.service.getComplaintList().subscribe((data) => {
      this.CustomerList = data;
    });
  }

  onChangeSehir(id: any) {
    let param = { SehirId: id };
    this.service.getTowns(param).subscribe((data) => {
      this.Towns = data;
    });
  }

  closeUpdtModal() {
    this.popupUpdate.nativeElement.classList.remove('show');
    this.popupUpdate.nativeElement.classList.add('fade');
    this.onUpdateClose.next()
  }

  onSubmitSave() {
    for (let data of this.Cities) {
      if (data.SehirId == this.updateForm.value.MusteriSehir) {
        this.updateForm.controls['MusteriSehir'].setValue(data.SehirAdi);
      }
    }
    if (this.updateForm.valid) {
      this.checkPopupHeaderString = 'Müşteri Güncelleme';
      this.checkPopupBodyString =
        this.checkPopUpBackUp.MusteriId +
        ' numaralı ' +
        this.checkPopUpBackUp.MusteriIsim +
        ' ' +
        this.checkPopUpBackUp.MusteriSoyIsim +
        ' isimli müşteri bilgileri güncellenecektir.';

      this.checkPopup.nativeElement.classList.remove('fade');
      this.checkPopup.nativeElement.classList.add('show');
    }
  }

  onPhoneChange(tel: any, telInput: any) {
    if (tel.length == 4 || tel.length == 8 || tel.length == 11) {
      telInput.value = telInput.value + '-';
    }
  }

  updateCustomer(data: any) {
    {
      this.updateForm.controls.MusteriIsim.setValue(data.MusteriIsim);
      this.updateForm.controls.MusteriSoyIsim.setValue(data.MusteriSoyIsim);
      this.updateForm.controls.MusteriMail.setValue(data.MusteriMail);
      this.updateForm.controls.MusteriTel.setValue(data.MusteriTel);
      this.updateForm.controls.MusteriId.setValue(data.MusteriId);
      this.updateForm.controls.MusteriIlce.setValue(data.MusteriIlce);
      this.updateForm.controls.MusteriAdres.setValue(data.MusteriAdres);
      this.updateForm.controls.MusteriSikayet.setValue(data.MusteriSikayet);
      this.OpenedCustomerId = data.MusteriId;
      this.checkPopUpBackUp = data;
    }

    this.service.getCities().subscribe((data) => {
      this.Cities = data;
    });

      /*this.onUpdateOpen.next([data.MusteriId, this.user])
      this.openPopupUpdate()*/

    if (!this.loggedIn) {
      this.signInWGoogle().then(() => {
        this.onUpdateOpen.next([data.MusteriId, this.user]);
        this.openPopupUpdate()
      });
    }else {
      this.onUpdateOpen.next([data.MusteriId, this.user])
      this.openPopupUpdate()
    }

    for (let city of this.Cities) {
      if (city.SehirAdi == data.MusteriSehir) {
        this.updateForm.controls.MusteriSehir.setValue(city.SehirId);
        let param = { SehirId: city.SehirId };
        this.service.getTowns(param).subscribe((data) => {
          this.Towns = data;
        });
        break;
      }
    }
  }

  deleteComplaint(cus: any) {
    this.checkPopupHeaderString = 'Şikayet Silme İşlemi';
    this.checkPopupBodyString =
      cus.MusteriId +
      ' numaralı ' +
      cus.MusteriIsim +
      ' ' +
      cus.MusteriSoyIsim +
      ' isimli kişinin şikayeti silinecek.';
    this.checkPopup.nativeElement.classList.remove('fade');
    this.checkPopup.nativeElement.classList.add('show');
    this.checkPopUpBackUp = cus;
  }

  checkPopUpYes() {
    if (this.checkPopupHeaderString == 'Şikayet Silme İşlemi') {
      this.service.deleteComplaint(this.checkPopUpBackUp).subscribe((data) => {
        this.refreshEvent();
      });
    } else if (this.checkPopupHeaderString == 'Müşteri Güncelleme') {
      this.closeUpdtModal();
      this.service.updateComplaint(this.updateForm.value).subscribe((data) => {
        this.getCustomerList();
      });
    }
    this.checkPopUpNo()
  }

  checkPopUpNo() {
    this.checkPopup.nativeElement.classList.remove('show');
    this.checkPopup.nativeElement.classList.add('fade');
  }

  openPopupUpdate() {
    this.popupUpdate.nativeElement.classList.remove('fade');
    this.popupUpdate.nativeElement.classList.add('show');
  }
}
