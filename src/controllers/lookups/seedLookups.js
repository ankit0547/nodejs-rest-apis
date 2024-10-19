import { Country } from "../../models/lookups/country.js";
import { countries, states } from "../../models/lookups/lookupConstants.js";
import { State } from "../../models/lookups/state.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";

export const seedLookup = AsyncHandler(async (req, res) => {
  // Create countries
  for (const countryData of countries) {
    const country = new Country(countryData);
    await country.save();
  }

  // Create states
  for (const stateData of states) {
    const country = await Country.findOne({ code: stateData.countryCode });
    const state = new State({ ...stateData, country: country._id });
    await state.save();

    // Update country with the state reference
    country.states.push(state._id);
    await country.save();
  }
  return res.json(
    new ApiResponse(
      200,
      {}, // send access and refresh token in response if client decides to save them by themselves
      "lookup seeded!"
    )
  );
});
