import { API_KEY } from '$env/static/private';
import { redirect } from "@sveltejs/kit";
import {fail} from "@sveltejs/kit";



/** @type {import('./$types').PageServerLoad} */
export async function load({cookies}) {
	
    

	return {API_KEY};
}


export const actions = {
    join: async({request, url, cookies}) => {
        const data = await request.formData();
        const room = data.get("room")
        const user = data.get("user")
        
        if(!room){
            return fail(400, {error:true, message:"Room pin missing"})
        }

        if(cookies.get("user")){
            cookies.delete("user");
        }
        cookies.set("user", user);

        throw redirect(303, `/online/game?room=${room}`);
    },

    create: async({request,url, cookies}) => {
        const data = await request.formData();
        const room = Math.round(Math.random()*(99999 - 10000))+10000;
        const user = data.get("user");

        if(cookies.get("user")){
            cookies.delete("user");
        }
        cookies.set("user", user, {
            path: '/',
            maxAge: 60 * 60 * 2,
            httpOnly: false, // <-- if you want to read it in the browser
        },);
         
        throw redirect(303, `/online/game?room=${room}`)
    }

}
