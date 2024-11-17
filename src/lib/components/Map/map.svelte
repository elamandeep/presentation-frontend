<script lang="ts">
	import Map from 'ol/Map.js';
	import OSM from 'ol/source/OSM.js';
	import TileLayer from 'ol/layer/Tile.js';
	import View from 'ol/View.js';
	import { onMount, setContext } from 'svelte';
	import { mapStore } from '$lib/utils/store';
	import { XYZ } from 'ol/source';

	onMount(() => {
		const m = new Map({
			target: 'map',
			layers: [
				// new TileLayer({
				// 	source: new OSM()
				// }),
				new TileLayer({
					className: 'carto',
					source: new XYZ({
						url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png',
						attributions: '© <a href="https://carto.com/attributions">CARTO</a>'
					})
				})
			],
			view: new View({
				center: [83.98414352042391, 28.287161317322102],
				projection: 'EPSG:4326',
				zoom: 8
			}),
			controls: []
		});

		mapStore.set(m);
	});
</script>

<div class="w-full h-full" id="map"></div>
