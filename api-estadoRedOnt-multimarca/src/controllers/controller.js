module.exports = {
    consultaEstadoONT: async({ response, request, api }) => {
        const { status, body } = await api.activosSiebel.consultaEstadoONT(request.body).catch(error => {
            console.error('consultaEstadoONT: ', error);
        });
        response.status = status;
        response.body = body;
        response.type = 'application/json';
    }
};
