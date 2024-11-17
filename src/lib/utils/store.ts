import type { Map } from "ol";
import { writable } from "svelte/store";


export const mapStore = writable<Map>()