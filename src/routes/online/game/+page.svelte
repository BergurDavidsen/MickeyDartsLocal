<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as Ably from 'ably';
	import { browser } from '$app/environment';

	/** @type {import('./$types').PageData} */
	export let data;

	const roomPin = data.roomPin;
	const ably = data.ably;
	const finished = 'Done!';
	let isWinner = false;
	let lastRound = null;
	let users = [];
	let winners = [];
	let scores = {};
	let channel = null;
	let pins = null;
	let currentTurn = 0;
	let roundCounter = 1;
	let roundNumbers = [1];
	let isStarted = true;
	let statsForAllRounds = {};
	let hitsForRound = [];
	let currentPlayer = null;
	let startCounter = 0;
	let order = [];
	let gone = [];
	let wantsToRestart = false;

	let hits = {
		Double: 0,
		Triple: 0,
		Bull: 0,
		'20': 0,
		'19': 0,
		'18': 0,
		'17': 0,
		'16': 0,
		'15': 0,
		'14': 0,
		'13': 0,
		'12': 0
	};
	if (browser) {
		let localHits = window.localStorage.getItem('hits');
		let localPlayer = window.localStorage.getItem('currentPlayer');
		let localStorageRound = window.localStorage.getItem('roundCounter');
		let localOrder = window.localStorage.getItem('playerOrder');
		let localGone = window.localStorage.getItem('playersGone');

		if (localHits) {
			hits = JSON.parse(localHits);
		}
		if (localPlayer) {
			currentPlayer = JSON.parse(localPlayer);
			currentTurn = JSON.parse(window.localStorage.getItem('currentTurn'));
			console.log(currentPlayer, currentTurn);
		}

		if (localStorageRound) {
			roundCounter = JSON.parse(localStorageRound);
		}
		if (localOrder) {
			order = JSON.parse(localOrder);
		}
		if (localGone) {
			gone = JSON.parse(localGone);
		}
	}

	let numbers = Object.keys(hits).reverse();

	onMount(() => {
		const ably = new Ably.Realtime.Promise({
			key: data.API_KEY,
			clientId: data.user
		});

		channel = ably.channels.get(roomPin);
		pins = ably.channels.get('roomPins');
		pins.publish('new pin', { pin: roomPin });
		pins.subscribe('get rooms', (message) => {
			pins.publish('new pin', { pin: roomPin });
		});

		channel.subscribe('update score', (message) => {
			scores[message.data.user] = message.data.score;
		});

		channel.subscribe('update game state', (message) => {
			if (message.data.round > roundCounter) {
				roundCounter = message.data.round;
			}
			currentPlayer = message.data.currentPlayer;
			currentTurn = message.data.currentTurn;
			startCounter = message.data.startCounter;
			gone = message.data.gone;
			order = message.data.order;
		});

		// channel.subscribe('update round counter', (message) => {
		// 	roundNumbers = message.data.rounds;
		// 	roundCounter = roundNumbers[0];
		// });

		channel.subscribe('join game', async (message) => {
			users = await channel.presence.get();
			for (const user of users) {
				scores[user.clientId] = message.data.score;
				if (!order.includes(user.clientId)) {
					order.push(user.clientId);
				}
				if (gone.includes(user.clientId)) {
					gone.splice(gone.indexOf(user.clientId), 1);
				}
			}
			window.localStorage.setItem('playerOrder', JSON.stringify(order));
			window.localStorage.setItem('playersGone', JSON.stringify(gone));
			console.log('player order: ' + order);
			console.log('players gone: ' + gone);

			channel.publish('update game state', {
				currentPlayer: currentPlayer,
				round: roundCounter,
				currentTurn: currentTurn,
				startCounter: 1,
				order: order,
				gone: gone
			});

			channel.publish('get player order', {});

			channel.publish('update score', { score: hits, user: data.user });
		});

		channel.subscribe('user left room', (message) => {
			delete scores[message.data.user];
			if (!gone.includes(message.data.user)) {
				gone.push(message.data.user);
			}
			console.log(gone);
			window.localStorage.setItem('playersGone', JSON.stringify(gone));
			scores = scores;
		});

		channel.subscribe('winner found', (message) => {
			if (!winners.includes(message.data.user)) {
				winners.push(message.data.user);
			}

			console.log(winners);
		});

		channel.subscribe('pass turn', (message) => {
			if (startCounter < 1) {
				currentPlayer = order[currentTurn];
				startCounter = 1;
			} else {
				console.log(currentTurn);
				currentTurn = (currentTurn + 1) % order.length;
				console.log(currentTurn);

				currentPlayer = order[currentTurn];
				if (currentTurn == 0) {
					roundCounter++;
				}
				while (gone.includes(currentPlayer)) {
					currentTurn = (currentTurn + 1) % order.length;
					currentPlayer = order[currentTurn];
					if (currentTurn == 0) {
						roundCounter++;
					}
				}
			}

			if (currentTurn == NaN) {
				currentTurn = 0;
			}
			window.localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
			window.localStorage.setItem('currentTurn', JSON.stringify(currentTurn));
			window.localStorage.setItem('roundCounter', JSON.stringify(roundCounter));
			roundNumbers.unshift(roundCounter);
			channel.publish('update round counter', { rounds: roundNumbers });
			console.log(roundNumbers);
			console.log(currentTurn);
			console.log(currentPlayer);
		});

		channel.subscribe('restart game', () => {
			window.localStorage.clear();
			window.location.reload();
		});

		const updatePresence = async () => {
			users = await channel.presence.get();
		};

		(async () => {
			channel.presence.subscribe('enter', (member) => {
				channel.publish('join game', { user: member.clientId, score: hits });
				scores = scores;
				updatePresence;
			});
			channel.presence.subscribe('update', updatePresence);
			channel.presence.subscribe('leave', async (member) => {
				console.log(`${member.clientId} left the room.`);
				channel.publish('user left room', { user: member.clientId });
			});

			await channel.presence.enter('');
			users = await channel.presence.get();
		})();

		return () => {
			channel.presence.leave();
			channel.presence.unsubscribe('enter');
			channel.presence.unsubscribe('leave');
			channel.presence.unsubscribe('update');
			users = [];

			channel.unsubscribe(channel);
			channel.unsubscribe(pins);
			channel.detach();
		};
	});

	function handleClick(key) {
		if (!(currentPlayer == data.user || order[currentTurn] == data.user)) return;
		if (hits[key] == finished) return;

		hitsForRound.push(key);
		console.log(hitsForRound);
		if (hits[key] < 3) {
			hits[key] = hits[key] + 1;
		}
		if (hits[key] == 3) {
			hits[key] = finished;
			checkIfWinner();
		}
		window.localStorage.setItem('hits', JSON.stringify(hits));
		channel.publish('update score', { score: hits, user: data.user });
	}

	function undo(key) {
		if (!(currentPlayer == data.user || order[currentTurn] == data.user)) return;

		if (hits[key] > 0) {
			hits[key]--;
			hitsForRound.pop();
		}

		if (hits[key] == finished) {
			hits[key] = 2;
			hitsForRound.pop();
		}
		window.localStorage.setItem('hits', JSON.stringify(hits));
		channel.publish('update score', { score: hits, user: data.user });
	}

	function passTurn() {
		if (!isStarted) isStarted = true;
		channel.publish('pass turn', { user: data.user });
		statsForAllRounds[roundCounter] = hitsForRound;
		hitsForRound = [];
	}

	function checkIfWinner() {
		let values = Object.values(hits);
		for (let index = 0; index < values.length; index++) {
			if (values[index] != finished) {
				return;
			}
		}
		lastRound = roundCounter;
		isWinner = true;
		channel.publish('winner found', { user: data.user });
	}
</script>

<h1 class="text-white font-bold">Room pin: {roomPin}</h1>
<h1 class="text-white font-bold">Username: {data.user}</h1>

<div class="flex flex-col justify-center items-center text-black">
	<table class="rounded-md shadow-lg m-2">
		<tr>
			<th class="p-2 border border-white bg-gray-300">Numbers</th>
			{#each Object.keys(scores) as player}
				<th class="p-2 capitalize border border-white bg-gray-300">
					{winners.includes(player) ? player + ' is done!' : player}
				</th>
			{/each}
		</tr>
		{#each numbers as number}
			<tr>
				<td class="border border-black bg-white text-center">{number}</td>

				{#each Object.keys(scores) as key}
					<td class="border border-black bg-white text-center">{scores[key][number]}</td>
				{/each}
			</tr>
		{/each}
	</table>
</div>

<div class="flex flex-col justify-center items-center text-white text-center">
	{#if isWinner}
		<p>You WON! It took you {lastRound} rounds!</p>

		<button
			class=" mb-2 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-2xl text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-800"
			on:click={() => {
				window.localStorage.clear();
				goto('/');
			}}>End Game <i>(Back to home page)</i></button
		>
	{/if}
	<p>
		{currentPlayer ? 'Its ' + currentPlayer + "'s turn" : order[currentTurn]}
	</p>
	<p class="text-2xl font-bold">Round: {roundCounter}</p>
	{#if roundCounter < 2}
		<p class="my-2">
			<i>Everyone has to press once for the round number to change </i>
		</p>
	{/if}
</div>

<div class="flex flex-col justify-center items-center text-white">
	<button
		class=" mb-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-2xl text-sm px-5 py-2.5 text-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800"
		on:click={() => passTurn()}
	>
		{startCounter < 1 ? 'Start Game' : 'Pass turn '}
	</button>
</div>

<div class="flex flex-col justify-center items-center text-white">
	{#if data.user == currentPlayer || data.user == order[currentTurn]}
		{#each numbers as key}
			<div class="text-white">
				<button
					on:click={() => handleClick(key)}
					name={key}
					class="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
					>{key}</button
				>
				<label class="m-1" for={key}>{hits[key]}</label>
				<button
					on:click={() => undo(key)}
					class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
				>
					undo
				</button>
			</div>
		{/each}
	{:else}
		<p class="my-10">Wait until your turn</p>
	{/if}
	<button
		on:click={() => (wantsToRestart = !wantsToRestart)}
		class="text-white bg-yellow-700 hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
		>{wantsToRestart ? 'Cancel' : 'Restart?'}
	</button>
	{#if wantsToRestart}
		<button
			on:click={() => channel.publish('restart game', {})}
			class="text-white bg-yellow-700 hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
			>Confirm</button
		>
	{/if}
</div>
