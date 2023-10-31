import {db} from "$lib/db.js";
import { json } from '@sveltejs/kit';


/** @type {import('./$types').RequestHandler} */
export async function GET() {
    const gamesByGameID = {};
    
    const everything = await db.mickey_real_data_v_4.findMany({
        orderBy:[
            {id:"desc"}
        ]
    });
    const players = await db.mickey_real_data_v_4.findMany({
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

    return json({gamesByID: gamesByGameID, players: players})
};