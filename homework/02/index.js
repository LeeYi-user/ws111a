import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import * as render from "./render.js";

var app = new Application();
var router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

router.get("/", list);
router.get("/note/add", add);
router.get("/note/:id", show);
router.get("/remove/:id", remove);
router.post("/note", create);

var db = new DB("note.db");
db.query("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, body TEXT)");

function query(sql)
{
    let list = [];

    for (let [id, date, body] of db.query(sql))
    {
        list.push({ id, date, body });
    }

    return list;
}

async function list(ctx)
{
    let notes = query("SELECT id, date, body FROM notes");

    ctx.response.body = await render.list(notes);
}

async function add(ctx)
{
    ctx.response.body = await render.add();
}

async function show(ctx)
{
    let notes = query(`SELECT id, date, body FROM notes WHERE id=${ctx.params.id}`);

    if (!notes[0])
    {
        ctx.throw(404, "invalid note id");
    }

    ctx.response.body = await render.show(notes[0]);
}

async function remove(ctx)
{
    db.query(`DELETE FROM notes WHERE id=${ctx.params.id}`);
    ctx.response.redirect("/");
}

async function create(ctx)
{
    let body = ctx.request.body();

    if (body.type === "form")
    {
        let pairs = await body.value;
        let note = {};

        for (let [key, value] of pairs)
        {
            note[key] = value;
        }

        db.query("INSERT INTO notes (date, body) VALUES (?, ?)", [note.date, note.body]);
        ctx.response.redirect("/");
    }
}

console.log("Server running at http://localhost:8000");
await app.listen({ port: 8000 });
