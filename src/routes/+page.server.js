
import { redirect } from "@sveltejs/kit";
import {fail} from "@sveltejs/kit";
import {uuid} from "uuidv4";

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

        cookies.set("sessionID", uuid(), {path:"/", maxAge:60*60*2, httpOnly: false});
         
        throw redirect(303, `/game/?names=${names}`)
    }

}
