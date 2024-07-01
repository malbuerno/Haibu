
module.exports = app => {
  app.context.api.consultaEstadoONT = {};
  const { api: { repository } } = app.context;

  async function consultaEstadoONT({ rut }) {
    console.log("::::::::: Consulta Estado ONT ::::::::");
    try {
      const xmlSoap = getSoapBody(rut);

      const response = await repository.consultaEstadoONT(xmlSoap);
      console.log(":::: Respuesta Obtenida ::::",response);

      return { body:  { response } , status: 200 };
    } catch (e) {
      console.error('consultaEstadoONT', e);
      return { status: 500, body: { ejecucionExitosa: false, error: e.message } };
    }
  }

  

  function getSoapBody(rut) {
    return `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:head="http://osbcorp.vtr.cl/GLOBAL/EMP/HeaderRequest" xmlns:con="http://osbcorp.vtr.cl/PRD/EMP/ConsultarCPESporCliente/">
   <soap:Header>
      <head:HeaderRequest>
         <head:Username>?</head:Username>
         <head:Company>?</head:Company>
         <head:AppName>?</head:AppName>
         <head:IdClient>?</head:IdClient>
         <head:ReqDate>2020-12-01T00:00:00</head:ReqDate>
      </head:HeaderRequest>
   </soap:Header>
   <soap:Body>
      <con:ConsultarCPESporClienteRequest>
         <con:rutCliente>${rut}</con:rutCliente>
      </con:ConsultarCPESporClienteRequest>
   </soap:Body>
</soap:Envelope>`;
  }


  function getFullRut(rut) {
    if (rut.length < 12) {
      let finalRut = rut;
      for (let i = 0; i < 12 - rut.length; i++) {
        finalRut = `0${finalRut}`;
      }
      return finalRut;
    } else return rut;
  }

  app.context.api.activosSiebel = {
    consultaEstadoONT
  };
};


