import { endpoints } from "@/lib/api/endpoints";
import { getJson } from "@/lib/api/http";

import type { ControlApiHealth } from "./types";

export async function getApiHealth() {
  return getJson<ControlApiHealth>(endpoints.health);
}
