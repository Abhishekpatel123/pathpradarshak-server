require("dotenv").config();
console.log(process.env, 'env')
module.exports = {
  // mongoURI: "mongodb://spectre:spectre007@ds253537.mlab.com:53537/elearning", //apurva's
  // mongoURI: 'mongodb+srv://admin:admin@cluster0-xb8vd.gcp.mongodb.net/E-learning?retryWrites=true&w=majority',
  mongoURI: process.env.MONGO_URL,
  secretOrKey: process.env.JWT_SECRET,
  adminSecretOrKey: process.env.ADMIN_JWT_SECRET,
};
