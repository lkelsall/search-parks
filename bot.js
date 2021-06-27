const superagent = require("superagent");
const path = require("path");
const { cities } = require("./cities");

const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: path.resolve(__dirname, `./.env.${ENV}`),
});

const city_name =
  cities[Math.floor(Math.random() * cities.length)].formatted_address;

superagent
  .get(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${city_name}%20parks%20and%20gardens&inputtype=textquery&fields=name,formatted_address,place_id&key=${process.env.PLACES_API_KEY}`
  )
  .then((response) => {
    const { place_id } = response.body.candidates[0];
    return superagent.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=photo&key=${process.env.PLACES_API_KEY}`
    );
  })
  .then((response) => {
    const photoReqs = response.body.result.photos.map((photo) => {
      return superagent.get(
        `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxheight=1000&maxwidth=1000&key=${process.env.PLACES_API_KEY}`
      );
    });
    return Promise.all(photoReqs);
  })
  .then((responses) => {
    responses.forEach((response) => {
      console.log(response.body);
    });
  });
