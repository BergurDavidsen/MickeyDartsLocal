<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	export let data;

	const sessioId = data.sessionID;

	const colorScore = {
		0: 'red-500',
		1: 'yellow-400',
		2: 'yellow-400',
		'Done!': 'green-400'
	};
	let turnIndex = 0;
	const finished = 'Done!';
	let roundCounter = 1;
	let players = {};
	let player;
	let numbers;
	let tableNumbers;
	let winners = [];
	let wantsToRestart = false;

	const url =
		'https://webhook.api.flowcore.io/event/bergurdavidsen/23439fd6-4219-4ea3-be35-1378f34fb680/create/push-data?key=bf6490d7-f36d-45b8-b87e-1d437bd210f1';

	onMount(() => {
		let playerNames = $page.url.searchParams.get('names');
		playerNames = playerNames.split(',');

		if (browser) {
			const localStorageState = window.localStorage.getItem('state');
			const localStorageRound = window.localStorage.getItem('currentRound');
			const localStorageTurn = window.localStorage.getItem('turnIndex');

			if (localStorageState) {
				players = JSON.parse(localStorageState);

				if (localStorageRound) {
					roundCounter = JSON.parse(localStorageRound);
				}
				if (localStorageTurn) {
					turnIndex = JSON.parse(localStorageTurn);
				}
			} else {
				for (let i = 0; i < playerNames.length; i++) {
					playerNames[i] = playerNames[i].trim();

					players[playerNames[i]] = {
						'20': 0,
						'19': 0,
						'18': 0,
						'17': 0,
						'16': 0,
						'15': 0,
						'14': 0,
						'13': 0,
						'12': 0,
						Double: 0,
						Triple: 0,
						Bull: 0,
						score: 0
					};
				}
			}
		}
		player = Object.keys(players)[turnIndex];

		tableNumbers = Object.keys({
			'20': 0,
			'19': 0,
			'18': 0,
			'17': 0,
			'16': 0,
			'15': 0,
			'14': 0,
			'13': 0,
			'12': 0,
			Double: 0,
			Triple: 0,
			Bull: 0,
			score: 0
		}).reverse();
		numbers = Object.keys(players[player]).reverse();
	});
	async function postDataToDatabase(data) {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: data
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			return response;
		} catch (error) {
			console.error('Error sending data:', error);
			throw error; // Re-throw the error to propagate it further if needed
		}
	}
	function handleClick(key) {
		if (players[player][key] == finished) return;

		if (players[player][key] < 3) {
			players[player][key] += 1;
			players[player]['score'] += 1;
		}

		if (players[player][key] > 2) {
			players[player][key] = finished;
			checkWinner();
		}
		if (browser) {
			window.localStorage.setItem('state', JSON.stringify(players));
		}
		let dataMessage = JSON.stringify({
			gameID: sessioId,
			player: player.toUpperCase(),
			hit: key,
			currentRound: roundCounter,
			isWinner: winners.includes(player)
		});
		postDataToDatabase(dataMessage);
	}

	function undo(key) {
		if (players[player][key] == 0) return;

		if (players[player][key] < 3) {
			players[player][key] -= 1;
			players[player]['score'] -= 1;
			window.localStorage.setItem('state', JSON.stringify(players));
		}
		if (players[player][key] == finished) {
			players[player][key] = 2;
			players[player]['score'] -= 1;
			window.localStorage.setItem('state', JSON.stringify(players));
		}
	}
	function passTurn() {
		turnIndex = (turnIndex + 1) % Object.keys(players).length;
		player = Object.keys(players)[turnIndex];
		if (browser) {
			window.localStorage.setItem('turnIndex', JSON.stringify(turnIndex));
		}

		if (turnIndex == 0) {
			roundCounter += 1;
			if (browser) {
				window.localStorage.setItem('currentRound', JSON.stringify(roundCounter));
			}
		}
	}
	function checkWinner() {
		for (let key of numbers.slice(1)) {
			if (players[player][key] != finished) {
				return;
			}
		}
		if (!winners.includes(player)) {
			winners.push(player);
		}
	}
	function restartGame() {
		if (browser) {
			window.localStorage.clear();
			window.location.reload();
		}
	}
</script>

{#if tableNumbers}
	<div class="mx-2 flex flex-col justify-center items-center">
		<table class="bg-white mt-2 text-center">
			<tr>
				<th class="border border-white text-white p-2 bg-black capitalize">Targets</th>
				{#each Object.keys(players) as players}
					<th class="border border-white bg-black text-white p-2 capitalize"
						>{winners.includes(players) ? players + ' is done!' : players}
					</th>
				{/each}
			</tr>
			{#each tableNumbers as number}
				<tr>
					<td class="border border-white bg-black text-white capitalize">{number}</td>
					{#each Object.keys(players) as player}
						{#if number == 'score'}
							<td class="border border-white bg-black text-white">{players[player][number]}/36</td>
						{:else}
							<td class="border border-black text-white bg-{colorScore[players[player][number]]}"
								>{players[player][number]}</td
							>
						{/if}
					{/each}
				</tr>
			{/each}
		</table>
	</div>
{/if}

{#if players[player]}
	<div class="flex flex-col justify-center items-center text-white my-2">
		<p class="font-bold text-xl">Round {roundCounter}</p>
		<div class="text-center justify-center items-center text-white my-4">
			<p class="">It's {player}'s turn</p>
			<button
				class=" my-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-2xl text-sm px-5 py-2.5 text-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800"
				on:click={() => passTurn()}
			>
				Pass turn
			</button>
		</div>
		{#each numbers.slice(1) as key}
			<div class="text-white">
				<button
					on:click={() => handleClick(key)}
					name={key}
					class="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
					>{key}</button
				>
				<label class="m-1" for={key}>{players[player][key]}</label>
				<button
					on:click={() => undo(key)}
					class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
					>undo</button
				>
			</div>
		{/each}
	</div>
{/if}
<div class="flex flex-col justify-center items-center">
	<button
		on:click={() => (wantsToRestart = !wantsToRestart)}
		class="text-white bg-yellow-700 hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
		>{wantsToRestart ? 'Cancel' : 'Restart?'}
	</button>
	{#if wantsToRestart}
		<button
			on:click={() => restartGame()}
			class="text-white bg-yellow-700 hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
			>Confirm</button
		>
	{/if}
</div>
<!-- class=" mb-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-2xl text-sm px-5 py-2.5 text-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" -->
<!-- class="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" -->
<!-- class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" -->
