const axios = require("axios");

const getCoordinates = async (place) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: place,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "IterNation-App",
      },
    });

    if (!res.data.length) return null;

    return {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon),
    };
  } catch (error) {
    if (error.response?.status === 429) {
      const err = new Error("Geocoding service rate limit exceeded");
      err.statusCode = 429;
      throw err;
    }
    throw error;
  }
};

module.exports = { getCoordinates };
