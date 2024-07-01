const axios = require("axios");
const moment = require("moment");

module.exports = (app) => {
  app.context.api.repository = {};
  const {
    config: { SOA },
    stringToXml,
  } = app.context;

  /**
   * Método que se encarga de la comunicación con sistemas externos EJ: Elasticsearch, servicios SOAP, ETC.
   * @param {json} requestXML
   */
  async function consultaEstadoONT(requestXML) {
    let response = "";
    try {
      const soaConfig = {
        strictSSL: false,
        url: SOA.BASE_URL,
        method: "post",
        rejectUnauthorized: false,
        data: requestXML,
        headers: {
          "Accept-Encoding": "gzip,deflate",
          "Content-Type":
            'application/soap+xml;charset=UTF-8;action="http://osbcorp.vtr.cl:8000/consultarCPESporCliente"',
          "Content-Length": "691",
          Host: "osbcorp.vtr.cl:8000",
          "Proxy-Connection": "Keep-Alive",
          "User-Agent": "Apache-HttpClient/4.1.1 (java 1.5)",
        },
      };
      try {
        response = await axios(soaConfig);
      } catch (err) {
        console.log(err);
      }
      if (!response || !response.data) {
        await Promise.reject("request not successful");
      }

      const parsed = stringToXml(response.data);
      console.log(parsed.Envelope.Body.ConsultarCPESporClienteResponse);
      const name =
        parsed.Envelope.Body.ConsultarCPESporClienteResponse.BroadbandFtth.OLT.OLT_Name.toString();
      const port =
        parsed.Envelope.Body.ConsultarCPESporClienteResponse.BroadbandFtth.OLT.OLT_Port.toString();
      const slot =
        parsed.Envelope.Body.ConsultarCPESporClienteResponse.BroadbandFtth.OLT.OLT_Slot.toString();
      const ont =
        parsed.Envelope.Body.ConsultarCPESporClienteResponse.BroadbandFtth.OLT.OLT_NumOnt.toString();
      const answer =
        "/type=Optical Measurements/R1.S1.LT" +
        slot +
        ".PON" +
        port +
        ".ONT" +
        ont;
      // nivelesCross(answer, name);
      const nivelRX = await nivelesCross(answer, name);
      if (nivelRX != 65.536) {
        var estadoOnt = {
          estadoOnt: "Online",
          estadoRed: "VERDE",
        };
      } else {
        var estadoOnt = {
          estadoOnt: "Offline",
          estadoRed: "ROJO",
        };
      }

      return estadoOnt;
    } catch (reason) {
      console.error("requestConsultarEstadoONT: ", reason);
      await Promise.reject(reason);
    }
  }

  async function nivelesCross(answer, name) {
    console.log(":::: Primera Respuesta ::::", answer, name);
    const request = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorp.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:adp="http://osbcorp.vtr.cl/ADP/EMP/ADPEMPmedicionNivelesCROSS">
        <soap:Header>
           <head:HeaderRequest>
              <head:Username>?</head:Username>
              <head:Company>?</head:Company>
              <head:AppName>?</head:AppName>
              <head:IdClient>?</head:IdClient>
              <head:ReqDate>2021-02-08T21:32:52</head:ReqDate>
           </head:HeaderRequest>
        </soap:Header>
        <soap:Body>
           <adp:medicionNivelesCROSS>
              <adp:dispositivo>
                 <!--Optional:-->
                 <adp:DispositivoTypeFTTH>
                    <adp:mdNm>AMS</adp:mdNm>
                    <adp:meNm>${name}</adp:meNm>
                    <adp:propopNm>${answer}</adp:propopNm>
                    <adp:Level/>
                    <adp:Source/>
                    <adp:Type/>
                 </adp:DispositivoTypeFTTH>
              </adp:dispositivo>
           </adp:medicionNivelesCROSS>
        </soap:Body>
     </soap:Envelope>`;
    console.log("::: REQUEST NIVELES CROSS :::", request);
    let response = "";
    try {
      const soaConfig = {
        strictSSL: false,
        url: SOA.SECOND_URL,
        method: "post",
        rejectUnauthorized: false,
        data: request,
        headers: {
          "Accept-Encoding": "gzip,deflate",
          "Content-Type":
            'application/soap+xml;charset=UTF-8;action="http://osbcorp.vtr.cl:8000/consultarCPESporCliente"',
          "Content-Length": "691",
          Host: "osbcorp.vtr.cl:8000",
          "Proxy-Connection": "Keep-Alive",
          "User-Agent": "Apache-HttpClient/4.1.1 (java 1.5)",
        },
      };
      try {
        response = await axios(soaConfig);
      } catch (err) {
        console.log(err);
      }
      if (!response || !response.data) {
        await Promise.reject("request not successful");
      }

      const parsed = stringToXml(response.data);
      const rxOptical = Number(
        parsed.Envelope.Body.medicionNivelesCROSSResponse.medicion.MedicionFTTH
          .Rx_Signal.valorActualRx_Signal
      );
      console.log(":::: Segunda Respuesta ::::", rxOptical);
      return rxOptical;
    } catch (reason) {
      console.error("requestConsultarEstadoONT: ", reason);
      await Promise.reject(reason);
    }
  }

  app.context.api.repository = {
    consultaEstadoONT,
  };
};
