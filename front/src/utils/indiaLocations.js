import { City, State } from "country-state-city";

export function getIndiaStates() {
  // Returns: [{ name, isoCode, countryCode, ... }]
  return State.getStatesOfCountry("IN") ?? [];
}

export function getIndiaCities() {
  // Returns: [{ name, stateCode, countryCode, ... }]
  return City.getCitiesOfCountry("IN") ?? [];
}

export function getIndiaCitiesOfState(stateIsoCode) {
  if (!stateIsoCode) return [];
  return City.getCitiesOfState("IN", stateIsoCode) ?? [];
}

