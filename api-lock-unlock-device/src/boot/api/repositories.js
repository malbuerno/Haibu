const axios = require('axios');

module.exports = app => {
  app.context.api.repository = {};
  const { config: { SOA }, stringToXml } = app.context;

  async function getDecoderSerialNumber(data) {
    try {
      const requestXML = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorp.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:des="http://osbcorp.vtr.cl/ADP/EMP/desbloquearDispositivoRequest">
          <soap:Header>
            <head:HeaderRequest>
                <head:Username>?</head:Username>
                <head:Company>?</head:Company>
                <head:AppName>?</head:AppName>
                <head:IdClient>99999046-6</head:IdClient>
                <head:ReqDate>2022-03-22T11:56:02.514-03:00</head:ReqDate>
              </head:HeaderRequest>
          </soap:Header>
          <soap:Body>
            <des:decoderSerialNumber>
                <data>${ data }</data>
            </des:decoderSerialNumber>
          </soap:Body>
      </soap:Envelope>`;
      const soaConfig = {
        strictSSL: false,
        url: SOA.URL_GET_SERIAL_NUMBER,
        method: 'post',
        rejectUnauthorized: false,
        data: requestXML,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/xml;charset=UTF-8'
        }
      };
      const response = await axios(soaConfig);
      const decoderSerialNumber = stringToXml(response.data).Envelope.Body.DecoderSerialNumber;
      return decoderSerialNumber;
    } catch (e) {
      console.error('Error in getDecoderSerialNumber - repo:', e);
      throw e;
    }
  }

  async function lockUnlock(decoderSerialNumber) {
    const requestXML = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorp.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:des="http://osbcorp.vtr.cl/ADP/EMP/desbloquearDispositivoRequest">
          <soap:Header>
            <head:HeaderRequest>
                <head:Username>?</head:Username>
                <head:Company>?</head:Company>
                <head:AppName>?</head:AppName>
                <head:IdClient>99999046-6</head:IdClient>
                <head:ReqDate>2022-03-22T11:56:02.514-03:00</head:ReqDate>
              </head:HeaderRequest>
          </soap:Header>
          <soap:Body>
            <des:desbloquearDispositivo>
                <numeroSerie>${ decoderSerialNumber }</numeroSerie>
            </des:desbloquearDispositivo>
          </soap:Body>
      </soap:Envelope>`;
    try {
      const soaConfig = {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        }
      };
      let response = await axios.post(SOA.URL_LOCK_DEVICE, requestXML, soaConfig);
      const lockUnlockResponse = stringToXml(response.data).Envelope.Body;
      return lockUnlockResponse;
    } catch (e) {
      console.error("Error in lockUnlock - repo:", e);
      return e;
    }
  }

  app.context.api.repository = {
    getDecoderSerialNumber,
    lockUnlock,
  };
};
