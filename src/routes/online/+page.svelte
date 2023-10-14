<script>
	import { onMount } from 'svelte';
	import * as Ably from 'ably';
	import { goto } from '$app/navigation';

	export let form;
	export let data;

	let pins = null;
	let roomPin = '';
	let joiningRoom = false;
	let creatingRoom = false;
	let numberOfRooms = 0;
	let pinToID = {};
	const validPins = new Set();

	onMount(() => {
		const ably = new Ably.Realtime.Promise({
			key: data.API_KEY,
			clientId: data.user || null
		});

		if (!localStorage.getItem('hits')) {
			localStorage.setItem(
				'hits',
				JSON.stringify({
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
				})
			);
		}

		pins = ably.channels.get('roomPins');

		pins.subscribe('new pin', (message) => {
			validPins.add(message.data.pin);
			pinToID[message.data.pin] = message.data.gameID;
			numberOfRooms = validPins.size;
		});
		pins.publish('get rooms', {});
		pins.subscribe('no players in room', (message) => {
			validPins.splice(validPins.indexOf(message.data.pin, 1));
		});

		return () => {
			pins.unsubscribe(pins);
			pins.detach();
		};
	});

	const update = (text) => {
		pins.presence.update(text);
	};

	function handleCreate() {
		creatingRoom = true;
		joiningRoom = false;
		window.localStorage.clear();
	}
	function handleJoin() {
		joiningRoom = true;
		creatingRoom = false;
		window.localStorage.clear();
	}
</script>

<div
	class="bg-black w-screen flex flex-col justify-center items-center text-white text-center mt-5"
>
	<h1
		class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-green-500 md:text-5xl lg:text-6xl"
	>
		Mickey Darts ✨Online✨
	</h1>
	<p class="mt-3 text-yellow-500">
		The rules are the same as always, but instead of using only one screen in pass and play mode,
		you can now play the same game on multiple devices. The only thing you have to do is create a
		room, and then share the pin with your friends, so they can join the fun 😊 <i
			>(You play by the order of which you join the game)</i
		>
	</p>
	{#if form?.error}
		<p class="text-red-500 mt-3">{form.message}!</p>
	{/if}
	<p class="mt-4 font-bold text-red-700">Currently active rooms: {numberOfRooms}</p>
</div>
<div class="w-screen bg-black flex flex-col justify-center items-center text-white mt-10">
	{#if joiningRoom}
		<div class="bg-white text-black rounded-xl">
			<form
				action="?/join"
				method="POST"
				class="flex flex-col justify-center items-center border p-5 rounded-xl shadow-2xl"
			>
				<p>Choose a username and enter room pin to join</p>
				<label class="m-2" for="room">Username:</label>
				<input class="m-2 p-2 border-black border rounded-md shadow-md" type="text" name="user" />

				<label class="m-2" for="room">Room Pin:</label>
				<input type="text" value={pinToID[roomPin]} hidden name="gameID" />
				<input
					class="m-2 p-2 border-black border rounded-md shadow-md"
					type="text"
					name="room"
					bind:value={roomPin}
				/>

				{#if roomPin.length >= 1 && validPins.has(roomPin)}
					<p class="text-green-600">Pin is valid</p>
					<button
						class="m-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
						type="submit">Join Room</button
					>
				{:else if roomPin.length >= 1}
					<p class="text-red-600">No active room with that pin</p>
				{/if}
			</form>
			<button class="ml-2 hover:underline text-md" on:click={() => (joiningRoom = false)}
				>Close</button
			>
		</div>
	{/if}
	{#if creatingRoom}
		<div class="bg-white text-black rounded-xl">
			<form
				action="?/create"
				method="POST"
				class="flex flex-col justify-center items-center border p-5 rounded-xl shadow-2xl"
			>
				<p>Choose a username</p>
				<label class="m-2" for="room">Username:</label>
				<input class="m-2 p-2 border-black border rounded-md shadow-md" type="text" name="user" />

				<button
					class="m-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
					type="submit">Create Room:</button
				>
			</form>
			<button class="ml-2 hover:underline text-md" on:click={() => (creatingRoom = false)}
				>Close</button
			>
		</div>
	{/if}
	{#if !creatingRoom && !joiningRoom}
		<button
			class="mb-4 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
			on:click={() => handleCreate()}>Create Room</button
		>
		<button
			class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
			on:click={() => handleJoin()}>Join Room</button
		>
		<button
			class="my-4 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3.5 py-1.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
			on:click={() => goto('/')}>Back Home</button
		>
	{/if}
</div>
