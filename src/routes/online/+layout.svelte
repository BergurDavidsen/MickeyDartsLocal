<script>
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
</script>

<!-- 
<div class="flex flex-row justify-between items-center w-full text-white my-2">
	{#if $page.data.session?.user}
		<p class="text-left text-yellow-400">Hello <strong>{$page.data.session.user.name}</strong></p>
		<button
			on:click={signOut}
			class="border-2 border-red-500 px-3 rounded-xl mx-2 hover:border-red-300 hover:bg-gray-600 hover:font-bold"
			>Sign out</button
		>
	{:else}
		<p class="text-left">Not signed in.</p>
		<button on:click={() => signIn('google')}>Sign in</button>
	{/if}
</div> -->

<slot />
