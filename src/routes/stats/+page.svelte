<script>
	import BubbleChart from '../../lib/components/BubbleChart.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let hitPerRound = {};
	/** @type {import('./$types').PageData} */
	export let data;
	let hits = data.players;
	let datasets = [];

	let labels = [];

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

	let myData = {
		datasets: [
			{
				label: Object.keys(hitPerRound)[0].split(' ')[1],
				data: [
					{
						x: Object.keys(hitPerRound)[0].split(' ')[0],
						y: hitPerRound[Object.keys(hitPerRound)[0]][0],
						r: hitPerRound[Object.keys(hitPerRound)[0]][2]['20'] * 2
					}
				]
			}
		]
	};
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

<div class="flex flex-col justify-center items-center text-center my-3">
	<div class="border-2 border-white rounded-xl">
		<h1 class="text-white my-3 font-bold text-4xl">Player Stats</h1>
		<p class="text-white my-3 font-medium mx-2 text-lg">
			Here you can see live player stats for each round. <i
				>The bubbles are 2x the amount of hits on that specific part of the board. (If you are on
				mobile, go into landscape mode to see the full chart 😊 )</i
			>
		</p>
	</div>
	<BubbleChart mydata={myData} />
	<button
		on:click={() => goto('/')}
		class="m-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
		>Back To Start</button
	>
</div>
