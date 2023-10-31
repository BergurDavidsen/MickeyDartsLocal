<script>
	import BubbleChart from '../../../lib/components/BubbleChart.svelte';
	import { invalidateAll, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	/** @type {import('./$types').PageData} */
	export let data;

	let games = data.gamesByGameID;

	let allDatasets = data.allDatasets;
</script>

<div class="flex flex-col justify-center items-center text-center">
	<h1 class="my-4 font-bold text-5xl text-yellow-500 border-2 border-red-500 p-5 rounded-xl">
		Game History
	</h1>

	<a
		href="/stats"
		class="my-4 text-yellow-700 hover:text-white border border-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-yellow-500 dark:text-yellow-500 dark:hover:text-white dark:hover:bg-yellow-500 dark:focus:ring-yellow-800"
		>Back To Stats</a
	>
	{#if Object.keys(games).length < 1}
		<div class="flex flex-col justify-center items-center text-center my-20">
			<h1 class="text-red-500 text-4xl font-bold">No Games Played Yet</h1>
		</div>
	{:else}
		{#each allDatasets as dataset, index}
			<h1 class="mt-4 font-bold text-2xl text-green-500">
				Game Number {allDatasets.length - index}
			</h1>

			<h2 class=" font-bold text-sm text-red-500">
				<!-- Time: {games[Object.keys(games)[Object.keys(games).length - index - 1]][
					games[Object.keys(games)[Object.keys(games).length - index - 1]].length - 1
				]['validtime'].split('T')[1]} -->
				Time: {games[Object.keys(games)[index]][games[Object.keys(games)[index]].length - 1][
					'validtime'
				].split('T')[1]}
			</h2>
			<h2 class=" font-bold text-sm text-yellow-500">
				Date: {games[Object.keys(games)[index]][games[Object.keys(games)[index]].length - 1][
					'validtime'
				].split('T')[0]}
			</h2>
			<!-- <h2 class="font-bold text-xs text-blue-500">
				{Object.keys(games)[index]}
			</h2> -->
			<BubbleChart mydata={dataset} myID={Object.keys(games)[index]} />
		{/each}
	{/if}
</div>
