import { Router } from "express";
import { seedLookup } from "../../controllers/lookups/seedLookups.js";
import { Country } from "../../models/lookups/country.js";
import { State } from "../../models/lookups/state.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { globalconstants } from "../../constants.js";

const router = Router();

router.route("/").get(seedLookup);
router.route("/deleteAll").get(async (req, res) => {
  try {
    const result1 = await Country.deleteMany({});
    const result2 = await State.deleteMany({});
    console.log(
      `Deleted ${result1.deletedCount} Countries and ${result2.deletedCount} states.`
    );
    return res.json(
      new ApiResponse(
        globalconstants.responseFlags.ACTION_COMPLETE,
        {},
        `Deleted ${result1.deletedCount} Countries and ${result2.deletedCount} states.`
      )
    );
  } catch (error) {
    console.error("Error deleting users:", error);
  }
});

export default router;
