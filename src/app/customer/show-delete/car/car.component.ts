import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SharedService } from '../../../shared.service';
import { NgForm, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.css'],
})
export class CarComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: SharedService
  ) {}

  @ViewChild('popupAddCar') popupAddCar!: ElementRef<HTMLElement>;
  @ViewChild('checkPopup') checkPopup!: ElementRef<HTMLElement>;
  @ViewChild('wrongImageModal') wrongImageModal!: ElementRef<HTMLElement>;

  @Input() onUpdateOpen!: Observable<any[]>;
  @Input() onUpdateClose!: Observable<void>;
  @Output() analyzeEvent = new EventEmitter<any[]>();

  public checkPopupHeaderString!: string;
  public checkPopupBodyString!: string;
  public checkPopUpBackUp: any;

  public user: any;

  public OpenedCustomerId: any;

  private eventsSubscription!: Subscription;

  public addCarForm!: FormGroup;

  public Cars: any = [];
  public CarBrands: any = [];

  public ImgBinary: any;
  public ImgName: any;
  public ImgType: any;
  public ImgBase64: any;

  public uploading: boolean = false;

  public isEditing: boolean = false;

  public UpdatedCar: any;

  ngOnInit(): void {
    this.getCarBrands();
    this.addCarForm = this.formBuilder.group({
      Model: ['', Validators.required],
      MarkaId: ['', Validators.required],
      Motor: ['', Validators.required],
      Yil: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(4),
        ],
      ],
      Image: [''],
    });

    this.eventsSubscription = this.onUpdateOpen.subscribe(async (data) => {
      this.OpenedCustomerId = data[0];
      this.user = data[1];
      this.refreshCarList(this.OpenedCustomerId);
    });

    this.eventsSubscription = this.onUpdateClose.subscribe(() => {
      this.Cars = [];
    });
  }

  checkPopUpYes() {
    this.service.deleteCar(this.checkPopUpBackUp).subscribe((data) => {
      this.refreshCarList(this.OpenedCustomerId);
    });
    this.closeCheckPopup();
  }

  getCarBrands() {
    this.service.getCarBrands().subscribe((data) => {
      this.CarBrands = data;
    });
  }

  closeCheckPopup() {
    this.checkPopup.nativeElement.classList.remove('show');
    this.checkPopup.nativeElement.classList.add('fade');
  }

  deleteCar(arac: any) {
    this.checkPopupHeaderString = 'Araç Silme İşlemi';
    this.checkPopupBodyString =
      arac.MusteriId +
      ' numaralı kişinin ' +
      arac.AracId +
      ' numaralı ' +
      arac.MarkaAd +
      ' ' +
      arac.Model +
      ' aracı silinecek.';
    this.checkPopup.nativeElement.classList.remove('fade');
    this.checkPopup.nativeElement.classList.add('show');
    this.checkPopUpBackUp = arac;
  }

  addCar(isEditing: boolean) {
    this.isEditing = isEditing
    this.popupAddCar.nativeElement.classList.remove('fade');
    this.popupAddCar.nativeElement.classList.add('show');
    if (!isEditing)
      this.addCarForm.reset()
  }

  get fCarAdd() {
    return this.addCarForm.controls;
  }

  refreshCarList = (data: any) => {
    let param = { MusteriId: data };
    this.service.getCarList(param).subscribe((data) => {
      this.Cars = data;
      this.Cars.map(async (c: any) => {
        this.service
          .getMedia(this.user.response.access_token, c.ResimUrl)
          .subscribe((data: any) => {
            c.ResimUrl = data['baseUrl'];
          });
      });
    });
  };

  onSubmitSaveCar = async () => {
    if (this.addCarForm.valid && !this.isEditing) {
      this.uploading = true;
      await this.uploadAndWriteCar();

      /*if (await this.checkImage(this.ImgBase64)) {
        this.service
          .postPhoto(
            this.ImgBinary,
            this.user.response.access_token,
            this.ImgName,
            this.ImgType
          )
          .subscribe((data) => {
            this.service
              .uploadPhoto(data, this.ImgName, this.user.response.access_token)
              .subscribe((res: any) => {
                this.addCarForm.value.ResimUrl =
                  res['newMediaItemResults'][0]['mediaItem']['id'];
                this.addCarForm.value.MusteriId = this.OpenedCustomerId;
                this.addCarForm.value.Base64 = this.ImgBase64;

                this.service.addCar(this.addCarForm.value).subscribe((data) => {
                  this.refreshCarList(this.OpenedCustomerId);
                  this.addCarForm.reset();
                  this.closeAddCarModal();
                  this.uploading = false;
                });
              });
          });
      } else {
        this.openWarningModal()
        this.addCarForm.controls.Image.reset()
      }*/
    } else if (
      this.isEditing &&
      (this.addCarForm.controls.Image.value == '' ||
        this.addCarForm.controls.Image.value == null) &&
      this.addCarForm.valid
    ) {
      this.service
        .getCarImageGoogleId(this.UpdatedCar.AracId)
        .subscribe((data) => {
          this.addCarForm.value.ResimUrl = data[0]['ResimUrl'];
          this.addCarForm.value.Base64 = data[0]['b64_encoded'];
          this.addCarForm.value.AracId = this.UpdatedCar.AracId;
          this.service.updateCar(this.addCarForm.value).subscribe((data) => {
            this.refreshCarList(this.OpenedCustomerId);
            this.addCarForm.reset();
            this.closeAddCarModal();
            this.isEditing = false;
          });
        });
    } else if (
      this.addCarForm.valid &&
      this.isEditing &&
      (this.addCarForm.controls.Image.value != '' ||
        this.addCarForm.controls.Image.value != null)
    ) {
      this.uploading = true;
      await this.uploadAndWriteCar();
    }
  };

  closeAddCarModal() {
    this.popupAddCar.nativeElement.classList.remove('show');
    this.popupAddCar.nativeElement.classList.add('fade');
  }

  openWarningModal() {
    this.wrongImageModal.nativeElement.classList.remove('fade');
    this.wrongImageModal.nativeElement.classList.add('show');
  }

  editCar(data: any) {
    this.UpdatedCar = data;
    this.addCarForm.controls.Model.setValue(this.UpdatedCar.Model);
    this.addCarForm.controls.MarkaId.setValue(this.UpdatedCar.MarkaId);
    this.addCarForm.controls.Motor.setValue(this.UpdatedCar.Motor);
    this.addCarForm.controls.Yil.setValue(this.UpdatedCar.Yil);
    this.addCar(true);
  }

  closeWarningModal() {
    this.uploading = false;
    this.wrongImageModal.nativeElement.classList.remove('show');
    this.wrongImageModal.nativeElement.classList.add('fade');
  }
  checkImage(data: any) {
    let isCar = false;
    return new Promise<boolean>((resolve, reject) => {
      this.service
        .inspectPhoto(data.split(',')[1], this.user.response.access_token)
        .subscribe((data: any) => {
          let labels = data['responses'][0].labelAnnotations;
          for (let i = 0; i < 10; i++) {
            if (
              labels[i].description == 'Vehicle' ||
              labels[i].description == 'Car' ||
              labels[i].description.includes('Car')
            )
              resolve(true);
          }
          resolve(false);
        });
    });
  }

  async uploadAndWriteCar() {
    if (await this.checkImage(this.ImgBase64)) {
      this.service
        .postPhoto(
          this.ImgBinary,
          this.user.response.access_token,
          this.ImgName,
          this.ImgType
        )
        .subscribe((data) => {
          this.service
            .uploadPhoto(data, this.ImgName, this.user.response.access_token)
            .subscribe((res: any) => {
              this.addCarForm.value.ResimUrl =
                res['newMediaItemResults'][0]['mediaItem']['id'];
              this.addCarForm.value.MusteriId = this.OpenedCustomerId;
              this.addCarForm.value.Base64 = this.ImgBase64;
              this.addCarForm.value.AracId = this.UpdatedCar.AracId;
              if (!this.isEditing) {
                this.service.addCar(this.addCarForm.value).subscribe((data) => {
                  this.refreshCarList(this.OpenedCustomerId);
                  this.addCarForm.reset();
                  this.closeAddCarModal();
                  this.uploading = false;
                });
              } else {
                this.service.updateCar(this.addCarForm.value).subscribe((data) => {
                  this.refreshCarList(this.OpenedCustomerId);
                  this.addCarForm.reset();
                  this.closeAddCarModal();
                  this.uploading = false;
                });
              }
            });
        });
    } else {
      this.openWarningModal();
      this.addCarForm.controls.Image.reset();
    }
  }



  getArrayBuffer(event: any) {
    console.log()
    var rBuffer = new FileReader();
    var rBase = new FileReader();
    rBuffer.onload = () => {
      this.ImgBinary = rBuffer.result;
      this.ImgName = event.target.files[0].name;
      this.ImgType = event.target.files[0].type;
    };
    rBuffer.readAsArrayBuffer(event.target.files[0]);
    rBase.onload = () => {
      this.ImgBase64 = rBase.result;
    };
    rBase.readAsDataURL(event.target.files[0]);
  }

  InspectImage(data: any) {
    this.service
      .inspectPhoto(
        data.b64_encoded.split(',')[1],
        this.user.response.access_token
      )
      .subscribe((data: any) => {
        this.analyzeEvent.emit(data);
      });
  }

}
