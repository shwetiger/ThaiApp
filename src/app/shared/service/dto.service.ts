import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DtoService {

  AdminDTO: any;
  AdminLoginModel : any ;
  Response: any;
  Response1 : any;
  Message: any;
  Data: any;
  token: any;
  tempDateData: any;
  registerPhoneModel : any;
  userIsLoginModel: any;

  constructor() {
    this.token = '';
    this.tempDateData = '';
    this.Response = {
      message: this.Message,
      data: this.Data,
    }

    this.Message = {
      code: '',
      message: ''
    }

    this.Data = {
      token: '',
      model: this.AdminLoginModel,
      adminDTOList: []
    }

    this.AdminLoginModel = {
      id: 0,
      phone_no: '',
      roleId: 0,
      roleName: '',
      name: '',
      password: '',
      confirmPassword: '',
      oldPassword: '',
      newPassword: '',
      balance: 0.00,
      referralCode: '',
      image: '',
      status: ''
    }

    this.Data = {
      token: '',
      adminDTO: this.AdminDTO,
      adminDTOList: []
    }

    this.AdminDTO = {
      id: 0,
      phoneNo: '',
      roleId: 0,
      roleName: '',
      name: '',
      password: '',
      confirmPassword: '',
      oldPassword: '',
      newPassword: '',
      balance: 0.00,
      referralCode: '',
      image: '',
      status: ''
    }

    this.registerPhoneModel = {
      prefix : '',
      phoneNumber : ''
    }

    this.userIsLoginModel={

    }
  }
}
