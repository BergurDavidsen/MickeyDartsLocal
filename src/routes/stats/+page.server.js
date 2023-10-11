import {db} from "$lib/db.js";

/** @type {import('./$types').PageServerLoad} */
export async function load() {

const players = db.mickey_real_data_v_2.findMany({
    
    
});
const winners = db.mickey_real_data_v_2.findMany({
    where: {
      iswinner: "true",
    },
    orderBy: [
    
        { currentround: "asc" },
        { player: "asc" },
    ],
  });
return {players, winners}

}
export const actions = {
    getdata: async({request}) => {
        console.log("yees");
        try{
            
            const data = await request.formData();
            
            const playerName = data.get('name');
            
            const player = await db.mickey_dummy_data_round.findMany({
                where: {name: playerName.toUpper()}
            });
            console.log(playerName);

            return {data: player}
        }
        catch(error){
            console.log(error);
            return fail(500, {error:true})
        }
    }
}
