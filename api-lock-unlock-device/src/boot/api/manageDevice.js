module.exports = app => {
  const { api: { repository } } = app.context;

  async function lockUnlock(data) {
    try {
      //const decoderSerialNumber = await repository.getDecoderSerialNumber(data);
      //const lockUnlockResponse = await repository.lockUnlock(decoderSerialNumber);
      const lockUnlockResponse = await repository.lockUnlock('E22CGR210403858');
      return { status: 200, body: lockUnlockResponse };
    } catch (e) {
      console.error('lockUnlock Error - manageDevice:', e);
      return { status: 500, body: { error: 'Internal Server Error' } };
    }
  }

  app.context.api.manageDevice = {
    lockUnlock
  };
};


