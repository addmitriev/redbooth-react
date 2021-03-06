const express = require('express');
const cors = require('cors');
const app = express();
const fetch = require('isomorphic-fetch');
const config = require('../config/config.json').server;
const URLSearchParams = require('urlsearchparams').URLSearchParams;
const bodyParser = require('body-parser');
const humps = require('humps');
const PORT = process.env.PORT || 3002;

app.listen(PORT, function () {
  let { address, port } = this.address();
  console.log(`Server is listening on ${address}:${port}`);
});

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function handleResponseError (response) {
  return new Promise((resolve)=> {
    const clonedResponse = response.clone();
    clonedResponse.json().then(json => {
      resolve([ clonedResponse.status, humps.camelizeKeys(json) ]);
    }).catch(_ => {
      response.text().then(text => {
        resolve([ response.status, { error: text || response.statusText } ]);
      }).catch(_ => {
        resolve([ response.status, { error: response.statusText } ]);
      });
    });
  });
}

app.post('/token', (req, res) => {
  const url = config.redbooth.tokenURL;
  let params = new URLSearchParams();

  const { redirectURL, clientId, clientSecret } = config.redbooth;

  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('code', req.body.code);
  params.append('redirect_uri', redirectURL);
  params.append('grant_type', 'authorization_code');

  fetch(url, {
    method: 'post',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: params.toString()
  }).then((response) => {
    if (response.status >= 400) {
      return Promise.reject(response);
    }
    return response.json();
  }).then((json) => {
    res.json(humps.camelizeKeys(json))
  }).catch(response => {
    response.json().then(json => {
      res.status(response.status).json(humps.camelizeKeys(json));
    })
  });
});

app.post('/refreshToken', (req, res) => {
  const url = config.redbooth.tokenURL;
  let params = new URLSearchParams();

  const { redirectURL, clientId, clientSecret } = config.redbooth;

  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('refresh_token', req.body.refresh_token);
  params.append('redirect_uri', redirectURL);
  params.append('grant_type', 'refresh_token');

  fetch(url, {
    method: 'post',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: params.toString()
  }).then((response) => {
    if (response.status >= 400) {
      return Promise.reject(response);
    }
    return response.json();
  }).then((json) => {
    res.json(humps.camelizeKeys(json))
  }).catch((response)=> {
    handleResponseError(response).then(([status, json])=> {
      res.status(status).json(json);
    });
  });
});

app.get('/*', (req, res) => {
  const url = config.redbooth.apiURL + req.originalUrl;
  fetch(url, {
    method: 'get',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: req.body
  }).then((response) => {
    if (response.status >= 400) {
      return Promise.reject(response);
    }
    return response.json();
  }).then((json) => {
    res.json(humps.camelizeKeys(json))
  }).catch((response)=> {
    handleResponseError(response).then(([status, json])=> {
      res.status(status).json(json);
    });
  });
});

app.post('/*', (req, res) => {
  const url = config.redbooth.apiURL + req.originalUrl;
  fetch(url, {
    method: 'post',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: req.body
  }).then((response) => {
    if (response.status >= 400) {
      return Promise.reject(response);
    }
    return response.json();
  }).then((json) => {
    res.json(humps.camelizeKeys(json))
  }).catch((response)=> {
    handleResponseError(response).then(([status, json])=> {
      res.status(status).json(json);
    });
  });
});
