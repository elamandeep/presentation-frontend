<script lang="ts">
	import { api } from '$lib/utils/apiHandler';
	import { mapStore } from '$lib/utils/store';
	import GeoJSON from 'ol/format/GeoJSON';
	import VectorLayer from 'ol/layer/Vector';
	import VectorSource from 'ol/source/Vector';
	import Fill from 'ol/style/Fill';
	import Stroke from 'ol/style/Stroke';
	import Style from 'ol/style/Style';
	import { InfoPanel } from '../InfoPanel';
	import toast from 'svelte-french-toast';
	import Text from 'ol/style/Text';

	const vectorSource = new VectorSource();
	const provinces = [
		{ id: 1, value: 'Province No 1', name: 'Koshi Province' },
		{ id: 2, value: 'Province No 2', name: 'Madhesh Province' },
		{ id: 3, value: 'Bagmati Pradesh', name: 'Bagmati' },
		{ id: 4, value: 'Gandaki Pradesh', name: 'Gandaki' },
		{ id: 5, value: 'Province No 5', name: 'Lumbini Province' },
		{ id: 6, value: 'Karnali Pradesh', name: 'Karnali' },
		{ id: 7, value: 'Sudurpashchim Pradesh', name: 'Sudurpaschim' }
	];

	let selectedProvince = $state('default');

	let displayNameofProvince = $derived.by(() => {
		if (selectedProvince !== 'default') {
			let data = provinces.filter((province) => province.value === selectedProvince);
			return data[0].name;
		} else {
			return null;
		}
	});

	let result = $state<{ [key: string]: any }>();
	let infoResult = $state<Promise<any>>();
	const fetchProvince = async (provinceName: string) => {
		try {
			const response = await api.get(`/get_province?province_name=${provinceName}`);
			result = response.data;
			return response.data;
		} catch (error) {
			return error;
		}
	};

	$effect(() => {
		if (selectedProvince !== 'default') {
			let data = toast.promise(fetchProvince(selectedProvince), {
				loading: 'Loading...',
				success: 'Data Successfully Fetched from server...',
				error: 'Could not load data'
			});
			infoResult = data;

			console.log(data)
		}
	});

	$effect(() => {
		vectorSource.clear();

		mapStore.subscribe((map) => {
			if (result !== undefined) {
				//@ts-ignore
				let geojson = result.data.geojson;
				let features = new GeoJSON().readFeatures(geojson);
				vectorSource.addFeatures(features);
				// @ts-ignore
				const extent = features[0].getGeometry().getExtent();
				let text = new Text({
					//@ts-ignore
					text: displayNameofProvince,
					fill: new Fill({ color: '#002D62' }),
					font:"80px"
				});
				const polygonStyle = new Style({
					fill: new Fill({
						color: '#7CB9E8'
					}),
					stroke: new Stroke({
						color: '#002D62',
						width: 2
					}),
					text
				});

				// Create a vector source

				const vectorLayer = new VectorLayer({
					source: vectorSource,
					style: polygonStyle
				});

				map.addLayer(vectorLayer);
				map.getView().fit(extent, { duration: 2000, maxZoom: 10 });
			}
		});
	});
</script>

<section
	class="fixed z-[9999px] w-96 bottom-10 left-[35%] p-3 bg-gray-200 border border-gray-600 rounded-md"
>
	<select class="w-full" bind:value={selectedProvince}>
		<option value="default" disabled>Select Province</option>
		{#each provinces as { id, value, name }}
			<option {value}>{name}</option>
		{/each}
	</select>
</section>

<InfoPanel {infoResult} {displayNameofProvince} />
