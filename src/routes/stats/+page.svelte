<script>
	import BubbleChart from '../../lib/components/BubbleChart.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let hitPerRound = {};
	/** @type {import('./$types').PageData} */
	export let data;
	let hits = data.players;
	const winners = data.winners;

	let datasets = [];
	let winCounts = {};
	for (let winner of winners) {
		if (Object.keys(winCounts).includes(winner['player'])) {
			winCounts[winner['player']] = winCounts[winner['player']] + 1;
		} else {
			winCounts[winner['player']] = 1;
		}
	}

	const sortedWinners = Object.fromEntries(
		Object.entries(winCounts).sort((a, b) => {
			if (b[1] - a[1] === 0) {
				return a[0].localeCompare(b[0]);
			}
			return b[1] - a[1];
		})
	);
	console.log(sortedWinners);
	function getRandomRGB() {
		const r = Math.floor(Math.random() * 256); // Random value between 0 and 255 for red
		const g = Math.floor(Math.random() * 256); // Random value between 0 and 255 for green
		const b = Math.floor(Math.random() * 256); // Random value between 0 and 255 for blue
		return `rgb(${r}, ${g}, ${b}, 0.4)`; // Return the RGB color as a string
	}
	function sortObjectKeysByRoundNumber(obj) {
		// Get the keys of the object
		const keys = Object.keys(obj);

		// Sort the keys based on the round number
		keys.sort((a, b) => {
			const roundA = parseInt(a.split(' ')[0]);
			const roundB = parseInt(b.split(' ')[0]);
			return roundA - roundB;
		});

		// Return the sorted keys
		return keys;
	}
	// onMount(() => {
	// 	setInterval(() => {
	// 		window.location.reload();
	// 	}, 15 * 1000);
	// });

	const playerToColor = {};

	for (let player of hits) {
		playerToColor[player['player']] = getRandomRGB();
	}

	// Example usage:
	const randomColor = getRandomRGB();

	for (let player of hits) {
		hitPerRound[player['currentround'] + ' ' + player['player']] = [];
	}

	for (let player of hits) {
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
	const keys = sortObjectKeysByRoundNumber(hitPerRound);
	for (let key of keys) {
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
</script>

<div class="flex flex-col justify-center items-center text-center my-3 bg-black">
	<div class="border-2 border-red-500 rounded-xl bg-black mb-5">
		<h1 class="text-green-500 my-3 font-bold text-4xl">Player Stats</h1>
		<p class="text-yellow-500 my-3 font-medium mx-2 text-lg">
			Here you can see live player stats for each round. <i
				>The bubbles are 2x the amount of hits on that specific part of the board. (If you are on
				mobile, go into landscape mode to see the full chart 😊 )</i
			>
		</p>
	</div>
	<h1 class="text-green-500 text-4xl font-bold mt-4">All Time Stats</h1>
	{#if hits.length < 1}
		<h2 class="my-10 text-red-500 font-bold text-2xl">No Stats Yet</h2>
	{:else}
		<BubbleChart mydata={myData} myID={'allPlayers'} />
	{/if}
	<h1 class="text-green-500 text-4xl font-bold mt-4">Leaderboards</h1>
	{#if winners.length > 0}
		<table class="table-auto w-full bg-white rounded-xl text-center my-4">
			<caption class="text-yellow-500 mb-4 font-bold text-2xl">Fastest win</caption>
			<thead>
				<th class="p-3 border-r">Position</th>
				<th class="p-3">Player</th>
				<th class="p-3 border-l">Finish round</th>
			</thead>
			<tbody>
				{#each winners as winner, index}
					<tr class="border-t rounded-sm">
						<td class="p-3 border-r">{index + 1}</td>
						<td class="p-3">{winner['player']}</td>
						<td class=" border-l">{winner['currentround']}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<table class="table-auto w-full bg-white rounded-xl text-center my-4">
			<caption class="text-yellow-500 mb-4 font-bold text-2xl">Most wins</caption>
			<thead class="">
				<th class="p-3 border-r">Position</th>
				<th class="p-3">Player</th>
				<th class="p-3 border-l">Total Wins</th>
			</thead>
			<tbody>
				{#each Object.keys(sortedWinners) as winner, index}
					<tr class="border-t rounded-sm">
						<td class="p-4 border-r">{index + 1}</td>
						<td class="p-4">{winner}</td>
						<td class="p-4 border-l">{sortedWinners[winner]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<h1 class="my-10 text-red-500 font-bold text-2xl">No winners Yet</h1>
	{/if}
	<div class="flex flex-col justify-center items-center">
		<button
			on:click={() => goto('/stats/previousgames')}
			class="mb-7 text-orange-700 hover:text-white border border-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:border-orange-500 dark:text-orange-500 dark:hover:text-white dark:hover:bg-orange-500 dark:focus:ring-orange-800"
			>See all games</button
		>

		<button
			on:click={() => goto('/')}
			class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
			>Back To Start</button
		>
	</div>
</div>
