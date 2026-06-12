const jwt = require("jsonwebtoken");

//Generating Token
const maxAge = 60 * 60 * 24;

const generToken = (data) => {
  return jwt.sign({ data }, "Toktok App", {
    expiresIn: maxAge,
  });
};

module.exports = { generToken };
