import { redirect } from "@sveltejs/kit";
import {fail} from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
   
}


export const actions = {

    create: async({request,url, cookies}) => {
        const data = await request.formData();
        const names = data.get("names").split(",");
        if(cookies.get("sessionID")){
            cookies.delete("sessionID");
        }

        throw redirect(303, `/game/?names=${names}`)
    }

}
