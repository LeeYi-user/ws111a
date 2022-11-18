import { Application, Context, Router, send} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import { Session, SqliteStore } from "https://deno.land/x/oak_sessions@v4.0.5/mod.ts";

const db = new DB("chat.db");
db.query("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)");
db.query("CREATE TABLE IF NOT EXISTS msgs (msg TEXT)");

const router = new Router();
router.get("/", redir);
router.get("/public/(.*)", pub);
router.post("/sign_up", sign_up);
router.post("/sign_in", sign_in);
router.get("/wss", chat);

const app = new Application();
app.use(Session.initMiddleware(new SqliteStore(db, "session"), { cookieSetOptions: { expires: new Date(3000, 1, 1) } }));
app.use(router.routes());
app.use(router.allowedMethods());

function redir(ctx: Context)
{
	ctx.response.redirect("/public/");
}

async function pub(ctx: Context)
{
	await send(ctx, ctx.request.url.pathname,
	{
		root: `${ Deno.cwd() }/`,
		index: "login.html"
	});
}

async function sign_up(ctx: Context)
{
	const body = ctx.request.body({ type: "form-data" });
	const data = await body.value.read();
	const accounts: number = db.query(`SELECT COUNT(1) FROM users WHERE username='${ data["fields"]["username"] }'`)[0][0] as number;

	if (accounts > 0)
	{
		ctx.response.body = "sign up fail";
	}
	else
	{
		db.query("INSERT INTO users (username, password) VALUES (?, ?)", [data["fields"]["username"], data["fields"]["password"]]);
		ctx.response.body = "sign up success";
	}
}

async function sign_in(ctx: Context)
{
	const body = ctx.request.body({ type: "form-data" });
	const data = await body.value.read();
	const accounts: number = db.query(`SELECT COUNT(1) FROM users WHERE username='${ data["fields"]["username"] }'`)[0][0] as number;

	if (accounts == 0)
	{
		ctx.response.body = "sign in fail";
	}
	else
	{
		const password: string = db.query(`SELECT password FROM users WHERE username='${ data["fields"]["username"] }'`)[0][0] as string;

		if (password != data["fields"]["password"])
		{
			ctx.response.body = "sign in fail";
		}
		else
		{
			ctx.state.session.set("user", data["fields"]["username"]);
			ctx.response.body = "sign in success";
		}
	}
}

const clients = new Map<WebSocket, string>();

async function chat(ctx: Context)
{
	if (!ctx.isUpgradable)
	{
		ctx.throw(501);
	}

	const socket = ctx.upgrade();
	const user = await ctx.state.session.get("user");

	clients.set(socket, user);

	socket.onopen = function()
	{
		if (user == null)
		{
			socket.send(JSON.stringify({ "command": "sign out" }));
			return;
		}

		const msgs = db.query("SELECT msg FROM msgs ORDER BY rowid DESC LIMIT 100");

		for (const [msg] of msgs.reverse())
		{
			socket.send(JSON.stringify({ "message": msg }));
		}
	};

	socket.onmessage = function(event)
	{
		const data = JSON.parse(event.data);

		for (const key in data)
		{
			if (key == "message")
			{
				const msg = "&lt;" + user + "&gt; " + data[key];

				db.query("INSERT INTO msgs (msg) VALUES (?)", [msg]);

				for (const [socket, _user] of clients)
				{
					socket.send(JSON.stringify({ "message": msg }));
				}
			}
		}
	};

	socket.onclose = function()
	{
		clients.delete(socket);
	};
}

console.log("Server running at http://localhost:8000");
await app.listen({ port: 8000 });
