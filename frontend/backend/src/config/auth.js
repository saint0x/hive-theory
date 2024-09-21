const { OAuth2Client } = require('google-auth-library');

const credentials = {
  client_id: '1027395944679-gpv1ct5ncvmucji8hh0i8hkgbg91ti6s.apps.googleusercontent.com',
  client_secret: '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',
  redirect_uri: 'http://localhost:3000/api/auth/callback/google'
};

const oauth2Client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uri
);

function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
}

module.exports = {
  oauth2Client,
  setCredentials
};