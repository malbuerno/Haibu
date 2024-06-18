const request = require('supertest');
let app = request('http://localhost:3000');
const VERSION = '2.0.3';

beforeAll(async() => {  
  console.log('Jest starting!');
});
// close the server after each test
afterAll(() => {});

describe('Autentificación', () => {
  test('Entrando a vistas que necesitas token', () => {
    return app
      .get('/')
      .set('Accept', 'application/json')
      .expect(401)
      .then(response => {
        expect(response.text).toEqual('Authentication Error');
        expect(response.type).toEqual('text/plain');
      });
  });

  test('Usuario incorrecto, contraseña correcta', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: 'Matilu32', username: 'Asalazarr', version: VERSION })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Usuario no creado');
        expect(response.type).toEqual('application/json');
      });
  });

  test('Usuario correcta, contraseña incorrecto', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: 'xxxxx', username: 'Asalazar', version: VERSION })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Usuario o clave incorrecta');
        expect(response.type).toEqual('application/json');
      });
  });

  test('Usuario no existente', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: '12345', username: '12345', version: VERSION })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Usuario no creado');
        expect(response.type).toEqual('application/json');
      });
  });

  test('Usuario correcto, contraseña vacia', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ username: 'Asalazar', version: VERSION })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Usuario o clave incorrecta');
        expect(response.type).toEqual('application/json');
      });
  });

  test('Usuario  vacia, contraseña correcto', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: 'Matilu32', version: VERSION })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Usuario no creado');
        expect(response.type).toEqual('application/json');
      });
  });

  test('Usuario  vacia, contraseña vacia', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ version: VERSION })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Usuario no creado');
        expect(response.type).toEqual('application/json');
      });
  });
});

describe('Versión de App', () => {
  test('Usuario correcto, contraseña correcta, versión antigua', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: 'Matilu32', username: 'Asalazar', version: '2.0.0' })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Actualizar');
        expect(response.type).toEqual('application/json');
      });
  });

  test('Usuario correcto, contraseña correcta, sin version', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: 'Matilu32', username: 'Asalazar' })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Actualizar');
        expect(response.type).toEqual('application/json');
      });
  });

  test('Usuario correcto, contraseña correcta, con version como palabra', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: 'Matilu32', username: 'Asalazar', version: 'texto' })
      .expect(401)
      .then(response => {
        expect(response.body.title).toEqual('Actualizar');
        expect(response.type).toEqual('application/json');
      });
  });
});

describe('url_example correcto ', () => {
  test('url_example Valido', () => {
    return app
      .post('/tecnicos/v1/url_example')
      .set('Accept', 'application/json')
      .send({ password: 'Matilu32', username: 'Asalazar', version: VERSION })
      .expect(200)
      .then(response => {
        expect(response.body.data.cn).toEqual('asalazar');
        expect(response.type).toEqual('application/json');
      });
  });
});
