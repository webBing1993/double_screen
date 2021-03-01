'use strict'

import CryptoJS from 'crypto-js'
let keyOne = 'fortrundouscreen';

export default {
  // 加密函數
  jiami (word) {
    var key = CryptoJS.enc.Utf8.parse(keyOne);
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
    return encrypted.toString();
  },
  // 解密函數
  jiemi (word) {
    var key = CryptoJS.enc.Utf8.parse(keyOne);
    var decrypt = CryptoJS.AES.decrypt(word, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }
}
