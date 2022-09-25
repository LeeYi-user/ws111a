export function layout(content)
{
    return `
    <!DOCTYPE html>

    <html>
        <head>
            <meta charset="utf-8">
    
            <style>
                body
                {
                    padding: 80px;
                    font: 16px Helvetica, Arial;
                }
    
                h1
                {
                    font-size: 2em;
                }
    
                h2
                {
                    font-size: 1.2em;
                }
    
                #notes
                {
                    margin: 0;
                    padding: 0;
                }
    
                #notes li
                {
                    margin: 40px 0;
                    padding: 0;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                    list-style: none;
                }
    
                #notes li:last-child
                {
                    border-bottom: none;
                }
    
                textarea
                {
                    width: 500px;
                    height: 300px;
                }
    
                input[type=date], textarea
                {
                    border: 1px solid #eee;
                    border-top-color: #ddd;
                    border-left-color: #ddd;
                    border-radius: 2px;
                    padding: 15px;
                    font-size: .8em;
                }
    
                input[type=date]
                {
                    width: 500px;
                }
            </style>
        </head>
    
        <body>
            <section>
                ${content}
            </section>
        </body>
    </html>
    `;
}

export function list(notes)
{
    let list = [];

    for (let note of notes)
    {
        list.push
        (`
            <li>
                <h2>
                    ${note.date}
                </h2>

                <p>
                    <a href="/note/${note.id}">
                        Read note
                    </a>
                </p>

                <p>
                    <a href="/remove/${note.id}">
                        Delete note
                    </a>
                </p>
            </li>
        `);
    }

    return layout(`
        <h1>
            Notes
        </h1>

        <p>
            You have <strong>${notes.length}</strong> notes!
        </p>

        <p>
            <a href="/note/add">
                Create a Note
            </a>
        </p>

        <ul id="notes">
            ${list.join("\n")}
        </ul>
    `);
}

export function add()
{
    return layout(`
        <h1>
            New Note
        </h1>

        <form action="/note" method="post">
            <p>
                <input type="date" name="date">
            </p>

            <p>
                <textarea placeholder="Contents" name="body"></textarea>
            </p>

            <p>
                <input type="submit" value="Create">
            </p>
        </form>
    `);
}

export function show(note)
{
    return layout(`
        <h1>
            ${note.date}
        </h1>

        <p>
            ${note.body}
        </p>
    `);
}
