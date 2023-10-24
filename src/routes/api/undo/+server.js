import { json } from '@sveltejs/kit';
import {db} from "$lib/db.js";



/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {

    const {data} = await request.json();

    const gameID = data["gameID"];
    const player = data["player"];
    const hit = data["hit"];
   

    const itemCandidates = await db.mickey_real_data_v_4.findFirst({
        where:{
            gameid: gameID,
            player: player,
            hit: hit,
        },
        orderBy:{
            id:"desc"
        },
        take:1
        
     });

     console.log(itemCandidates);

    const deletedItem = await db.mickey_real_data_v_4.delete({
        where:{
            id:itemCandidates['id']
        }
    })
      
      console.log(`Deleted item: ${JSON.stringify(deletedItem)}`);
    
	return json(itemCandidates);
}