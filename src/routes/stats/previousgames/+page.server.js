import {db} from "$lib/db.js";



/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const gamesByGameID = {};

    const everything = await db.mickey_real_data_v_2.findMany({});
    const players = await db.mickey_real_data_v_2.findMany({
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


    return {gamesByGameID, players};
};