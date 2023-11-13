import { json } from '@sveltejs/kit';
import {db} from "$lib/db.js";

/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    const {gameID} = await request.json();  
    
    const itemCandidates = await db.mickey_real_v_6.deleteMany({
        where:{
            gameid: gameID,
            
        }
    });

    console.log("Deleted item: "+JSON.stringify(itemCandidates));


    return json(gameID);
};