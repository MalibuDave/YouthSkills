import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { ageFrom, ageGroup, PASSWORD_MIN, PASSWORD_MAX } from "./account-rules.js";

const digest = value => createHash("sha256").update(value).digest("hex");
const clean = value => String(value ?? "").trim();
const emailOf = value => clean(value).toLowerCase();
const passwordHash = password => { const salt=randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password,salt,64).toString("hex")}`; };
const verifyPassword = (password, stored) => {
  const [salt,hash]=String(stored).split(":");
  if(!salt||!hash) return false;
  const expected=Buffer.from(hash,"hex"), actual=scryptSync(password,salt,expected.length);
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
};
const fail = (message,status=400) => { const error=new Error(message); error.status=status; throw error; };
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length<=254;
const nameField = (value,label) => {const text=clean(value);if(text.length<1||text.length>80)fail(`${label} is required (up to 80 characters).`);return text;};
const optionalName = value => {const text=clean(value);if(text.length>80)fail("Names can be up to 80 characters.");return text||null;};
const now = () => new Date().toISOString();
const VERIFY_HOURS = 24;

const USERS_TABLE = `CREATE TABLE users(
  id INTEGER PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','bishopric','content_admin','site_admin')),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  birth_year INTEGER, birth_month INTEGER, age INTEGER,
  parent1_first TEXT, parent1_last TEXT, parent2_first TEXT, parent2_last TEXT,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL,
  ward_id INTEGER NOT NULL REFERENCES wards(id),
  status TEXT NOT NULL DEFAULT 'unverified' CHECK(status IN ('unverified','pending','see_bishopric','wrong_ward','rejected','active')),
  status_changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  email_verified_at TEXT, verify_token_hash TEXT, verify_expires_at TEXT,
  bishopric_request TEXT CHECK(bishopric_request IN ('requested','verified','granted','denied')), bishopric_phone TEXT,
  photo_data TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`;

// Earlier prototype databases used role youth/bishopric and had no membership
// status. Rebuild that table once; existing accounts keep working as Active.
function migrate(db) {
  const columns=db.prepare("PRAGMA table_info(users)").all().map(column=>column.name);
  if(!columns.length){db.exec(USERS_TABLE);return;}
  if(columns.includes("status"))return;
  db.exec("PRAGMA foreign_keys=OFF; BEGIN;");
  try {
    db.exec(USERS_TABLE.replace("CREATE TABLE users(","CREATE TABLE users_v2("));
    db.exec(`INSERT INTO users_v2(id,role,first_name,last_name,age,email,password_hash,ward_id,status,status_changed_at,email_verified_at,photo_data,created_at)
      SELECT id,CASE role WHEN 'bishopric' THEN 'bishopric' ELSE 'member' END,first_name,last_name,age,email,password_hash,ward_id,'active',created_at,created_at,photo_data,created_at FROM users;
      DROP TABLE users; ALTER TABLE users_v2 RENAME TO users; COMMIT;`);
  } catch(error){db.exec("ROLLBACK;");throw error;}
  finally{db.exec("PRAGMA foreign_keys=ON;");}
}

export function openAccountDb(path) {
  const db=new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS wards(id INTEGER PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE UNIQUE, address TEXT NOT NULL, phone TEXT NOT NULL);`);
  migrate(db);
  db.exec(`CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS lesson_completions(user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, completed_at TEXT NOT NULL, PRIMARY KEY(user_id,lesson_id));
    CREATE TABLE IF NOT EXISTS membership_events(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, ward_id INTEGER NOT NULL REFERENCES wards(id), from_status TEXT, to_status TEXT NOT NULL, actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL, note TEXT, created_at TEXT NOT NULL);`);
  // Wards are hand-seeded for the beta (topic 11 §2); members cannot create them.
  if(!db.prepare("SELECT id FROM wards LIMIT 1").get()){
    const seed=db.prepare("INSERT INTO wards(name,address,phone) VALUES(?,?,?)");
    seed.run("Demo Ward","Prototype location","(000) 000-0000");
    seed.run("Second Demo Ward","Prototype location","(000) 000-0000");
  }
  const getUser=id=>db.prepare(`SELECT u.id,u.role,u.first_name AS firstName,u.last_name AS lastName,u.birth_year AS birthYear,u.birth_month AS birthMonth,u.age AS legacyAge,
    u.parent1_first AS parent1First,u.parent1_last AS parent1Last,u.parent2_first AS parent2First,u.parent2_last AS parent2Last,
    u.email,u.ward_id AS wardId,u.status,u.status_changed_at AS statusChangedAt,u.email_verified_at AS emailVerifiedAt,u.bishopric_request AS bishopricRequest,
    u.photo_data AS photoData,w.name AS wardName,w.address AS wardAddress,w.phone AS wardPhone FROM users u JOIN wards w ON w.id=u.ward_id WHERE u.id=?`).get(id);
  const profile=id=>{
    const row=getUser(id);if(!row)return null;
    const {legacyAge,parent1First,parent1Last,parent2First,parent2Last,...user}=row;
    const age=user.birthYear?ageFrom(user.birthYear,user.birthMonth):legacyAge;
    const parents=[[parent1First,parent1Last],[parent2First,parent2Last]].filter(([first])=>first).map(([firstName,lastName])=>({firstName,lastName}));
    return {...user,age,parents,bishopric:db.prepare("SELECT first_name AS firstName,last_name AS lastName FROM users WHERE ward_id=? AND role='bishopric' ORDER BY last_name,first_name").all(user.wardId)};
  };
  const logEvent=(userId,wardId,from,to,actorId=null,note=null)=>db.prepare("INSERT INTO membership_events(user_id,ward_id,from_status,to_status,actor_id,note,created_at) VALUES(?,?,?,?,?,?,?)").run(userId,wardId,from,to,actorId,note,now());
  const newVerifyToken=id=>{
    const token=randomBytes(24).toString("hex"),expires=new Date(Date.now()+VERIFY_HOURS*3600000).toISOString();
    db.prepare("UPDATE users SET verify_token_hash=?,verify_expires_at=? WHERE id=?").run(digest(token),expires,id);
    return token;
  };
  const wards=()=>db.prepare("SELECT id,name,address,phone FROM wards ORDER BY name").all();

  // Sign-up (topic 11 §2). Under-13 is refused before anything is stored.
  const register=input=>{
    const age=ageFrom(input.birthYear,input.birthMonth);
    if(age===null)fail("Enter your birth month and year.");
    if(Number(input.birthYear)<1900)fail("Enter a valid birth year.");
    const group=ageGroup(age);
    if(group==="under13")fail("Covenant Youth accounts are for ages 13 and up right now.",403);
    const first=nameField(input.firstName,"First name"),last=nameField(input.lastName,"Last name");
    let parent1=[null,null],parent2=[null,null];
    if(group==="youth"){
      parent1=[nameField(input.parent1First,"Parent or guardian first name"),nameField(input.parent1Last,"Parent or guardian last name")];
      parent2=[optionalName(input.parent2First),optionalName(input.parent2Last)];
      if(Boolean(parent2[0])!==Boolean(parent2[1]))fail("Enter both a first and last name for the second parent or guardian, or leave both blank.");
    }
    const email=emailOf(input.email);
    if(!validEmail(email))fail("Enter a valid email address.");
    if(db.prepare("SELECT id FROM users WHERE email=?").get(email))fail("An account with this email already exists.",409);
    const password=String(input.password??"");
    if(password.length<PASSWORD_MIN||password.length>PASSWORD_MAX)fail(`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters.`);
    const wardId=Number(input.wardId);
    if(!db.prepare("SELECT id FROM wards WHERE id=?").get(wardId))fail("Choose your ward.");
    let request=null,phone=null;
    if(input.requestBishopric===true||input.requestBishopric==="on"){
      if(group!=="adult")fail("Only adults can request a bishopric role.");
      phone=clean(input.bishopricPhone);
      if(!/^[0-9+().\-\s]{7,20}$/.test(phone)||phone.replace(/\D/g,"").length<7)fail("Enter a phone number so a site admin can verify your bishopric role.");
      request="requested";
    }
    const result=db.prepare(`INSERT INTO users(role,first_name,last_name,birth_year,birth_month,parent1_first,parent1_last,parent2_first,parent2_last,email,password_hash,ward_id,status,status_changed_at,bishopric_request,bishopric_phone)
      VALUES('member',?,?,?,?,?,?,?,?,?,?,?,'unverified',?,?,?)`).run(first,last,Number(input.birthYear),Number(input.birthMonth),...parent1,...parent2,email,passwordHash(password),wardId,now(),request,phone);
    const id=Number(result.lastInsertRowid);
    logEvent(id,wardId,null,"unverified",id);
    return {user:profile(id),verifyToken:newVerifyToken(id)};
  };

  // Email verification (topic 11 §3): only then does the request reach the ward.
  const verifyEmail=token=>{
    const row=token&&db.prepare("SELECT id,ward_id,status,verify_expires_at FROM users WHERE verify_token_hash=?").get(digest(clean(token)));
    if(!row)fail("That verification link is not valid. Sign in to get a new one.");
    if(row.verify_expires_at<now())fail("That verification link has expired. Sign in to get a new one.");
    db.prepare("UPDATE users SET email_verified_at=?,verify_token_hash=NULL,verify_expires_at=NULL WHERE id=?").run(now(),row.id);
    if(row.status==="unverified"){
      db.prepare("UPDATE users SET status='pending',status_changed_at=? WHERE id=?").run(now(),row.id);
      logEvent(row.id,row.ward_id,"unverified","pending",row.id);
    }
    return profile(row.id);
  };
  const resendVerification=id=>{
    const user=profile(id);
    if(!user||user.emailVerifiedAt)fail("This email address is already verified.");
    return newVerifyToken(id);
  };

  const login=(email,password)=>{
    const row=db.prepare("SELECT id,password_hash FROM users WHERE email=?").get(emailOf(email));
    if(!row||!verifyPassword(String(password??""),row.password_hash))fail("Email or password is incorrect.",401);
    return profile(row.id);
  };
  const createSession=id=>{const token=randomBytes(32).toString("hex"),expires=new Date(Date.now()+30*86400000).toISOString();db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").run(digest(token),id,expires);return token;};
  const userForSession=token=>{if(!token)return null;const row=db.prepare("SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?").get(digest(token),now());return row?profile(row.user_id):null;};
  const destroySession=token=>{if(token)db.prepare("DELETE FROM sessions WHERE token_hash=?").run(digest(token));};
  const savePhoto=(id,data)=>{if(data!==null&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data)||data.length>350000))fail("Choose a PNG, JPEG, or WebP image under 250 KB.");db.prepare("UPDATE users SET photo_data=? WHERE id=?").run(data,id);return profile(id);};
  const recordLesson=(id,lessonId,date)=>{db.prepare("INSERT OR IGNORE INTO lesson_completions(user_id,lesson_id,completed_at) VALUES(?,?,?)").run(id,lessonId,date);};
  const completions=id=>db.prepare("SELECT lesson_id AS lessonId,completed_at AS completedAt FROM lesson_completions WHERE user_id=? ORDER BY completed_at DESC").all(id);
  const membershipEvents=id=>db.prepare("SELECT from_status AS fromStatus,to_status AS toStatus,ward_id AS wardId,actor_id AS actorId,note,created_at AS createdAt FROM membership_events WHERE user_id=? ORDER BY id").all(id);
  return {db,wards,profile,register,verifyEmail,resendVerification,login,createSession,userForSession,destroySession,savePhoto,recordLesson,completions,membershipEvents};
}
