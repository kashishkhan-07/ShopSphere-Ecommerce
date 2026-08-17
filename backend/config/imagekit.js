const ImageKit = require('imagekit');

// Initialize the ImageKit SDK using credentials from .env
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_default_mock',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_default_mock',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/shopsphere'
});

// Helper function to generate temporary upload signatures for frontend
const getAuthParams = () => {
  return imagekit.getAuthenticationParameters();
};

module.exports = {
  imagekit,
  getAuthParams
};