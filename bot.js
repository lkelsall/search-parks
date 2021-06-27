const superagent = require("superagent");
const path = require("path");
const { cities } = require("./cities");

const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: path.resolve(__dirname, `./.env.${ENV}`),
});

const city_name =
  cities[Math.floor(Math.random() * cities.length)].formatted_address;

// superagent
//   .get(
//     `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${city_name}%20parks%20and%20gardens&inputtype=textquery&fields=name,formatted_address&key=${process.env.PLACES_API_KEY}`
//   )
//   .then((response) => console.log(response.body));
