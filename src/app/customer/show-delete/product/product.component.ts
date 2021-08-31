import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SharedService } from '../../../shared.service';
import { NgForm, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: SharedService
    ) {  }


  @ViewChild('checkPopup') checkPopup!: ElementRef<HTMLElement>;
  @ViewChild('popupAddProduct') popupAddProduct!: ElementRef<HTMLElement>;

  @Input() onUpdateOpen!: Observable<any[]>;
  @Input() onUpdateClose!: Observable<void>;

  public checkPopupHeaderString!: string;
  public checkPopupBodyString!: string;
  public checkPopUpBackUp: any;

  public OpenedCustomerId: any;

  private eventsSubscription!: Subscription;

  public addProductForm!: FormGroup;
  public Products: any = [];
  public ProductBrands: any = [];

  ngOnInit(): void {

    this.getProductBrands()

    this.addProductForm = this.formBuilder.group({
      Model: ['', Validators.required],
      MarkaId: ['', Validators.required],
      CPU: ['', Validators.required],
      RAM: ['', Validators.required],
      HardDrive: ['', Validators.required],
    });

    this.eventsSubscription = this.onUpdateOpen.subscribe((data: any[])=>{
      this.OpenedCustomerId = data[0]
      this.refreshPrdList(data[0])
    })

    this.eventsSubscription = this.onUpdateClose.subscribe(()=>{
      this.Products = []
    })
  }

  refreshPrdList(data: any){
    let param = { MusteriId: data };
    this.service.getProductList(param).subscribe((data)=>{
      this.Products = data;
    })
  }

  getProductBrands(){
    this.service.getProductBrands().subscribe((data)=>{
      this.ProductBrands = data;
    })
  }

  deleteProduct(urun: any) {
    this.checkPopupHeaderString = 'Ürün Silme İşlemi';
    this.checkPopupBodyString =
      urun.MusteriIsim +
      ' ' +
      urun.MusteriSoyIsim +
      ' isimli kişinin ' +
      urun.UrunId +
      ' numaralı ' +
      urun.MarkaAd +
      ' ' +
      urun.Model +
      ' ürünü silinecek.';
    this.checkPopup.nativeElement.classList.remove('fade');
    this.checkPopup.nativeElement.classList.add('show');
    this.checkPopUpBackUp = urun;
  }

  checkPopupYes() {
    this.service.deleteProduct(this.checkPopUpBackUp).subscribe((data) => {
      this.refreshPrdList(this.OpenedCustomerId);
      this.closeCheckPopup()
    })
  }

  addProduct() {
    this.popupAddProduct.nativeElement.classList.remove('fade');
    this.popupAddProduct.nativeElement.classList.add('show');
  }

  closeAddPrdModal() {
    this.popupAddProduct.nativeElement.classList.remove('show');
    this.popupAddProduct.nativeElement.classList.add('fade');
  }

  closeCheckPopup() {
    this.checkPopup.nativeElement.classList.remove('show');
    this.checkPopup.nativeElement.classList.add('fade');
  }

  onSubmitSaveProduct() {
    if (this.addProductForm.valid) {
      this.addProductForm.value.MusteriId = this.OpenedCustomerId;
      this.service.addProduct(this.addProductForm.value).subscribe((data) => {
        this.refreshPrdList(this.OpenedCustomerId);
        this.closeAddPrdModal();
        this.addProductForm.reset();
      });
    }
  }

  get fAdd() {
    return this.addProductForm.controls;
  }
}
