const axios = require('axios');
const oracledb = require('oracledb');

module.exports = app => {
  app.context.api.repository = {};
  const { config: { SOA, BD }, stringToXml } = app.context;

  /**
   * Método que se encarga de la comunicación con sistemas externos EJ: Elasticsearch, servicios SOAP, ETC.
   * @param {json} requestXML
   */

  async function obtenerPlataforResponse() {
    return new Promise((resolve, reject) => {
      (async () => {
        let connection;
        let resultadoQuery;
        try {
          connection = await oracledb.getConnection({
            user: BD.USERDB,
            password: BD.USERPASS,
            connectString: BD.CONNECTSTRING
          });
          console.log("Successfully connected to Oracle!")
          resultadoQuery = await connection.execute(`SELECT * FROM BECT_DISPOSITIVOS_MTA`, [], { outFormat: oracledb.OBJECT });
          if (resultadoQuery.rows.length == 0) {
            console.log("Query no retorna Resultado");
            resolve(resultadoQuery.rows);
          } else {
            console.log("Query OK");
            resolve(resultadoQuery.rows);
          }
        } catch (err) {
          console.log("Error: ", err);
        } finally {
          if (connection) {
            try {
              await connection.close();
            } catch (err) {
              console.log("Error when closing the database connection: ", err);
            }
          }
        }
      })().catch(e => {
        console.log(e);
        let response = {
          code: 500,
          respuesta: { "error": "error" },
          messaje: "error function  obtenerPlataforResponse"
        }
        return reject(response);
      });

    });
  }

  async function registrarTrazaDBox() {
    return new Promise((resolve, reject) => {
      (async () => {
        let connection;
        let resultadoQuery;
        try {
          connection = await oracledb.getConnection({
            user: BD.USERDB,
            password: BD.USERPASS,
            connectString: BD.CONNECTSTRING
          });
          console.log("Successfully connected to Oracle!")
          const qry = `Insert into BEC_ANDES.BECT_DESBLOQUEO_TRAZA (USUARIO_CRM,RUT_CLIENTE,SERIE_DBOX,ACCION,FECHA,HORA) 
values (null,'12505823-K',null,null,null,null)`;
          resultadoQuery = await connection.execute(qry,[], { outFormat: oracledb.OBJECT, autoCommit: true });
          if (resultadoQuery.rowsAffected == 0) {            
            console.log("Query no retorna Resultado");
            resolve(resultadoQuery.rows);
          } else {
            //connection.commit();
            console.log("Query OK");
            resolve(resultadoQuery.rowsAffected);
          }
        } catch (err) {
          console.log("Error: ", err);
        } finally {
          if (connection) {
            try {
              await connection.close();
            } catch (err) {
              console.log("Error when closing the database connection: ", err);
            }
          }
        }
      })().catch(e => {
        console.log(e);
        let response = {
          code: 500,
          respuesta: { "error": "error" },
          messaje: "error function  obtenerPlataforResponse"
        }
        return reject(response);
      });

    });
  }

  async function consultarCPESporClienteClaroVTR(rut, marca) {
    try {
      console.log("en el repository consultarCPESporClienteClaroVTR ------------------", rut);
      let requestXML = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorp.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:con="http://osbcorp.vtr.cl/PRD/EMP/ConsultarCPESporCliente/">
                             <soap:Header>
                                <head:HeaderRequest>
                                   <head:Username>?</head:Username>
                                   <head:Company>?</head:Company>
                                   <head:AppName>?</head:AppName>
                                   <head:IdClient>?</head:IdClient>
                                   <head:ReqDate>2022-03-22T11:56:02.514-03:00</head:ReqDate>
                                </head:HeaderRequest>
                             </soap:Header>
                             <soap:Body>
                                <con:ConsultarCPESporClienteRequest>
                                   <con:rutCliente>${rut}</con:rutCliente>
                                </con:ConsultarCPESporClienteRequest>
                             </soap:Body>
                          </soap:Envelope>`
      const soaConfig = {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        }
      };
      let response = await axios.post(SOA.CONSULTAR_CPS, requestXML, soaConfig);
      response = stringToXml(response.data).Envelope.Body.ConsultarCPESporClienteResponse
      if (response.resultadoEjecucion.codigoError == 0) {
        if (response.BroadbandFtth) {
          return { respuesta: response.BroadbandFtth, respuesta_completa: response, exito: true }
        } else if (response.Broadband) {
          return { respuesta: response.Broadband, respuesta_completa: response, exito: true }
        } else {
          console.log("CLIENTE NO ES FFTH ni CFTTH - repo");
          return { respuesta: "Cliente no es FTTH ni CFTTH - repo", respuesta_completa: response, exito: false, notFTTH: true }
        }
      } else {
        console.log("NO HAY DATOS");
        return { respuesta: "No se encontraron datos", exito: false, noData: true }
      }
    } catch (e) {
      console.log("error en la consulta consultarCPESporClienteClaroVTR--------------", e);
      return { respuesta: e, exito: false, notFTTH: undefined }
    }
  }

  async function consultaInformacionAaa(OLT) {
    console.log("consultarinformacion ------------------------", OLT);
    try {
      console.log("en el repository consultaInformacionAaa ------------------");

      let requestXML = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorpqa.qa.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:con="http://osbcorpqa.qa.vtr.cl/ADP/EMP/ConsultaInformacionAaa">
                           <soap:Header>
                              <head:HeaderRequest>
                                 <head:Username>?</head:Username>
                                 <head:Company>?</head:Company>
                                 <head:AppName>?</head:AppName>
                                 <head:IdClient>?</head:IdClient>
                                 <head:ReqDate>2022-03-22T11:56:02.514-03:00</head:ReqDate>
                              </head:HeaderRequest>
                           </soap:Header>
                           <soap:Body>
                              <con:consultaInformacionAaaRequest>
                                 <con:svLanOlt>${OLT.respuesta.OLT_SVlan}</con:svLanOlt>
                                 <con:cvLanOlt>${OLT.respuesta.OLT_CVlan}</con:cvLanOlt>
                                 <con:channel>BEC</con:channel>
                              </con:consultaInformacionAaaRequest>
                           </soap:Body>
                        </soap:Envelope>`
      const soaConfig = {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        }
      };
      let response = await axios.post(SOA.CONSULTAR_IFO_AAA, requestXML, soaConfig);
      // console.log("respuesta consultaInformacionAaa " , response);
      response = stringToXml(response.data).Envelope.Body.consultaInformacionAaaResponse.respuestaAaa.id;

      console.log("respuesta consultaInformacionAaa-------------------", JSON.stringify(response));

      return response
    } catch (e) {
      console.log("error en la consulta consultaInformacionAaa--------------", e);
      return e
    }
  }

  async function consultaInformacionApc(OLT) {
    console.log("consultarinformacion ------------------------", OLT);
    let response = {}
    try {
      let requestXML = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorpqa.qa.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:con="http://osbcorpqa.qa.vtr.cl/ADP/EMP/ConsultaInformacionApc">
                             <soap:Header>
                                <head:HeaderRequest>
                                   <head:Username>?</head:Username>
                                   <head:Company>?</head:Company>
                                   <head:AppName>?</head:AppName>
                                   <head:IdClient>?</head:IdClient>
                                   <head:ReqDate>2022-03-22T11:56:02.514-03:00</head:ReqDate>
                                </head:HeaderRequest>
                             </soap:Header>
                             <soap:Body>
                                <con:consultaInformacionApcRequest>
                                   <con:nameOlt>${OLT.respuesta.OLT_Name}</con:nameOlt>
                                   <con:numOlt>${OLT.respuesta.OLT_NumOnt}</con:numOlt>
                                   <con:portOlt>${OLT.respuesta.OLT_Port}</con:portOlt>
                                   <con:slotOlt>${OLT.respuesta.OLT_Slot}</con:slotOlt>
                                   <con:channel>BEC</con:channel>
                                </con:consultaInformacionApcRequest>
                             </soap:Body>
                          </soap:Envelope>`
      const soaConfig = {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        }
      };

      // console.log("requestXML consultaInformacionApc ------------------------",requestXML);

      let response = await axios.post(SOA.CONSULTAR_IFO_APC, requestXML, soaConfig);
      response = stringToXml(response.data).Envelope.Body.consultaInformacionApcResponse.respuestaApc.id;
      console.log("respuesta consultaInformacionApc ", response);
      return response
    } catch (e) {
      console.log("error en la consulta ConsultaInformacionApc--------------", e);
      return e
    }
  }

  async function consultaGetRespuestaGIAP(numeroSerie) {
    try {
      numeroSerie = `${numeroSerie}`
      let url = SOA.CONSULTAR_GIAP + numeroSerie.padStart(10, "0")
      console.log("url consultada => " + url);
      let respuestaGIAP = await axios.get(url);
      return respuestaGIAP.data
    } catch (e) {
      console.log("error en la consulta consultaGetRespuestaGIAP--------------", e);
      return e
    }
  }

  async function getServiceAMS(ONT) {
    try {
      console.log("en el repository getServiceAMS ------------------");
      let requestXML = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorp.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:obt="http://osbcorp.vtr.cl/ADP/EMP/obtenerDatosAMS">
                          <soap:Header>
                            <head:HeaderRequest>
                                <head:Username>?</head:Username>
                                <head:Company>?</head:Company>
                                <head:AppName>?</head:AppName>
                                <head:IdClient>?</head:IdClient>
                          <head:ReqDate>2023-03-22T11:56:02.514-03:00</head:ReqDate>
                            </head:HeaderRequest>
                          </soap:Header>
                          <soap:Body>
                            <obt:obtenerDatosAMSPeticion>
                            <obt:oltname>${ONT.OLT_Name}</obt:oltname>
                            <obt:oltslot>${ONT.OLT_Slot}</obt:oltslot>
                            <obt:oltport>${ONT.OLT_Port}</obt:oltport>
                            <obt:oltnumont>${ONT.OLT_NumOnt}</obt:oltnumont>
                            <obt:canal>BEC</obt:canal>
                            </obt:obtenerDatosAMSPeticion>
                          </soap:Body>
                      </soap:Envelope>`
      console.log(requestXML)
      const soaConfig = {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        }
      };
      /* Response =>
        <ns2:id>0000123123</ns2:id>
        <ns2:message>Consulta exitosa</ns2:message>
        <ns2:status>0</ns2:status>
      */
      let response = await axios.post(SOA.GET_SERVICE_AMS, requestXML, soaConfig);
      response = stringToXml(response.data).Envelope.Body['obtenerDatosAMSRespuesta'];
      if (response.ResultadoEjecucion.ejecucionExitosa) {
        return { respuesta: response, exito: true }
      } else {
        console.log("NO HAY DATOS");
        return { respuesta: "No se encontraron datos", exito: false }
      }
    } catch (e) {
      console.log("error en la consulta getServiceAMS--------------", e);
      return { respuesta: e, exito: false }
    }
  }

  async function getServiceENC(ONT) {
    try {
      console.log("en el repository getServiceENC ------------------")
      let requestXML = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorp.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:obt="http://osbcorp.vtr.cl/ADP/EMP/obtenerDatosENC">
                        <soap:Header>
                           <head:HeaderRequest>
                              <head:Username>?</head:Username>
                              <head:Company>?</head:Company>
                              <head:AppName>?</head:AppName>
                              <head:IdClient>?</head:IdClient>
                              <head:ReqDate>2023-03-22T11:56:02.514-03:00</head:ReqDate>
                           </head:HeaderRequest>
                        </soap:Header>
                        <soap:Body>
                           <obt:obtenerDatosENCPeticion>
                           <obt:oltname>${ONT.OLT_Name}</obt:oltname>
                           <obt:oltslot>${ONT.OLT_Slot}</obt:oltslot>
                           <obt:oltport>${ONT.OLT_Port}</obt:oltport>
                           <obt:oltnumont>${ONT.OLT_NumOnt}</obt:oltnumont>
                           <obt:canal>BEC</obt:canal>
                           </obt:obtenerDatosENCPeticion>
                        </soap:Body>
                     </soap:Envelope>`
      console.log(requestXML)
      const soaConfig = {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        }
      };
      /* Response =>
        <ns2:id>0000123123</ns2:id>
        <ns2:message>Consulta exitosa</ns2:message>
        <ns2:status>0</ns2:status>
      */
      let response = await axios.post(SOA.GET_SERVICE_ENC, requestXML, soaConfig);
      response = stringToXml(response.data).Envelope.Body['obtenerDatosENCRespuesta'];
      if (response.ResultadoEjecucion.ejecucionExitosa) {
        return { respuesta: response, exito: true }
      } else {
        console.log("NO HAY DATOS");
        return { respuesta: "No se encontraron datos", exito: false }
      }
    } catch (e) {
      console.log("error en la consulta getServiceENC--------------", e);
      return { respuesta: e, exito: false }
    }
  }

  async function requestActivosSiebel(rutCliente, aniCliente) {
    const requestXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://siebel.com/CustomUI">
      <soapenv:Header/>
      <soapenv:Body>
          <cus:ConsultaActivosInscritos_Input>
            <cus:rutCliente>${rutCliente.trim()}</cus:rutCliente>
            <cus:aniCliente>?</cus:aniCliente>
          </cus:ConsultaActivosInscritos_Input>
      </soapenv:Body>
    </soapenv:Envelope>`

    try {
      const soaConfig = {
        strictSSL: false,
        url: SOA.GET_ACTIVOS_SIEBEL,
        method: 'post',
        rejectUnauthorized: false,
        data: requestXML,
        headers: {
          'Accept-Encoding': 'gzip,deflate',
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '"document/http://siebel.com/CustomUI:ConsultaActivosInscritos"',
          'Content-Length': '377',
          'Host': 'osbcorp.vtr.cl:8000',
          'Proxy-Connection': 'Keep-Alive',
          'User-Agent': 'Apache-HttpClient/4.1.1 (java 1.5)'
        }
      };
      try {
        response = await axios(soaConfig);
      } catch (err) {
        console.log(err);
      }
      if (!response || !response.data) {
        await Promise.reject('request not successful');
      }

      const parsed = stringToXml(response.data);
      const { Envelope: { Body: { ConsultaActivosInscritos_Output: data } } } = parsed;
      return data;
    } catch (reason) {
      console.error('requestActivosSiebel: ', reason);
      await Promise.reject(reason);
    }
  }

  app.context.api.repository = {
    consultarCPESporClienteClaroVTR,
    consultaInformacionAaa,
    consultaInformacionApc,
    consultaGetRespuestaGIAP,
    getServiceAMS,
    getServiceENC,
    requestActivosSiebel,
    obtenerPlataforResponse,
    registrarTrazaDBox,
  };
};

