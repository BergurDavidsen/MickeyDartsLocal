import { redirect } from "@sveltejs/kit";

export async function load({ cookies, url}) {
    if(!cookies.get("sessionID")){
        throw redirect(303, "/");
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