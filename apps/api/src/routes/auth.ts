import { Hono } from "hono";
import { registerSchema } from "shared"
import { db } from "../db/index.js"
import { users } from "../db/schema.js"
import * as argon2 from "argon2";

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
        console.log()
        return c.json("A user with this email is already registered", 400);
    } else {
        console.log("User Registered")
    }

    return c.json(newUser);
})

app.post('/login', async (c) => {

});

export default app;