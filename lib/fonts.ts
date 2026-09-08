import { Instrument_Sans } from "next/font/google";

/**
 * Used only for the "Uychi" wordmark in the header/logo lockup -- the rest
 * of the site keeps its system-font stack (see tailwind.config.ts). Google
 * Fonts files are downloaded at build time and self-hosted by Next, so this
 * adds no runtime request to a third party.
 */
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap"
});
