<script lang="ts">
	import type { ItemsType } from '$lib/types';
	import { ImageArcGISRest } from 'ol/source';
    import { slide } from 'svelte/transition';

	const { infoResult, displayNameofProvince }: ItemsType = $props();
</script>

<section

	class="bg-gray-200 shadow-lg border border-gray-600 fixed right-10 top-10 z-[9999] gap-2 p-6 rounded-md"
>
	{#if infoResult !== undefined}
		{#await infoResult}
			<!-- promise is pending -->

			
                <div in:slide out:slide class="animate-pulse flex flex-col space-x-4 w-96">
                  
                  <div class="flex-1 space-y-6 py-1">
                    <div class="h-10 bg-gray-400 rounded "></div>
                    <div class="space-y-3">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="h-44 w-44 bg-gray-400 rounded col-span-1"></div>
                        <div class="h-44 w-44 bg-gray-400 rounded col-span-1"></div>
                        <div class="h-44 w-44 bg-gray-400 rounded col-span-1"></div>
                        <div class="h-44 w-44 bg-gray-400 rounded col-span-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
        
		{:then value}
			<div class="flex flex-col items-center gap-6">
				<h1 class="text-xl font-semibold">Popular places in {displayNameofProvince}</h1>

				<div class="grid grid-cols-2 grid-flow-row gap-2">
					{#each value.data.items as item}
						<div class="bg-gray-100 rounded-md p-3 gap-2 flex flex-col items-center justify-start">
							<h1 class="font-semibold">{item.item_name}</h1>

							<figure class="w-44">
								<img src={item.img_url} alt={item.item_name}>
							</figure>
						</div>
					{/each}
				</div>
			</div>
		{:catch error}
			<!-- promise was rejected -->
			<p>Something went wrong: {error.message}</p>
		{/await}
	{/if}
</section>
