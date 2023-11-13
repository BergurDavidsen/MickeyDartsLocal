import {db} from "$lib/db.js";



/** @type {import('./$types').PageServerLoad} */
export async function load({depends}) {
    const gamesByGameID = {};
    let allDatasets = [];
    const playerToColor = {};
    
    


    const everything = await db.mickey_real_v_6.findMany({
        orderBy:[
            {id:"desc"}
        ]
    });
    const players = await db.mickey_real_v_6.findMany({
        distinct:["player"],
        select:{
            player:true
        }
    })
    

    for(let data of everything){
        let gameID = data["gameid"]
        if(Object.keys(gamesByGameID).includes(gameID)){
            gamesByGameID[gameID].push(data);
        }
        else{
            gamesByGameID[gameID] = [];
            gamesByGameID[gameID].push(data);
        }
    }

	function getRandomRGB() {
		const r = Math.floor(Math.random() * 256); // Random value between 0 and 255 for red
		const g = Math.floor(Math.random() * 256); // Random value between 0 and 255 for green
		const b = Math.floor(Math.random() * 256); // Random value between 0 and 255 for blue
		return `rgb(${r}, ${g}, ${b}, 0.4)`; // Return the RGB color as a string
	}

	for (let player of players) {
		playerToColor[player['player']] = getRandomRGB();
	}

	for (let game of Object.keys(gamesByGameID)) {
		let hitPerRound = {};
		let datasets = [];

		for (let player of gamesByGameID[game]) {
			hitPerRound[player['currentround'] + ' ' + player['player']] = [];
		}
		for (let player of gamesByGameID[game]) {
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

    depends("app:reload")

    

    return {gamesByGameID, players, allDatasets};
};