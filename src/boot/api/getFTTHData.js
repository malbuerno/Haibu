module.exports = (app) => {
  app.context.api.getFTTHData = {};
  const {
    api: { repository },
  } = app.context;

  async function solicitudDummyDB() {
    try {
      const resp = await repository.obtenerPlataforResponse();
      console.log("RESPUESTA DE BBDD A <SELECT * FROM BECT_DISPOSITIVOS_MTA>");
      return { status: 200, body: { respuesta: resp } };
    } catch (e) {
      return { status: 500, body: { ejecucionExitosa: false, error: "El cliente no existe o no tiene paquetes asociados" } };
    }
  }

  async function solicitudModeloDB() {
    try {
      const resp = await repository.obtenerModelo();
      console.log("RESPUESTA BBDD A <SELECT * FROM BEC_ANDES.BECT_PARAMETRO where nombre = 'MODELO_ROUTER'>");
      return { status: 200, body: {respuesta: resp } };
    } catch (e) {
      return { status: 500, body: { ejecucionExitosa: false, error: "El equipo de internet no tiene datos asociados!" } };
    }
  }

  async function insertarTrazaDesbloqueo() {
    try {
      const resp = await repository.registrarTrazaDBox();
      console.log("RESPUESTA DE BBDD A <Insert into BEC_ANDES.BECT_DESBLOQUEO_TRAZA(USUARIO_CRM,RUT_CLIENTE,SERIE_DBOX,ACCION,FECHA,HORA=values('rarivast','10378564-4','E77MGG345234567','Desbloqueo/Unlock',to_date('18-06-24','DD-MM-RR'=,'17:31')>");
      return { status: 200, body: { respuesta: resp } };
    } catch (e) {
      return { status: 500, body: { ejecucionExitosa: false, error: "El cliente no existe o no tiene paquetes asociados" } };
    }
  }

  async function consultarPlataformaGiapClaroVTR(request) {
    try {
      console.log("INSIDE GETFTTHDATA.JS");
      console.log("REQUEST DATA =>");
      console.log(request);
      console.log("CALLING CPESPORCLIENTE AND GETTING TIPORED");

      const respuestaCPESporCliente = await repository.consultarCPESporClienteClaroVTR(
        request.rut.includes("-") ? request.rut : request.rut.slice(0, -1) + "-" + request.rut.slice(-1),
        request.marca
      );
      const tipoRed = respuestaCPESporCliente.respuesta.Tipo_Red_Producto;
      console.log("tipo red => " + tipoRed);

      if (tipoRed === "CFTT" && respuestaCPESporCliente.exito) {
        console.log("if (tipoRed === CFTT && respuestaCPESporCliente.exito)");
        return consultarPlataformasMultimarca({ respuestaCPESporCliente, rut: request.rut, aniCliente: request.aniCliente });
      } else if (tipoRed === "FTTH" && respuestaCPESporCliente.exito) {
        console.log("else if (tipoRed === FTTH && respuestaCPESporCliente.exito) {");
        return consultarPataformasAAA(request, respuestaCPESporCliente);
      } else if (respuestaCPESporCliente.notFTTH || tipoRed === "HFC" || tipoRed === "CHFC" || tipoRed === "CHF") {
        console.log("} else if (respuestaCPESporCliente.notFTTH || tipoRed === HFC || tipoRed === CHFC || tipoRed === CHF) {");
        return {
          status: 200,
          body: {
            ejecucionExitosa: false,
            respuesta: "Cliente no es FTTH ni CFTTH",
            respuesta_completa: respuestaCPESporCliente.respuesta_completa,
            exito: false,
          },
        };
      } else if (respuestaCPESporCliente.noData) {
        console.log("} else if (respuestaCPESporCliente.noData) {");
        return { status: 200, body: { ejecucionExitosa: false, error: respuestaCPESporCliente.respuesta } };
      } else {
        console.log("else");
        console.error("GETFTTH FILE Error consultarPataformasClaroVTR service ");
        return { status: 500, body: { ejecucionExitosa: false, error: respuestaCPESporCliente.respuesta } };
      }
    } catch (e) {
      console.error("CATCHED ON GETFTTH FILE, Error consultarPataformasClaroVTR service");
      console.error(e);
      return { status: 500, body: { ejecucionExitosa: false, error: "Error consultarPataformasClaroVTR service" } };
    }
  }

  async function consultarPlataformasMultimarca({ respuestaCPESporCliente, rut, aniCliente }) {
    const respuesta = {
      marca: null,
      modelo: null,
      modoConexion: null,
      velocidadContratada: null,
    };

    let AMSresponse,
      ENCresponse = null;

    console.log("GETTING AMS AND ENC RESPONSE");

    AMSresponse = await repository.getServiceAMS(respuestaCPESporCliente.respuesta.OLT);

    ENCresponse = await repository.getServiceENC(respuestaCPESporCliente.respuesta.OLT);

    console.log("AMS RESPONSE => ");
    console.log(AMSresponse.respuesta);

    console.log("ENC RESPONSE => ");
    console.log(ENCresponse.respuesta);

    if (!AMSresponse || (!AMSresponse.exito && !ENCresponse) || !ENCresponse.exito) {
      console.log("if (!AMSresponse || !AMSresponse.exito && !ENCresponse || !ENCresponse.exito) {");
      console.error("Error consultarPataformasClaroVTR service - AMS - ENC BLOCK");
      return { status: 500, body: { ejecucionExitosa: false, error: "Error al obtener AMS ENC por cliente" } };
    }

    // WAIT FOR GIAP
    const maxAttempts = 10;
    const delayBetweenAttempts = 2500;

    console.log("CALLING GIAP WITH AMS AND ENC RESPONSES");

    let respuestaGIAPAMS = await retryGetRespuestaGIAP(AMSresponse.respuesta.id, maxAttempts, delayBetweenAttempts);
    let respuestaGIAPENC = await retryGetRespuestaGIAP(ENCresponse.respuesta.id, maxAttempts, delayBetweenAttempts / 1.4);

    respuestaGIAPAMS =
      respuestaGIAPAMS && respuestaGIAPAMS.respuestaGIAP && respuestaGIAPAMS.respuestaGIAP.platformResponse
        ? respuestaGIAPAMS.respuestaGIAP.platformResponse
        : null;

    respuestaGIAPENC =
      respuestaGIAPENC && respuestaGIAPENC.respuestaGIAP && respuestaGIAPENC.respuestaGIAP.platformResponse
        ? respuestaGIAPENC.respuestaGIAP.platformResponse
        : null;

    console.log("respuestaGIAPAMS =>");
    console.log(respuestaGIAPAMS);

    console.log("respuestaGIAPENC =>");
    console.log(respuestaGIAPENC);

    if (respuestaGIAPAMS && respuestaGIAPENC) {
      console.log("CHECKING IF GIAP RETURNS SOMETHING");
      if (respuestaGIAPAMS.length > respuestaGIAPENC.length) {
        console.log("if (respuestaGIAPAMS.length > respuestaGIAPENC.length) {");
        console.log("respuestaGIAPAMS =>");

        let startIndex = respuestaGIAPAMS.indexOf("<?xml version=");
        let endIndex = respuestaGIAPAMS.indexOf("</soapenv:Envelope>");

        respuestaGIAPAMS = respuestaGIAPAMS.substring(startIndex, endIndex + "</soapenv:Envelope>".length);

        console.log(respuestaGIAPAMS);

        startIndex = respuestaGIAPAMS.indexOf('<?xml version="1.0"'); // Find the start of the SOAP string
        endIndex = respuestaGIAPAMS.lastIndexOf("</soapenv:Envelope>"); // Find the end of the SOAP string

        const soapString = respuestaGIAPAMS.substring(startIndex, endIndex + "</soapenv:Envelope>".length);

        console.log("AMS EXTRACTED SOAP STRING");
        console.log(soapString);

        const templateNameRegex = /<templateName>(.*?)<\/templateName>/;
        const qosProfile2Regex = /<name>ontVeipPortQosProfiles_BandwidthProfileUsQueue0<\/name>\s*<value>(.*?)<\/value>/;

        // get download and upload speed
        const templateName = soapString.match(templateNameRegex)[1];
        const uploadSpeed = soapString.match(qosProfile2Regex)[1];

        respuesta.marca = templateName.split("_")[1];
        respuesta.modelo = templateName.split("_")[2];

        respuesta.modoConexion = uploadSpeed.split("_")[2];

        respuesta.velocidadContratada = uploadSpeed.split("_")[1].replace("M", " Mbps");

        respuesta.exito = true;
        console.log("FINAL RESPONSE =>");
        console.log(respuesta);
      } else if (respuestaGIAPAMS.length < respuestaGIAPENC.length) {
        console.log("} else if (respuestaGIAPAMS.length < respuestaGIAPENC.length) {");
        /* SI ES ENC HAY QUE LLAMAR A SIEBEL */
        // respuestaGIAPENC = parseResponseENC(JSON.parse(respuestaGIAPENC).response.plataformResponse);
        respuestaGIAPENC = JSON.parse(respuestaGIAPENC).response.plataformResponse;
        console.log("resuesta.ENC");
        console.log(respuestaGIAPENC);
        console.log("THIS IS AN ENC RESPONSE, SO WE HAVE TO REQUEST SIEBEL ASSETS");
        const responseSiebel = await repository.requestActivosSiebel(rut, aniCliente);
        console.log("RESPONSE SIEBEL =>");

        // console.log(responseSiebel.Activo.Assets.Asset);

        responseSiebel.Activo.Assets.Asset.forEach((elem) => {
          if (elem.AssetXA.AssetXA) {
            console.log(elem.AssetXA.AssetXA);
            elem.AssetXA.AssetXA.forEach((asset) => {
              if (asset.Nombre === "Upstream") {
                respuesta.velocidadContratada = asset.Valor.toLowerCase().replace("mbps", "Mbps");
              } else if (asset.Nombre === "Routing Mode") {
                respuesta.modoConexion = asset.Valor;
              }
            });
          }
        });
        console.log(respuesta);
        const elementoEncontrado = responseSiebel.Activo.Assets.Asset.find((item) => item.ClaseProducto === "Fixed Data Device_Class");
        respuesta.marca = elementoEncontrado.MarcaEquipo;
        respuesta.modelo = elementoEncontrado.ModeloEquipo;
        respuesta.exito = true;
        console.log("ENC FORMATTED RESPONSE => ");
        console.log(respuesta);
      } else {
        console.log("No hay template");
        respuesta.templateName = "No hay template";
        respuesta.exito = false;
      }
      return { status: 200, body: respuesta };
    } else return new Error("Neither AMS nor ENC");
  }

  async function consultarPataformasAAA(request) {
    try {
      const respuestaCPESporCliente = await repository.consultarCPESporCliente(request.rut);
      const respuestaInformacionAaa = await repository.consultaInformacionAaa(respuestaCPESporCliente);
      const respuestaInformacionApc = await repository.consultaInformacionApc(respuestaCPESporCliente);
      sleep(10000);
      //////////////consulta giap AAA
      if (respuestaCPESporCliente.exito) {
        var respuestaGIAPAAA = await repository.consultaGetRespuestaGIAP(respuestaInformacionAaa);
        var respuesta = {
          AAA: { planName: {}, exito: false },
          APC: {
            infoApc: {
              modoConexion: "BRIDGE",
              marca: "",
            },
            exito: false,
          },
        };

        //  console.log("respuestaGIAPAAA", respuestaGIAPAAA);
        if (respuestaGIAPAAA.data.exitoEjecucion) {
          let repuestaGiapAAAParse = JSON.parse(respuestaGIAPAAA.data.respuestaGIAP.platformResponse).response.plataformResponse;
          let indiceCadenaAAA = repuestaGiapAAAParse.indexOf("Plan Name", 0);
          let planName = repuestaGiapAAAParse.substr(indiceCadenaAAA, 22);
          respuesta.AAA.planName = planName;
          respuesta.AAA.exito = true;
        } else {
          respuesta.AAA.templateName = "No hay template";
          respuesta.AAA.exito = false;
        }

        /////////////////consulta giap APC
        var respuestaGIAPAPC = await repository.consultaGetRespuestaGIAP(respuestaInformacionApc);
        //  console.log("respuestaGIAPAPC ----" , respuestaGIAPAPC.data);
        if (respuestaGIAPAPC.data.exitoEjecucion) {
          if (respuestaGIAPAPC.data.respuestaGIAP.platformResponse) {
            var objetoRespuestaGIAPAPC = respuestaGIAPAPC.data.respuestaGIAP.platformResponse.replace('"[', "[");
            objetoRespuestaGIAPAPC = objetoRespuestaGIAPAPC.replace(']"', "]");
            objetoRespuestaGIAPAPC = JSON.parse(objetoRespuestaGIAPAPC).response.plataformResponse[0];
            var divisionTemplateName = objetoRespuestaGIAPAPC.templateName.split("_");
            if (divisionTemplateName[1] == "NOKIA" && divisionTemplateName[1] == "G241WA") {
              respuesta.APC.infoApc.modoConexion = "NAT";
            }
            respuesta.APC.infoApc.marca = divisionTemplateName[1];
            respuesta.APC.infoApc.modelo = divisionTemplateName[2];
            respuesta.APC.exito = true;
          } else {
            console.log("sin respuesta plataforma");
          }
        } else {
          console.log("Error respuesta giap apc");
        }
        return { body: { respuesta, ejecucionExitosa: true }, status: 200 };
      } else {
        console.error("Error consultargiap service");
        return { status: 500, body: { ejecucionExitosa: false, error: "Error al obtener CPES por cliente" } };
      }
    } catch (e) {
      console.error("Error consultargiap service ", e);
      return { status: 500, body: { ejecucionExitosa: false, error: e.message } };
    }
  }

  async function retryGetRespuestaGIAP(id, maxAttempts, delay) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const respuesta = await repository.consultaGetRespuestaGIAP(id);
        if (respuesta.exitoEjecucion) {
          return respuesta;
        }
      } catch (error) {
        console.log("ERROR => ");
        console.log(e);
      }
      await sleep(delay);
      attempts++;
    }
    return null; // Si no tiene éxito después de intentar varias veces
  }

  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  app.context.api.getFTTHData = {
    consultarPlataformaGiapClaroVTR,
    solicitudDummyDB,
    insertarTrazaDesbloqueo,
    solicitudModeloDB,
  };
};
