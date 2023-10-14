<script>
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let form;

	let players = [];
	let playerName = '';
	let creatingRoom = false;

	function handleCreate() {
		creatingRoom = true;
		if (browser) {
			localStorage.clear();
		}
	}
	function addPlayer() {
		players.push(playerName);
		playerName = '';
	}
</script>

<div
	class="bg-black w-screen flex flex-col justify-center items-center text-white text-center mt-5"
>
	<h1
		class="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl text-green-600"
	>
		Welcome to Mickey <br /> (The Dart Game)
	</h1>
	<p class="mt-3 text-yellow-500">
		Your aim is to close out the numbers from twelve to twenty, along with three doubles, triples,
		and the bullseye. Players take turns throwing three darts each. Close out a number by hitting it
		three times. Hits don't have to be in the same round.
	</p>
	{#if form?.error}
		<p class="text-red-500 mt-3">{form.message}!</p>
	{/if}
</div>
<div class="w-screen bg-black flex flex-col justify-center items-center text-white mt-10">
	{#if creatingRoom}
		<div class="bg-white text-black rounded-xl">
			<form
				action="?/create"
				method="POST"
				class="flex flex-col justify-center items-center border p-5 rounded-xl shadow-2xl"
			>
				<label for="names">Add each player seperated by ","</label>
				<input
					class="border rounded-md p-2 border-black hover:border-blue-400"
					type="text"
					name="names"
					bind:value={playerName}
				/>

				<button
					class="m-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
					type="submit">Start Game</button
				>
			</form>
			<button class="ml-2 hover:underline text-md" on:click={() => (creatingRoom = false)}
				>Close</button
			>
		</div>
	{/if}
	{#if !creatingRoom}
		<button
			class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
			on:click={() => handleCreate()}>Create Game (Pass and play)</button
		>
	{/if}
</div>
<div class="flex flex-col items-center justify-center my-4">
	<button
		class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
		on:click={() => goto('/online/')}
	>
		Online (Beta)
	</button>
</div>

<div class="flex flex-col items-center justify-center my-4">
	<button
		class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
		on:click={() => goto('/stats')}
	>
		Stats
	</button>
</div>
