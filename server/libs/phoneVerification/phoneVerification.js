
const {logger} = require('../../logger');
const request = require('request');
const VERSION = '0.1';

module.exports = function (apiKey, apiUrl) {
  return new PhoneVerification(apiKey, apiUrl);
};

class PhoneVerification {
  constructor(apiKey, apiUrl) {
    this.apiKey = apiKey;
    this.apiURL = apiUrl || 'https://api.authy.com';
    this.user_agent = `PhoneVerificationRegNode/${VERSION} (node ${process.version})`;
    this.headers = {
      'User-Agent': this.user_agent
    };
  }

  /**
   * Verify a phone number
   *
   * @param {!string} phone_number
   * @param {!string} country_code
   * @param {!string} token
   * @param {!function} callback
   */
  verifyPhoneToken(phone_number, country_code, token, callback) {
    logger.info('verifying phone number: ', country_code, phone_number, token);

    this._request('get', '/protected/json/phones/verification/check', {
      'api_key': this.apiKey,
      'verification_code': token,
      'phone_number': phone_number,
      'country_code': country_code
    },
    callback
    );
  }
  /**
   * Request a phone verification
   *
   * @param {!string} phone_number
   * @param {!string} country_code
   * @param {!string} via
   * @param {!function} callback
   */
  requestPhoneVerification(phone_number, country_code, via, callback) {
    this._request('post', '/protected/json/phones/verification/start', {
      'api_key': this.apiKey,
      'phone_number': phone_number,
      'via': via,
      'country_code': country_code,
      'code_length': 4
    },
    callback
    );
  }

  _request(type, path, params, callback, qs) {
    qs = qs || {};
    qs['api_key'] = this.apiKey;

    const options = {
      url: this.apiURL + path,
      form: params,
      headers: this.headers,
      qs: qs,
      json: true,
      jar: false,
      strictSSL: true
    };

    logger.info('sending request: ', options.url);

    const callback_check = function (err, res, body) {
      if (!err) {
        if (res.statusCode === 200) {
          callback(null, body);
        } else {
          callback(body);
        }
      } else {
        callback(err);
      }
    };

    switch (type) {
    case 'post':
      request.post(options, callback_check);
      break;

    case 'get':
      request.get(options, callback_check);
      break;
    }
  }
}
