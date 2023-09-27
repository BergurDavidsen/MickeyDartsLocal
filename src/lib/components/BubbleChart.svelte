<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	export let mydata;

	let chartInstance;

	const colors = ['blue', 'red'];
	let currentColor = colors[Math.floor(Math.random() * colors.length)];

	onMount(() => {
		const ctx = document.getElementById('myChart').getContext('2d');
		chartInstance = new Chart(ctx, {
			type: 'bubble', // Specify the chart type (e.g., bar, line, pie, etc.)
			data: mydata,
			options: {
				scales: {
					y: {
						// will this create y-axis with days of week?
						type: 'category',
						labels: [
							'Bull',
							'Triple',
							'Double',
							'20',
							'19',
							'18',
							'17',
							'16',
							'15',
							'14',
							'13',
							'12'
						]
					}
				}
			}
		});
	});
</script>

<canvas id="myChart" class="bg-white rounded-md my-4 border-4 border-{currentColor}-600" />
