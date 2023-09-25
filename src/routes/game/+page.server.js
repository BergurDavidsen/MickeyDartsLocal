import { redirect } from "@sveltejs/kit";
import {v4 as uuidv4} from "uuid";



export async function load({ cookies, url}) {
    if(!cookies.get("sessionID")){
        cookies.set("sessionID", uuidv4(), {path:"/", maxAge:60*60*2, httpOnly: false});
    }
    const sessionID = cookies.get("sessionID");
    return {sessionID};
};
