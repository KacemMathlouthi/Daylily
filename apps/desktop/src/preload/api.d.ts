import type { DaylilyApi } from "../shared/channels";

declare global {
  interface Window {
    daylily: DaylilyApi;
  }
}
