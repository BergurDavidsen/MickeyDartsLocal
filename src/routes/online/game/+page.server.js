import { redirect } from "@sveltejs/kit";
import { API_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, url}) {
    if(!cookies.get("user")){
        throw redirect(303,"/online");
    }
    const roomPin = url.searchParams.get("room");
    const user = cookies.get("user")
    

    return {user, API_KEY, roomPin};
};

export const actions = {
    endGame: async({request,url}) => {
        const gameData = await request.formData();
        const user = gameData.get("username");
        const stats = gameData.get("stats");

        throw redirect(303, `/game/end?gameStats=${stats}&username=${user}`);
    }

}