
module.exports = {

  // Autodesk Forge configuration

  // this this callback URL when creating your client ID and secret
  callbackURL: process.env.FORGE_CALLBACK_URL || 'http://www.floormap.me',

  // set environment variables or hard-code here
  credentials: {
    client_id: process.env.FORGE_CLIENT_ID || '9kXpth2loKQqt2eIPWIx71TLpYQVtL4w',
    client_secret: process.env.FORGE_CLIENT_SECRET || 'tTDOTY6gpY2xLTcH'
  },

  // Required scopes for your application on server-side
  scopeInternal: ['data:read','data:write','data:create','data:search'],
  // Required scope of the token sent to the client
  scopePublic: ['viewables:read']
};
