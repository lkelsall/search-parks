const superagent = require("superagent");
const twitter = require("twitter");
const path = require("path");
const { cities } = require("./cities");

const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: path.resolve(__dirname, `./.env.${ENV}`),
});

const twitterClient = new twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function sendTweet() {
  const city_name =
    cities[Math.floor(Math.random() * cities.length)].formatted_address;

  superagent
    .get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${city_name}%20parks%20and%20gardens&inputtype=textquery&fields=place_id&key=${process.env.PLACES_API_KEY}`
    )
    .then((response) => {
      const { place_id } = response.body.candidates[0];
      return superagent.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,photo&key=${process.env.PLACES_API_KEY}`
      );
    })
    .then((response) => {
      const photos = response.body.result.photos.slice(0, 4);
      const photoReqs = photos.map((photo) => {
        return superagent.get(
          `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxheight=1000&maxwidth=1000&key=${process.env.PLACES_API_KEY}`
        );
      });
      return Promise.all([...photoReqs, response.body.result]);
    })
    .then((responses) => {
      const cityDetails = responses.splice(responses.length - 1, 1)[0];
      const uploadReqs = responses.map((photo) => {
        return twitterClient.post("/media/upload", { media: photo.body });
      });
      return Promise.all([...uploadReqs, cityDetails]);
    })
    .then((responses) => {
      const cityDetails = responses.splice(responses.length - 1, 1)[0];
      const media_ids = responses
        .map((response) => {
          return response.media_id_string;
        })
        .join(",");
      return twitterClient.post("statuses/update", {
        status: `${cityDetails.name},\n${cityDetails.formatted_address}`,
        media_ids: media_ids,
      });
    })
    .then((tweet) => {
      console.log(tweet);
    })
    .catch((err) => {
      console.log(err);
    });
}

setInterval(sendTweet, 1000 * 60 * 60 * 24);
