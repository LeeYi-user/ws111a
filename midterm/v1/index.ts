import { Application, Context, Router, send } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { WebSocketClient, WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.5.0/mod.ts";

const db = new DB("chat.db");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
db.query("CREATE TABLE IF NOT EXISTS msgs (id INTEGER PRIMARY KEY AUTOINCREMENT, msg TEXT)");

const router = new Router();
router.post("/sign_up", sign_up);
router.post("/sign_in", sign_in);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (ctx) =>
{
	try
	{
		await send(ctx, ctx.request.url.pathname,
		{
			root: `${ Deno.cwd() }/`,
			index: "login.html"
		});
	}
	catch (e)
	{
		console.log(e);
	}
});

async function sign_up(ctx: Context)
{
	const body = ctx.request.body({ type: "form-data" });
	const data = await body.value.read();
	const accounts: number = db.query(`SELECT COUNT(1) FROM users WHERE username='${ data["fields"]["username"] }'`)[0][0] as number;

	if (accounts > 0)
	{
		ctx.response.body = "sign_up_fail";
	}
	else
	{
		db.query("INSERT INTO users (username, password) VALUES (?, ?)", [data["fields"]["username"], data["fields"]["password"]]);
		ctx.response.body = "sign_up_success";
	}
}

async function sign_in(ctx: Context)
{
	const body = ctx.request.body({ type: "form-data" });
	const data = await body.value.read();
	const accounts: number = db.query(`SELECT COUNT(1) FROM users WHERE username='${ data["fields"]["username"] }'`)[0][0] as number;

	if (accounts == 0)
	{
		ctx.response.body = "sign_in_fail";
	}
	else
	{
		const password: string = db.query(`SELECT password FROM users WHERE username='${ data["fields"]["username"] }'`)[0][0] as string;

		if (password != data["fields"]["password"])
		{
			ctx.response.body = "sign_in_fail";
		}
		else
		{
			ctx.response.body = { "username": data["fields"]["username"] };
		}
	}
}

const wss = new WebSocketServer(8080);

wss.on("connection", function (wsc: WebSocketClient)
{
	const msgs = db.query("SELECT msg FROM msgs ORDER BY rowid DESC LIMIT 100");

	for (const [msg] of msgs.reverse())
	{
		wsc.send(msg as string);
	}

	wsc.on("message", function (msg: string)
	{
		db.query("INSERT INTO msgs (msg) VALUES (?)", [msg]);

		wss.clients.forEach(function each(client)
		{
			if (!client.isClosed)
			{
				client.send(msg);
			}
		});
	});
});

console.log("Server running at http://localhost:8000");
await app.listen({ port: 8000 });
