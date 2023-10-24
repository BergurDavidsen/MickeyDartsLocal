<script>
	import { goto } from '$app/navigation';
	import BubbleChart from '../../../lib/components/BubbleChart.svelte';
	/** @type {import('./$types').PageData} */
	export let data;

	const games = data.gamesByGameID;
	const allPlayers = data.players;

	let allDatasets = [];
	let playerToColor = {};

	function getRandomRGB() {
		const r = Math.floor(Math.random() * 256); // Random value between 0 and 255 for red
		const g = Math.floor(Math.random() * 256); // Random value between 0 and 255 for green
		const b = Math.floor(Math.random() * 256); // Random value between 0 and 255 for blue
		return `rgb(${r}, ${g}, ${b}, 0.4)`; // Return the RGB color as a string
	}

	for (let player of allPlayers) {
		playerToColor[player['player']] = getRandomRGB();
	}
	for (let game of Object.keys(games)) {
		let hitPerRound = {};
		let datasets = [];

		for (let player of games[game]) {
			hitPerRound[player['currentround'] + ' ' + player['player']] = [];
		}
		for (let player of games[game]) {
			hitPerRound[player['currentround'] + ' ' + player['player']].push(player['hit']);
		}

		let counter = {};
		for (let roundHit of Object.values(hitPerRound)) {
			roundHit.forEach((element) => {
				if (counter[element]) {
					counter[element] += 1;
				} else {
					counter[element] = 1;
				}
			});

			roundHit.push(counter);
			counter = {};
		}
		let myData = {};

		for (let key of Object.keys(hitPerRound)) {
			const label = key.split(' ')[1]; // Extract the label from the key

			if (!datasets[label]) {
				// If the label doesn't exist in the datasets, create a new dataset
				datasets[label] = {
					label,
					data: [],
					backgroundColor: playerToColor[label]
				};
			}

			const dataPoints = [];

			for (let yPos of hitPerRound[key]) {
				// Convert yPos to a number if needed
				dataPoints.push({
					x: key.split(' ')[0],
					y: yPos,
					r: hitPerRound[key][hitPerRound[key].length - 1][yPos] * 3
				});
			}

			datasets[label].data.push(...dataPoints);
		}

		myData = { datasets: Object.values(datasets) }; // Convert the object to an array of datasets

		allDatasets.push(myData);
	}
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
