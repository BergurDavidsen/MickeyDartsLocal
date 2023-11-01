import { API_KEY } from '$env/static/private';
import { redirect } from "@sveltejs/kit";
import {fail} from "@sveltejs/kit";
import {v4 as uuidv4} from "uuid";




/** @type {import('./$types').PageServerLoad} */
export async function load({cookies}) {
	return {API_KEY};
}


export const actions = {
    join: async({request, url, cookies}) => {
        const data = await request.formData();
        const room = data.get("room")
        const user = data.get("user").trim();
        const gameID = data.get("gameID");
        
        if(!room){
            return fail(400, {error:true, message:"Room pin missing"})
        }

        if(cookies.get("user")){
            cookies.delete("user");
        }
        if(cookies.get("gameID")){
            cookies.delete("gameID");
        }
        cookies.set("user", user, {
            path: '/',
            maxAge: 60 * 60 * 2,
            httpOnly: false, // <-- if you want to read it in the browser
        },);
        cookies.set("gameID",gameID,{
            path: '/',
            maxAge: 60 * 60 * 2,
            httpOnly: false, // <-- if you want to read it in the browser
        });


        throw redirect(303, `/online/game?room=${room}`);
    },

    create: async({request,url, cookies}) => {
        const data = await request.formData();
        const room = Math.round(Math.random()*(999999 - 100000))+100000;
        const user = data.get("user").trim();
        const gameID = uuidv4();

        if(cookies.get("user")){
            cookies.delete("user");
        }
        if(cookies.get("gameID")){
            cookies.delete("gameID");
        }

        cookies.set("user", user, {
            path: '/',
            maxAge: 60 * 60 * 2,
            httpOnly: false, // <-- if you want to read it in the browser
        },);
        cookies.set("gameID",gameID,{
            path: '/',
            maxAge: 60 * 60 * 2,
            httpOnly: false, // <-- if you want to read it in the browser
        });

         
        throw redirect(303, `/online/game?room=${room}`);
    }

}
