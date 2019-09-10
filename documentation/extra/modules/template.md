## Template

```
import { template } from 'MODULES'

let tplFunction = template( html );
let html = tplFunction( { "text": "hey!!" } );
```

Or

```
let html = template( html, { "text": "hey!!" } );
```


Template example:

```
let myTemplate = `
<div>
    <% if ( obj.url ) { %>
        <a href="<%= obj.url %>">Link</a>
    <% } %>

    <ul>
    <% for ( var i = 0, len = obj.list.length; i < len; ++i ) { %>
        <li><%= obj.list[ i ] %></li>
    <% } %>
    </ul>
</div>`;

let tplFunction = template( myTemplate );

let html = tplFunction(
                    {
                        "url": "http://www.cws-studio.com",
                        "list": [ 'a', 'b', 'c', 'd' ]
                    }
                );

console.log( html );
```
