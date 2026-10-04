import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { extname, join, normalize, sep, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { openAccountDb } from "./src/account-db.js";
import { allLessons } from "./src/data.js";
const root = process.cwd();
const types = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png"};
const validLessons=new Set(allLessons.map(item=>item.id));
const json=(response,status,data)=>{response.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});response.end(JSON.stringify(data));};
const cookie=request=>{const raw=request.headers.cookie||"";const found=raw.split(";").map(item=>item.trim()).find(item=>item.startsWith("cy_session="));return found?.slice(11)||"";};
const sessionCookie=(token,request)=>`cy_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${token?2592000:0}${request.headers["x-forwarded-proto"]==="https"?"; Secure":""}`;
const readBody=async request=>{let size=0,chunks=[];for await(const chunk of request){size+=chunk.length;if(size>400000)throw Object.assign(new Error("Request is too large."),{status:413});chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw Object.assign(new Error("Invalid request."),{status:400});}};
export function createAppServer({dbPath=process.env.CY_DB_PATH||join(root,"data","accounts.sqlite")}={}){
mkdirSync(dirname(dbPath),{recursive:true});
const accounts=openAccountDb(dbPath);
const server=createServer(async (request,response) => {
  try {
  const pathname = decodeURIComponent(new URL(request.url,"http://localhost").pathname);
  if(pathname.startsWith("/api/")){
    const origin=request.headers.origin;
    if(origin&&origin!==`http://${request.headers.host}`&&origin!==`https://${request.headers.host}`)return json(response,403,{error:"This request came from another site."});
    const current=accounts.userForSession(cookie(request));
    if(request.method==="GET"&&pathname==="/api/wards")return json(response,200,{wards:accounts.wards()});
    if(request.method==="GET"&&pathname==="/api/session")return json(response,200,{user:current,completions:current?accounts.completions(current.id):[]});
    if(request.method==="POST"&&pathname==="/api/register"){
      const {user,verifyToken}=accounts.register(await readBody(request));const token=accounts.createSession(user.id);
      // Prototype: no email is sent. The link a real email would contain is returned so the flow can be tested.
      response.setHeader("Set-Cookie",sessionCookie(token,request));return json(response,201,{user,completions:[],verifyLink:`#/account/verify/${verifyToken}`});
    }
    if(request.method==="POST"&&pathname==="/api/verify-email")return json(response,200,{user:accounts.verifyEmail((await readBody(request)).token)});
    if(request.method==="POST"&&pathname==="/api/login"){
      const body=await readBody(request),user=accounts.login(body.email,body.password),token=accounts.createSession(user.id);
      response.setHeader("Set-Cookie",sessionCookie(token,request));return json(response,200,{user,completions:accounts.completions(user.id)});
    }
    if(request.method==="POST"&&pathname==="/api/logout"){
      accounts.destroySession(cookie(request));response.setHeader("Set-Cookie",sessionCookie("",request));return json(response,200,{ok:true});
    }
    if(!current)return json(response,401,{error:"Sign in to continue."});
    if(request.method==="POST"&&pathname==="/api/resend-verification")return json(response,200,{verifyLink:`#/account/verify/${accounts.resendVerification(current.id)}`});
    if(request.method==="POST"&&pathname==="/api/photo")return json(response,200,{user:accounts.savePhoto(current.id,(await readBody(request)).photoData??null)});
    // Lessons, Keys, and progress are only for Active members (topic 11 §4).
    if((pathname==="/api/completions"||pathname==="/api/import-progress")&&current.status!=="active")return json(response,403,{error:"Lessons open once your ward approves your account."});
    if(request.method==="POST"&&pathname==="/api/completions"){
      const body=await readBody(request);
      if(!validLessons.has(body.lessonId))return json(response,400,{error:"Unknown lesson."});
      accounts.recordLesson(current.id,body.lessonId,new Date().toISOString());
      return json(response,200,{completions:accounts.completions(current.id)});
    }
    if(request.method==="POST"&&pathname==="/api/import-progress"){
      const body=await readBody(request);
      if(!Array.isArray(body.completions)||body.completions.length>100)return json(response,400,{error:"Choose valid progress to import."});
      for(const item of body.completions){
        if(!validLessons.has(item.lessonId))continue;
        const date=typeof item.completedAt==="string"&&Number.isFinite(Date.parse(item.completedAt))?item.completedAt:new Date().toISOString();
        accounts.recordLesson(current.id,item.lessonId,date);
      }
      return json(response,200,{completions:accounts.completions(current.id)});
    }
    return json(response,404,{error:"API route not found."});
  }
  if(pathname==="/bishopric-tools-mock.html"||pathname==="/bishopric-reporting-mock.html"){
    const viewer=accounts.userForSession(cookie(request));
    if(!viewer||viewer.role!=="bishopric"||viewer.status!=="active")return json(response,403,{error:"Bishopric access required."});
  }
  if(pathname==="/data"||pathname.startsWith("/data/")||pathname.split("/").some(part=>part.startsWith(".")))return json(response,404,{error:"Not found."});
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const target = normalize(join(root,relative));
  if (!target.startsWith(root + sep) && target !== join(root,"index.html")) {response.writeHead(403);response.end("Forbidden");return;}
  try {
    const details = await stat(target);
    if (!details.isFile()) throw new Error("Not a file");
    response.writeHead(200,{"Content-Type":types[extname(target)] || "application/octet-stream","Cache-Control":relative==="index.html"||extname(target)===".js"||extname(target)===".css"?"no-cache":"public, max-age=3600"});
    response.end(await readFile(target));
  } catch {response.writeHead(404);response.end("Not found");}
  } catch(error){json(response,error.status||500,{error:error.status?error.message:"Something went wrong. Please try again."});}
});
server.on("close",()=>accounts.db.close());
return server;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url) createAppServer().listen(Number(process.env.PORT || 4173),"127.0.0.1",()=>console.log("Wireframe running at http://127.0.0.1:"+(process.env.PORT || 4173)));

