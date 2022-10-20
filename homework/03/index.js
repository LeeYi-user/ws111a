import { viewEngine, engineFactory, adapterFactory } from "https://ccc-js.github.io/view-engine/mod.ts";
import { Application, Router} from "https://deno.land/x/oak@v6.0.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

var ejsEngine = engineFactory.getEjsEngine();
var oakAdapter = adapterFactory.getOakAdapter();
var app = new Application();
var router = new Router();

app.use(viewEngine(oakAdapter, ejsEngine));
app.use(router.routes());
app.use(router.allowedMethods());

router.get("/", index);
router.get("/show/:id", show);
router.get("/remove/:id", remove);
router.get("/create", create);
router.post("/add", add);

var db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT)");

function query(sql)
{
    let list = [];

    for (let [id, title, content] of db.query(sql))
    {
        list.push({ id, title, content });
    }

    return list;
}

async function index(ctx)
{
    let posts = query("SELECT id, title, content FROM posts");

    ctx.render("./index.ejs", { posts });
}

async function show(ctx)
{
    let posts = query(`SELECT id, title, content FROM posts WHERE id=${ ctx.params.id }`);
    let post = posts[0];

    if (!post)
    {
        ctx.throw(404, "invalid post id");
    }

    ctx.render("./root/show.ejs", { post });
}

async function remove(ctx)
{
    db.query(`DELETE FROM posts WHERE id=${ ctx.params.id }`);
    ctx.response.redirect("/");
}

async function create(ctx)
{
    ctx.render("./root/create.ejs");
}

async function add(ctx)
{
    let body = ctx.request.body();

    if (body.type === "form")
    {
        let pairs = await body.value;
        let post = {};

        for (let [key, value] of pairs)
        {
            post[key] = value;
        }

        db.query("INSERT INTO posts (title, content) VALUES (?, ?)", [post.title, post.content]);
        ctx.response.redirect("/");
    }
}

console.log("Server running at http://localhost:8000");
await app.listen({ port: 8000 });
