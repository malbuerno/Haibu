const parser = require('fast-xml-parser');

module.exports = app => {
  app.context.stringToXml = {};
  app.context.actionTypes = {};
  app.context.serverError = {};
  app.context.validateVersion = {};

  let options = {
    allowBooleanAttributes: true,
    attrNodeName: false,
    attributeNamePrefix: '',
    cdataTagName: false,
    decodeHTMLchar: false,
    ignoreAttributes: false,
    ignoreNameSpace: true,
    localeRange: '',
    parseAttributeValue: undefined,
    parseNodeValue: true,
    trimValues: true
  };
  app.context.stringToXml = xml => {
    return parser.parse(xml, options);
  };

  app.context.actionTypes = {
    URL: 'url',
    CALL: 'call',
    NOTHING: 'nothing'
  };

  app.context.serverError = {
    title: 'Intermitencia en el servicio',
    message:
      'Se ha producido un error en el servicio, vuelve a intentarlo en unos minutos',
    buttons: [
      {
        text: 'Cerrar',
        cssClass: 'primary'
      }
    ],
    icon: 'danger'
  };

  app.context.validateVersion = (userVersion, actualVersion) => {
    const regexpSource =
      '^((([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?)(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?)$';
    const exp = new RegExp(regexpSource);
    if (exp.test(userVersion)) {
      let actualVersionArray = actualVersion.split('.');
      let userVersionArray = userVersion.split('.');
      return (
        userVersionArray[0] >= actualVersionArray[0] &&
        userVersionArray[1] >= actualVersionArray[1] &&
        userVersionArray[2] >= actualVersionArray[2]
      );
    } else {
      return false;
    }
  };
};
