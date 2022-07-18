import dotenv from 'dotenv';
import {logDebug, logError} from "./lib/logging.js";
import * as csvLib from './lib/csv.js';

// import {fileName, fieldNames, category} from "./csv_modules/attorneys.js";
// import {fileName, fieldNames, category} from "./csv_modules/co-parenting_programs.js";
// import {fileName, fieldNames, category} from "./csv_modules/consultants.js";
// import {fileName, fieldNames, category} from "./csv_modules/electronic_forensics.js";
// import {fileName, fieldNames, category} from "./csv_modules/expert_witnesses.js";
// import {fileName, fieldNames, category} from "./csv_modules/forensic_investigators_trial_consultants.js";
// import {fileName, fieldNames, category} from "./csv_modules/guardians_ad_litem.js";
// import {fileName, fieldNames, category} from "./csv_modules/judges.js";
// import {fileName, fieldNames, category} from "./csv_modules/legal_coaches_experts.js";
// import {fileName, fieldNames, category} from "./csv_modules/mediators.js";
// import {fileName, fieldNames, category} from "./csv_modules/mental_health_experts.js";
// import {fileName, fieldNames, category} from "./csv_modules/minors_counsel.js";
// import {fileName, fieldNames, category} from "./csv_modules/paralegals.js";
// import {fileName, fieldNames, category} from "./csv_modules/private_investigators.js";
// import {fileName, fieldNames, category} from "./csv_modules/resources.js";
import {fileName, fieldNames, category} from "./csv_modules/reunification_therapists.js";
// import {fileName, fieldNames, category} from "./csv_modules/speakers.js";
// import {fileName, fieldNames, category} from "./csv_modules/treatment_centers_programs.js";

dotenv.config({path: '.env'});

(async () => {
  try {
    const categoryId = await csvLib.createCategory(category);
    logDebug({categoryId});

    const rows = await csvLib.readCSVFile(fileName);
    // logDebug({rows});

    //@ts-ignore
    const newRows = csvLib.removeInvalidRows(csvLib.mapCSVRows(rows, fieldNames));
    // logDebug({newRows});
    const geocodedRows = await csvLib.geocodeRows(newRows);
    // logDebug({geocodedRows});

    await csvLib.createStagingTable(Object.keys(geocodedRows[0]));
    await csvLib.writeRowsToStaging(geocodedRows);

    const resourceIds = await csvLib.loadToResourceTable()
    await csvLib.createCategoryReferences(categoryId, resourceIds);
  } catch (e) {
    logError(e);
  }
})();
