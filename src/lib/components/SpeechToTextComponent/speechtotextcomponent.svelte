<script lang="ts">
	import { api } from '$lib/utils/apiHandler';
	import { mapStore } from '$lib/utils/store';
	import VectorLayer from 'ol/layer/Vector';
	import VectorSource from 'ol/source/Vector';
	import GeoJSON from 'ol/format/GeoJSON';
	import { onMount } from 'svelte';
	import { InfoPanel } from '../InfoPanel/index';
	import Style from 'ol/style/Style';
	import Fill from 'ol/style/Fill';
	import Stroke from 'ol/style/Stroke';
	import Fuse from 'fuse.js';

	const provinces = [
		{ id: 1, name: 'Province No 1', alias: 'province 1' },
		{ id: 2, name: 'Province No 2', alias: 'province 2' },
		{ id: 3, name: 'Bagmati Pradesh', alias: 'bagmati' },
		{ id: 4, name: 'Gandaki Pradesh', alias: 'gandaki' },
		{ id: 5, name: 'Province No 5', alias: 'province 5' },
		{ id: 6, name: 'Karnali Pradesh', alias: 'karnali' },
		{ id: 7, name: 'Sudurpashchim Pradesh', alias: 'sudurpaschim' }
	];
	const vectorSource = new VectorSource();

	const outputText = (finalTranscript: string, interimTranscript: string) => {
		let temp1 = '';
		let temp2 = '';
		temp1 = finalTranscript;
		temp2 = interimTranscript;
		return temp1 + temp2;
	};

	let result = $state<{ [key: string]: any }>();
	let isLoading = $state(false);

	const fuse = new Fuse(provinces, {
		includeScore: true,
		threshold: 0.4 // Adjust sensitivity
	});

	const fetchProvince = async (provinceName: string) => {
		try {
			const response = await api.get(`/get_province?province_name=${provinceName}`);
			console.log(response.data);
			result = response.data;
			return response.data;
		} catch (error) {
			return error;
		}
	};

	function normalizeTranscript(transcript: string): string {
		return transcript
			.toLowerCase()
			.replace(/navigate|to|the|go|search|find|for/g, '') // Remove unnecessary filler words
			.trim();
	}

	function handleVoiceCommand(transcript: string) {
		let matchedProvince = null;
		let isActive = false;
		const lowerTranscript = transcript.toLowerCase();
		if (lowerTranscript.includes('jarvis')) {
			isActive = true;
			const normalizedTranscript = normalizeTranscript(transcript);
			console.log('Normalized transcript:', normalizedTranscript);

			for (const province of provinces) {
				// Dynamically create regex patterns for each province name and alias
				const regex = new RegExp(`\\b(${province.name}|${province.alias})\\b`, 'i');

				if (regex.test(normalizedTranscript)) {
					matchedProvince = province.name; // Save the matched province
					break;
				}
			}

			if (matchedProvince) {
				console.log(`Matched Province: ${matchedProvince}`);
				return { isActive, matchedProvince };
			} else {
				console.log('No matching province found.');
				return { isActive, matchedProvince };
			}
		}

		return { isActive, matchedProvince };
		// Add more commands as needed
	}

	onMount(() => {
		const outputDiv = document.getElementById('output') as HTMLInputElement;

		// @ts-ignore
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			console.error('Speech Recognition API not supported in this browser.');
			return;
		}

		// @ts-ignore
		const recognition = new SpeechRecognition();
		recognition.lang = 'en-US';
		recognition.continuous = true; // Keep listening continuously
		recognition.interimResults = true; // Capture live partial results for a smoother experience

		let finalTranscript = ''; // To store the final transcript

		recognition.onstart = () => {
			console.log('Listening...');
		};

		recognition.onresult = (event: { resultIndex: any; results: string | any[] }) => {
			let interimTranscript = '';

			for (let i = event.resultIndex; i < event.results.length; ++i) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					finalTranscript = transcript;
				} else {
					interimTranscript = transcript;
				}
			}

			let finalText = outputText(finalTranscript, interimTranscript);
			console.log(finalText.includes('jarvis'), finalText);
			let { isActive, matchedProvince } = handleVoiceCommand(finalText);

			if (isActive) {
				outputDiv!.value = finalText;
				console.log('province', matchedProvince);
				if (matchedProvince !== null) {
					fetchProvince(matchedProvince);

					alert(`navigating to ${matchedProvince}. Please wait`);

					matchedProvince = null;
				}
			}
			// Update input dynamically
		};

		recognition.onerror = (event: { error: any }) => {
			console.error('Speech recognition error detected: ', event.error);
		};

		recognition.onend = () => {
			console.log('Recognition ended, restarting...');
			recognition.start(); // Restart after it ends to keep it continuous
		};

		recognition.start();
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

				const polygonStyle = new Style({
					fill: new Fill({
						color: 'orange'
					}),
					stroke: new Stroke({
						color: 'orange',
						width: 2
					})
				});

				// Create a vector source

				const vectorLayer = new VectorLayer({
					source: vectorSource,
					style: polygonStyle
				});

				map.addLayer(vectorLayer);
				map.getView().fit(extent, { duration: 2000, maxZoom: 20 });
			}
		});
	});

	// onMount(() => {
</script>

<section class="fixed flex justify-center w-full items-center p-3 bottom-10 ml-10 mr-10 z-[99999]">
	<div class="bg-gray-200 rounded-md p-3 w-96 shadow-xl flex gap-2">
		<input
			type="text"
			id="output"
			name="output"
			class="bg-transparent outline-none w-full placeholder:text-gray-600"
			placeholder="Voice Search location"
		/>

		<div>
			<svg id="wave" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 640 512"
				><path
					class="fill-gray-700"
					d="M576 0c17.7 0 32 14.3 32 32l0 448c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-448c0-17.7 14.3-32 32-32zM448 96c17.7 0 32 14.3 32 32l0 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-352c0-17.7 14.3-32 32-32zM352 224l0 256c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32s32 14.3 32 32zM192 288c17.7 0 32 14.3 32 32l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160c0-17.7 14.3-32 32-32zM96 416l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32z"
				/></svg
			>
		</div>
	</div>
</section>

{#if result !== undefined}
	<!-- @ts-ignore -->
	<InfoPanel items={result.data?.items as any} />
{/if}
