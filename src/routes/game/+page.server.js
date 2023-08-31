export async function load({ cookies, url}) {

    return {};
};

export const actions = {
    endGame: async({request,url}) => {
        const gameData = await request.formData();
        const stats = gameData.get("stats");

        throw redirect(303, `/game/end?gameStats=${stats}&username=${user}`);
    }

}