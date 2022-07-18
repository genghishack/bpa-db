import axios from 'axios';
import {logDebug} from "./logging.js";

export const geocode = async (address: any) => {
  const { street_1, street_2, city, state, country, postalCode } = address;
  // logDebug({address})
  const baseUrl = 'http://www.mapquestapi.com/geocoding/v1/address';
  const queryStr = [
    `key=${process.env.MAPQUEST_API_KEY}`,
    `street=${street_1}`,
    `city=${city}`,
    `state=${state}`,
    `country=${country}`,
    `postalCode=${postalCode}`,
    'maxResults=1'
  ].join('&');
  const geocodeUrl = `${baseUrl}?${queryStr}`;

  console.log({geocodeUrl})
  try {
    let response = await axios.get(geocodeUrl);
    const { info, options, results } = response.data;
    const { providedLocation, locations } = results[0];
    // logDebug({address, geocodeUrl, info, options, results, providedLocation, locations});
    // TODO: handle more than one location
    // logDebug(locations[0])
    return locations[0];
  } catch (e) {
    return Promise.reject(e);
  }
}
