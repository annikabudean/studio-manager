import { Hono } from "hono";
import { registerSchema, loginSchema } from "shared"
import { db } from "../db/index.js"
import { users } from "../db/schema.js"
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt'
import 'dotenv/config';
import * as argon2 from "argon2";
import { getCookie, setCookie } from "hono/cookie";
import type { JWTPayload } from "hono/utils/jwt/types";

const app = new Hono();

app.post('/register', async (c) => {
    let body; 

    try {    
        body = await c.req.json();
    } 
    catch (e) {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    const result = registerSchema.safeParse(body)

    if (!result.success) {
        return c.json({ error: result.error}, 400);
    }

    const { email, password, name, role } = result.data;

    const hashedPass = await argon2.hash(password, { type: argon2.argon2id })

    const newUser = await db.insert(users)
    .values({ 
        email: email,
        passwordHash: hashedPass, 
        name: name, 
        role: role
    })
    .onConflictDoNothing({ target: users.email })
    .returning({
        email: users.email,
        name: users.name,
        role: users.role
    });

    if (newUser.length === 0) {
        return c.json("A user with this email is already registered", 400);
    } else {
        console.log("User Registered")
    }

    return c.json(newUser);
})

app.post('/login', async (c) => {
    let body; 

    try {    
        body = await c.req.json();
    } 
    catch (e) {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    const result = loginSchema.safeParse(body)

    if (!result.success) {
        return c.json({ error: result.error}, 400);
    }

    const { email, password } = result.data;

    const user = await db.select().from(users).where(eq(users.email, email))

    if (user.length === 0) {
        return c.json("Invalid email or password.", 400);
    } 

    const isValid = await argon2.verify(
        user[0]?.passwordHash, 
        password
    )

    if (isValid === false) {
        return c.json("Invalid email or password.", 400)
    }

    const payload = {
        sub: user[0]?.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
    }
    
    const token = await sign(payload, process.env.JWT_SECRET!)
    
    const cookie = setCookie(c, "cookie", token, {
        path: '/',
        secure: true,
        //domain: 'example.com',
        httpOnly: true,
        maxAge: 300,
        //expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
        sameSite: 'Strict',
    });

    return c.json({ email: user[0]?.email, name: user[0]?.name, role:user[0]?.role }, 200);
});

app.get('/me', async (c) => {
    const cookie = getCookie(c, "cookie")

    if (!cookie) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    let payload: JWTPayload; 
    try {    
        payload = await verify(cookie, process.env.JWT_SECRET!, 'HS256')
        console.log("in here?")
    } 
    catch (e) {
        return c.json({ error: "Invalid token" }, 401);
    }

    const user = await db.select().from(users).where(eq(users.id, payload.sub as number));

    return c.json({ email: user[0]?.email, name: user[0]?.name, role:user[0]?.role }, 200);
});

export default app;