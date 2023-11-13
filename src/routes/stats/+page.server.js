import {db} from "$lib/db.js";
import { page } from '$app/stores';


/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
const players = await db.mickey_real_v_6.findMany({
});

const session = await event.locals.getSession();
const name = session.user.name;


const currentPlayer = await db.mickey_real_v_6.findMany({
  where:{
    player: name
  }
});


const winners = await db.mickey_real_v_6.findMany({
    
    where: {
      iswinner: "true",
    },
    orderBy: [
        { currentround: "asc" },
        {player:"asc"}
    ]
    
  });

return {players, winners, currentPlayer}
}
