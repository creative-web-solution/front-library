## Autocomplete

### Init

```
import { Autocomplete } from '@creative-web-solution/front-library/Modules/Autocomplete'

ac = Autocomplete(
    {
        "$searchField":    null,
        "$panelWrapper":   document.body,
        "maxHeight":       200,
        "useCache":        false,
        "minchar":         3,
        "source":          null,
        "url":             "",
        "updateOnSelect":  true, // Update or not the text field with the selected value
        cssPositionning:   false, // Use CSS or Javascript for the position of the layer
        "onSelect": ( { item, resultsList, query } ) =>
        {
            console.log( "Option selected: ", item, query, resultsList );
        },
        "queryParams": query =>
        {
            return { "search": query };
        },
        "normalize": data =>
        {
            return data;
        },
        "renderFieldValue": ( { item, resultList } ) =>
        {
            // Return the string inserted in the text field when an item is selected
            return item.name;
        },
        "render": ( { resultItem, index, itemsList, cssClass } ) =>
        {
            return `<li role="option" class="${cssClass.item}"><a class="${cssClass.link}" data-idx="${index}">${resultItem.markedName}</a></li>`;
        },
        "renderList": ( { resultList, cssClass } ) =>
        {
            return `<ul role="listbox" class="${cssClass.list}">${resultList.join('')}</ul>`;
        },
        "renderError": ( { errorMsg, cssClass } ) =>
        {
            return `<li class="${cssClass.error}">${errorMsg}</li>`;
        },
        "renderMark": ( { resultItem, reQuery, query, index, resultList, cssClass } ) =>
        {
            resultItem.name && (resultItem.markedName = resultItem.name.replace(
                reQuery,
                `<mark class="${cssClass.mark}">$1</mark>`
            ));
        },
        "l10n": {
            "noResult":  "No result",
            "error":     "Server error"
        },
        "className": {
            "layer":     "ac-layer",
            "list":      "ac-list",
            "item":      "acl-itm",
            "link":      "acl-lnk",
            "mark":      "acl-mrk",
            "error":     "acl-error",
            "hover":     "hover",
            "disable":   "disable"
        }
    }
);

// Destroy
ac.clean();

// Display the list with all items (source mode only, not with ajax call)
ac.showAll();

// Reset the input field
ac.resetField();

//Reset the results
ac.resetResults();

// Reset the input field and the results
ac.reset();
```


### Sample of JSON expected by the plugin


```
{
    "success": true|false,
    "results": [
        {
            "name": "lorem ipsum",
            ...
        }
    ]
}
```

At least, `name` is required for each item but you can have other properties.

You can use the `normalize` function to transform the loaded JSON into the expected JSON.


### The source property


The Source property is a function that will be used as data source instead of making an ajax call ( like array or JSON object ).

It has 2 parameters:

* query => what is enter by the user in the field
* callback => function called after filtering the source. The results array should be passed as parameter like: callback( results )

```
function( query, callback ) {
    var results = query === null ? mySource : my_custom_filter( mySource, query );

    // results =
    //  [
    //      {
    //          "name": "lorem ipsum",
    //          ...
    //      },
    //      ...
    //  ]

    callback( results );
}
```

When in source mode, you can call the API function `showAll` to display the complete list of all item:

```
myAutocompleteInstance.showAll();
```

In order to do that, the source function will be called with the `query` parameter to `null`. So, if you want to use this feature, don't forget to return all the items when it's the case as show in the example.
