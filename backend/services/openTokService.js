// OpenTok configuration - should be moved to environment variables
import OpenTok  from "opentok";

export const opentok = new OpenTok(
    process.env.OPENTOK_API_KEY,
    process.env.OPENTOK_API_SECRET
);