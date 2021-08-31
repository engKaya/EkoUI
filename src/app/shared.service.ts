import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  readonly APIUrl = 'https://localhost:44344/api';

  readonly albumId =
    'APB00SceQZPHm18Xogb4Ci7meOPc466mJJwea8q8cyeXAiVLWL8XFHHEfIm_Yc7KVz_jOc25hHb3';

  constructor(private http: HttpClient) {}



  /* Complaint Servisleri Başlangıç*/

  getComplaintList(): Observable<any[]> {
    return this.http.get<any>(this.APIUrl + '/Musteri/GetComplaints');
  }

  addComplaint(val: any) {
    val.MusteriIsim = this.capitalizeStr(val.MusteriIsim);
    val.MusteriSoyIsim = this.capitalizeStr(val.MusteriSoyIsim);
    return this.http.post<any>(this.APIUrl + '/Musteri/PostComplaint', val);
  }

  updateComplaint(val: any) {
    val.MusteriIsim = this.capitalizeStr(val.MusteriIsim);
    val.MusteriSoyIsim = this.capitalizeStr(val.MusteriSoyIsim);
    return this.http.put<any>(this.APIUrl + '/Musteri/UpdateComplaint', val);
  }

  deleteComplaint(val: any) {
    return this.http.delete(this.APIUrl + '/Musteri/DeleteComplaint', {
      body: val,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getCities() {
    return this.http.get<any>(this.APIUrl + '/Konum/GetCity');
  }

  getTowns(val: any) {
    return this.http.post<any>(this.APIUrl + '/Konum/GetTowns', val);
  }

  findComplaint(val: any) {
    return this.http.post<any>(this.APIUrl + '/Musteri/FindComplaint', val);
  }

  /** Complaint servisleri Bitiş */





  /** Product servisleri Başlnagıç */
  getProductList(val: any) {
    return this.http.post<any>(this.APIUrl + '/Urun/FindProducts', val);
  }

  addProduct(val: any) {
    return this.http.post<any>(this.APIUrl + '/Urun/AddProduct', val);
  }

  deleteProduct(val: any) {
    return this.http.delete(this.APIUrl + '/Urun/RemoveProduct', {
      body: val,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getProductBrands() {
    return this.http.get(this.APIUrl + '/Urun/GetProductBrands')
  }

  /** Product servisleri Bitiş */


  /** Car Servisleri Başlangıç */

  getCarList(val: any) {
    return this.http.post<any>(this.APIUrl + '/Araba/FindCars', val);
  }

  getCarImageGoogleId(val: any) {
    let param = {
      AracId: val
    }
    return this.http.post<any>(this.APIUrl + '/Araba/GetCarGoogleId', param);
  }

  getCarBrands() {
    return this.http.get(this.APIUrl + '/Araba/GetCarBrands')
  }

  addCar(val: any) {
    return this.http.post<any>(this.APIUrl + '/Araba/AddCar', val);
  }

  deleteCar(val: any) {
    return this.http.delete(this.APIUrl + '/Araba/RemoveCar', {
      body: val,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  updateCar(val: any) {
    return this.http.put(this.APIUrl + '/Araba/UpdateCar', val)
  }

  inspectPhoto(val: any, token: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });

    let params = {
      requests: [
        {
          image: {
            content: val,
          },
          features: [{
              maxResults: 20,
              type: 'LABEL_DETECTION'
            }],
        },
      ],
    };
    return this.http.post(
      'https://vision.googleapis.com/v1/images:annotate',
      JSON.stringify(params),
      { headers: headers }
    );
  }

  /** Car Servisleri Bitiş */

  /** Google Servisleri Başlangıç */
  getMedia (val: any, id: any)  {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + val,
      }),
    };

    return this.http.get(
      'https://photoslibrary.googleapis.com/v1/mediaItems/' + id,
      httpOptions
    );
  }

  getAlbums(val: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + val,
      }),
    };
    return this.http.get(
      'https://photoslibrary.googleapis.com/v1/albums',
      httpOptions
    );
  }

  postPhoto(val: any, token: any, name: any, type: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream',
      Authorization: 'Bearer ' + token,
      'X-Goog-Upload-Content-Type': type,
      'X-Goog-Upload-Protocol': 'raw',
    });
    return this.http.post(
      'https://photoslibrary.googleapis.com/v1/uploads',
      val,
      { headers, responseType: 'text' }
    );
  }

  uploadPhoto(uToken: any, name: any, token: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });

    let params = {
      albumId:
        'APB00Se-t5P0YZ836GFM_91rgTpwaAxIbU3Hpj3TvqqoK2kTS3O2qr_3TG5hFSXg5ozPi4osru60',
      newMediaItems: [
        {
          description: 'Şikayet',
          simpleMediaItem: {
            fileName: name,
            uploadToken: uToken,
          },
        },
      ],
    };

    return this.http.post(
      'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate',
      JSON.stringify(params),
      { headers: headers }
    );
  }

  createAlbum(token: any, albumTitle: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });

    let params = {
      album: {
        title: albumTitle,
      },
    };

    return this.http.post(
      'https://photoslibrary.googleapis.com/v1/albums',
      JSON.stringify(params),
      { headers: headers }
    );
  }

    /** Google Servisleri Bitiş */

  capitalizeStr(name: string) {
    if (name.includes(' ')) {
      let finalstr = '';
      for (let i = 0; i < name.split(' ').length; i++) {
        if (i !== name.split(' ').length - 1) {
          finalstr +=
            name.split(' ')[i][0].toUpperCase() +
            name.split(' ')[i].slice(1) +
            ' ';
        } else {
          finalstr +=
            name.split(' ')[i][0].toUpperCase() + name.split(' ')[i].slice(1);
        }
      }
      return finalstr;
    } else {
      return name[0].toUpperCase() + name.slice(1);
    }
  }
}
