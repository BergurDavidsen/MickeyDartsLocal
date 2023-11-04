import {db} from "$lib/db.js";


/** @type {import('./$types').PageServerLoad} */
export async function load() {
const players = await db.mickey_real_v_6.findMany({
    
   
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


  

return {players, winners}

}
