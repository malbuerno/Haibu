module.exports = {
  consultarPlataformaGiapClaroVTR: async ({ response, request, api }) => {
    const res = await api.getFTTHData.consultarPlataformaGiapClaroVTR(request.header).catch((error) => {
      console.error("consultarPataformas: ", error);
    });
    console.log("RETURNED ON CONTROLLER =>");
    console.log(res);
    response.status = res.status;
    response.body = res.body;
    response.type = "application/json";
  },
  solicitudDummyDB: async ({ response, request, api }) => {
    console.log(request.body);
    const { status, body } = await api.getFTTHData.solicitudDummyDB().catch((error) => {
      console.error("Muestra Compara TV: ", error);
    });
    response.status = status;
    response.body = body;
    response.type = "application/json";
  },
  // Esta funcion deberìa salir de aca y pasarse al proyecto unlock-device
  insertarTrazaDesbloqueo: async ({ response, request, api }) => {
    console.log(request.body);
    const { status, body } = await api.getFTTHData.insertarTrazaDesbloqueo().catch((error) => {
      console.error("Inserta Traza Desbloqueo DBOX: ", error);
    });
    response.status = status;
    response.body = body;
    response.type = "application/json";
  },
  solicitudModeloDB: async ({ response, request, api }) => {
    console.log(request.body);
    const { status, body } = await api.getFTTHData.solicitudModeloDB().catch((error) => {
      console.error("Muestra, Compara Modelo Equipo Internet: ", error);
    });
    response.status = status;
    response.body = body;
    response.type = "application/json";
  },
};
