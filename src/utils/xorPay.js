/**
 * XorPay支付集成工具
 * 用于生成支付二维码和验证支付状态
 */

import axios from 'axios';
import supabase from '../utils/supabase';

// XorPay配置
const XORPAY_PROXY_CONFIG = {
  appId: '702889', // 替换为你的XorPay AppId
  appSecret: import.meta.env.VITE_XORPAY_APP_SECRET, // 你的XorPay AppSecret
  supaEdgFuncUrl: 'https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/proxy_for_xorpay', // Edge Function 转发请求XorPay支付二维码的地址
  supaEdgFuncOrderUrl: 'https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/rapid-processor', // Edge Function 转发请求XorPay订单状态的地址
};





/**
 * MD5哈希函数（纯JavaScript实现）
 * @param {string} message - 要哈希的消息
 * @returns {string} MD5哈希值（小写）
 */
function md5(message) {
  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  message = Utf8Encode(message);
  x = ConvertToWordArray(message);
  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toUpperCase();
}
function RotateLeft(lValue, iShiftBits) {
  return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
}
function AddUnsigned(lX, lY) {
  var lX4, lY4, lX8, lY8, lResult;
  lX8 = (lX & 0x80000000);
  lY8 = (lY & 0x80000000);
  lX4 = (lX & 0x40000000);
  lY4 = (lY & 0x40000000);
  lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
  if (lX4 & lY4) {
    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
  }
  if (lX4 | lY4) {
    if (lResult & 0x40000000) {
      return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
    } else {
      return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    }
  } else {
    return (lResult ^ lX8 ^ lY8);
  }
}
function F(x, y, z) {
  return (x & y) | ((~x) & z);
}
function G(x, y, z) {
  return (x & z) | (y & (~z));
}
function H(x, y, z) {
  return (x ^ y ^ z);
}
function I(x, y, z) {
  return (y ^ (x | (~z)));
}
function FF(a, b, c, d, x, s, ac) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}
function GG(a, b, c, d, x, s, ac) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}
function HH(a, b, c, d, x, s, ac) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}
function II(a, b, c, d, x, s, ac) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}
function ConvertToWordArray(string) {
  var lWordCount;
  var lMessageLength = string.length;
  var lNumberOfWords_temp1 = lMessageLength + 8;
  var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
  var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
  var lWordArray = Array(lNumberOfWords - 1);
  var lBytePosition = 0;
  var lByteCount = 0;
  while (lByteCount < lMessageLength) {
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
    lByteCount++;
  }
  lWordCount = (lByteCount - (lByteCount % 4)) / 4;
  lBytePosition = (lByteCount % 4) * 8;
  lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
  lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
  lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
  return lWordArray;
}
function WordToHex(lValue) {
  var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
  for (lCount = 0; lCount <= 3; lCount++) {
    lByte = (lValue >>> (lCount * 8)) & 255;
    WordToHexValue_temp = "0" + lByte.toString(16);
    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
  }
  return WordToHexValue;
}
function Utf8Encode(string) {
  var utftext = "";
  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
};

/**
 * 生成签名
 * @param {Object} params - 支付参数
 * @returns {string} 签名值
 */
const generateSign = (params) => {
  const { name, pay_type, price, order_id, notify_url } = params;
  const appSecret = XORPAY_PROXY_CONFIG.appSecret;
  let priceNum = Number(price);
  // 按照指定顺序拼接参数
  const signString = `${name}${pay_type}${priceNum}${order_id}${notify_url}${appSecret}`;
  
  // 计算MD5并转换为小写
  return md5(signString);
};

/**
 * 生成支付二维码
 * @param {Object} params - 支付参数
 * @param {string} params.name - 订单名
 * @param {number} params.price - 支付金额（单位：分）
 * @param {string} params.order_id - 订单id
 * @param {string} params.order_uid - 订单uid
 * @param {string} params.user_id - 支付的用户id
 * @param {string} params.pay_type - 支付方式，可选：alipay, wechat
 * @returns {Promise<Object>} 支付二维码信息
 */
export const createPayment = async (params) => {
  try {
    const { name, price, order_id, user_id, pay_type = 'alipay' } = params;

    // 构建请求参数
    const notify_url = `https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/xorpay-webhook`;

    // 确保价格格式为数字
    const formattedPrice = Number(price);

    // 生成签名
    const sign = generateSign({
      name,
      pay_type,
      price: formattedPrice,
      order_id,
      notify_url
    });



    // 构建form data
    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('pay_type', pay_type);
    formData.append('price', formattedPrice);
    formData.append('order_id', order_id);
    formData.append('order_uid', user_id);
    formData.append('notify_url', notify_url);
    formData.append('more', `{"user_id":"${user_id}"}`);
    formData.append('sign', sign);
    formData.append('expire', 600); // 让二维码10分钟过期
    //{
    //"name": "VIP升级",
    //"notify_url": "https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/xorpay-webhook",
    //"order_id": "ORDER_1773825841154_7699",
    //"order_uid": "ORDER_1773825841154_7334",
    //"pay_type": "alipay",
    //"price": "12.00",
    //"sign": "339D2B7818735EF8B17CE903EB98616C",
    //"more": "{\"user_id\":\"277bc832-abc5-4add-ad35-09ef521d360e\"}"
    //}
    //curl时，参数为：pay_type=alipay&name=VIP升级&order_uid=ORDER_1773825841154_7334&order_id=ORDER_1773825841154_7699&price=12&sign=339D2B7818735EF8B17CE903EB98616C&notify_url=https://uwgvflkueracnwgwdwpe.supabase.co/functions/v1/xorpay-webhook
    //console.log("formData: ", Object.fromEntries(formData));

    // 获取当前用户 token（supabase-js）,用于向EdgeFunction请求时的鉴权
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error('无法获取 session: ' + sessionError.message);
    }
    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error('用户未登录或没有 access_token');
    }
    const functionUrl = XORPAY_PROXY_CONFIG.supaEdgFuncUrl;
    // 发送请求
    const response = await axios.post(
      functionUrl,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessToken}`
        }
      });

    //console.log('创建订单API响应:', response.data);

    // 提取并存储 aoid（XorPay 平台返回的订单号）
    const aoid = response.data.aoid;

    if (response.data.status === "ok") {
      // 返回支付信息和 aoid
      return {
        ...response.data.info,
        aoid
      };
    } else {
      throw new Error(response.data.status || '生成支付二维码失败');
    }
  } catch (error) {
    console.error('创建支付订单失败:', error);
    throw error;
  }
};

/**
 * 验证支付状态：根据aoid查询订单orpay平台订单状态
 * @param {string} aoid - XorPay平台订单号
 * @returns {Promise<boolean>} 支付是否成功
 */
export const verifyPayment = async (aoid) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      //const isPremiumUser = userData.user.user_metadata?.isPremium || false;
      //console.log('verifyPayment isPremiumUser: ', isPremiumUser);
      // 这里根据aoid查询订单orpay平台订单状态，判断是否成功
      // 也可以在payments表中查询是否有记录的provider字段=aoid，即说明已经支付成功并写入了payments表了；
      const fnUrl = `${XORPAY_PROXY_CONFIG.supaEdgFuncOrderUrl}?aoid=${encodeURIComponent(aoid)}`;
      // 获取当前用户 token（supabase-js）,用于向EdgeFunction请求时的鉴权
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error('无法获取 session: ' + sessionError.message);
      }
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('用户未登录或没有 access_token');
      }
      try {
        const res = await fetch(fnUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            // 需要转发用户 token 或 API key 时：
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          console.error('XorPay error', data);
          return false;
        }

        const data = await res.json();
        //console.log('order verify status: ', data);
        if (data.status === 'payed' || data.status === 'success') {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.error('Network or parsing error', err);
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error('验证支付状态失败:', error);
    return false;
  }
};

/**
 * 生成唯一订单号
 * @returns {string} 订单号
 */
export const generateOrderNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORDER_${timestamp}_${random}`;
};

