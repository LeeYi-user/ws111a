import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use(function(ctx)
{
    let pathname = ctx.request.url.pathname;

    if (pathname.startsWith("/home"))
    {
        ctx.response.body =
        `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
        
                <style>
                    .top
                    {
                        text-align: center;
                        margin-top: 100px;
                        font-size: 210%;
                        font-family: Consolas, "courier new";
                    }
        
                    .center
                    {
                        height: 450px;
                        width: 900px;
                        border: 1px solid black;
                        margin-top: 50px;
                        margin-left: auto;
                        margin-right: auto;
                        overflow: auto;
                        word-wrap: break-word;
                    }
        
                    .chat
                    {
                        margin-top: 10px;
                        margin-left: 10px;
                        font-size: 105%;
                        font-family: Consolas, "courier new";
                        font-weight: normal;
                    }
        
                    .bottom
                    {
                        width: 900px;
                        margin-top: 25px;
                        margin-left: auto;
                        margin-right: auto;
                    }
        
                    .enter
                    {
                        text-align: center;
                    }
        
                    .tip
                    {
                        display: inline;
                        font-size: 105%;
                        margin-top: 8px;
                        font-family: Consolas, "courier new";
                    }
        
                    .box
                    {
                        width: 800px;
                        height: 30px;
                        font-size: 105%;
                        padding-left: 5px;
                        border: 1px solid black;
                        font-family: Consolas, "courier new";
                    }
        
                    .box:focus
                    {
                        outline: none !important;
                    }
                </style>
            </head>
        
            <body>
                <div class="top">
                    Chatroom
                </div>
        
                <div class="center" id="center">
                    <div class="chat" id="chat">
                        <div>我打算在之後設計一個聊天室，這裡將會是文字輸出的地方。</div>
                        <div>名稱和訊息都會顯示在這裡，並採用UTF8編碼，以便支援多國語言。</div>
                        <div>到時也會有資料庫來記錄每條訊息，以確保使用者在重新登入後也能查看。</div>
                    </div>
                </div>
        
                <div class="bottom">
                    <div class="enter">
                        <div class="tip" id="tip">
                            Message:
                        </div>
        
                        <input type="text" class="box" id="box" maxlength="256" value="這裡是給使用者輸入文字的地方。為了避免資料庫被灌爆，我到時將在此進行長度上的限制。" readonly>
                    </div>
                </div>
            </body>
        </html>
        `;
    }
    else
    {
        ctx.response.body =
        `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
        
                <style>
                    .top
                    {
                        text-align: center;
                        margin-top: 100px;
                        font-size: 210%;
                        font-family: Consolas, "courier new";
                    }
        
                    .center
                    {
                        width: 900px;
                        margin-top: 100px;
                        margin-left: auto;
                        margin-right: auto;
                    }
        
                    .enter
                    {
                        text-align: center;
                    }
        
                    .tip
                    {
                        display: inline;
                        font-size: 105%;
                        margin-top: 8px;
                        font-family: Consolas, "courier new";
                    }
        
                    .box
                    {
                        width: 300px;
                        height: 30px;
                        font-size: 105%;
                        padding-left: 5px;
                        border: 1px solid black;
                        font-family: Consolas, "courier new";
                    }
        
                    .box:focus
                    {
                        outline: none !important;
                    }
        
                    .bottom
                    {
                        margin-top: 100px;
                    }
        
                    .btn
                    {
                        width: auto;
                        border: 1px solid black;
                        color: black;
                        padding: 10px 20px;
                        cursor: pointer;
                        background-color: white;
                        font-size: 105%;
                        font-family: Consolas, "courier new";
                    }
        
                    .btn:hover
                    {
                        color: white;
                        background: black;
                    }
                </style>
            </head>
        
            <body>
                <div class="top">
                    Welcome
                </div>
        
                <div class="center">
                    <div class="enter">
                        <div class="tip">
                            Username:
                        </div>
        
                        <input type="user" class="box" id="username_box" maxlength="16">
                    </div>
        
                    <div class="enter" style="margin-top: 50px;">
                        <div class="tip">
                            Password:
                        </div>
        
                        <input type="password" class="box" id="password_box" maxlength="32">
                    </div>
                </div>
        
                <div class="bottom">
                    <div class="enter">
                        <button class="btn" id="sign_in" onclick="location.href='home.html'">
                            Sign In
                        </button>
        
                        <button class="btn" style="margin-left: 50px;" id="sign_up" onclick="location.href='home.html'">
                            Sign Up
                        </button>
                    </div>
                </div>
            </body>
        </html>
        `;
    }
});

console.log("Server running at http://localhost:8000");
await app.listen({ port: 8000 });
