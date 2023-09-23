import { redirect } from "@sveltejs/kit";
import {uuid} from "uuidv4";


export async function load({ cookies, url}) {
    if(!cookies.get("sessionID")){
        cookies.set("sessionID", uuid(), {path:"/", maxAge:60*60*2, httpOnly: false});
    }
    const sessionID = cookies.get("sessionID");
    return {sessionID};
};

export const actions = {
    endGame: async({request,url}) => {
        const gameData = await request.formData();
        const stats = gameData.get("stats");

        throw redirect(303, `/game/end?gameStats=${stats}&username=${user}`);
    }

}