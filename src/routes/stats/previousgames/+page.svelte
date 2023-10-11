<script>
	import { BubbleController } from 'chart.js';
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
					r: hitPerRound[key][hitPerRound[key].length - 1][yPos] * 2
				});
			}

			datasets[label].data.push(...dataPoints);
		}

		myData = { datasets: Object.values(datasets) }; // Convert the object to an array of datasets

		allDatasets.push(myData);
	}
</script>

{#if Object.keys(games).length < 1}
	<div class="flex flex-col justify-center items-center text-center h-screen">
		<h1 class="text-white text-4xl font-bold">No Games Played Yet</h1>
	</div>
{/if}

<div class="flex flex-col justify-center items-center text-center">
	{#each allDatasets.reverse() as dataset, index}
		<h1 class="mt-4 font-bold text-4xl text-white">Game Number {allDatasets.length - index}</h1>
		<h2 class=" font-bold text-sm text-white">Game Info</h2>
		<h2 class=" font-bold text-sm text-white">
			Time: {games[Object.keys(games)[Object.keys(games).length - index - 1]][
				games[Object.keys(games)[Object.keys(games).length - index - 1]].length - 1
			]['validtime'].split('T')[1]}
		</h2>
		<h2 class=" font-bold text-sm text-white">
			Date: {games[Object.keys(games)[Object.keys(games).length - index - 1]][
				games[Object.keys(games)[Object.keys(games).length - index - 1]].length - 1
			]['validtime'].split('T')[0]}
		</h2>
		<BubbleChart mydata={dataset} myID={Object.keys(games)[index]} />
	{/each}
</div>
