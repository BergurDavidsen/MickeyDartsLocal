
import { redirect } from "@sveltejs/kit";
import {fail} from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load({cookies}) {
    if(cookies.get("sessionID")){
        cookies.delete("sessionID");
    }
	return {}
}


export const actions = {

    create: async({request,url, cookies}) => {
        const data = await request.formData();
        const names = data.get("names").split(",");

        throw redirect(303, `/game/?names=${names}`)
    }

}
