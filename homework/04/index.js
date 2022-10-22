import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

var app = new Application();
var router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

router.get("/", index);
router.get("/sqlite/:command", sqlcmd);

var db = new DB("sqlite.db");

async function index(ctx)
{
    await send(ctx, ctx.request.url.pathname,
    {
        root: `${ Deno.cwd() }/`,
        index: "index.html"
    });
}

async function sqlcmd(ctx)
{
    let command = ctx.params["command"];
    let result = [];

    if (command === ".tables")
    {
        let tables = db.query("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'");

        for (let table of tables)
        {
            result.push(db.query("SELECT * FROM " + table[0]));
        }
    }
    else
    {
        result = db.query(command);
    }

    ctx.response.type = "application/json";
    ctx.response.body = result;
}

console.log("Server running at http://localhost:8000");
await app.listen({ port: 8000 });
