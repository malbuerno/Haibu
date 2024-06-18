module.exports = {
  lockUnlock: async ({ response, request, api }) => {
    try {
      const result = await api.manageDevice.lockUnlock(request.body.data);
      response.body = result.body;
      response.status = result.status;
      response.type = 'application/json';
      
    } catch (error) {
      console.error('lockUnlock Error - controller:', error);
      response.status = 500;
      response.body = { error: 'Internal Server Error' };
    }
  },
};
