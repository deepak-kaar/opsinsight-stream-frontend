import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private readonly secret_key = "opsinsight";

  constructor() { }

  encrypt(data:any):string{
    const jsonData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonData, this.secret_key).toString();
  }

  decrypt(cipherText:string):any{
    const bytes = CryptoJS.AES.decrypt(cipherText, this.secret_key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }
}
