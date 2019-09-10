## Slider

### Slider

```
import { Slider } from 'MODULES'

let slider = new Slider(
    $slider,
    {
        "startSlide":               0,

        // Mainly used to display a part of a slide before and after the active slide
        "nbSlideVisibleBefore":     0,
        "nbSlideVisibleAfter":      0,

        // Slide visible and active at he same time
        "slidePerPage":             1,

        // if "false", move only one slide at a time
        // if "true", move "slidePerPage" slides at a time
        "moveByPage":               true,

        "speed":                    0.5,
        "listSelector":             ".list",
        "itemsSelector":            ".item",
        "activeClass":              "active-slide",
        "loop":                     true,
        "smoothHeight":             true,
        "onBefore": ( data ) =>
        {
            // Only one time before the whole animation begin
        },
        "onBeforeEach": ( data ) =>
        {
            // Before each slide animation
        },
        "onAfter": ( data ) =>
        {
        },
        "onAfterEach": ( data ) =>
        {
        },
        "onStart": ( data ) =>
        {
        }
    }
);

slider.slideCount       => Total number of slides
slider.pageCount        => Total number of pages (could have "options.slidePerPage" slide by page)
slider.bulletCount      => Number of usefull bullets in the pagination: if "options.moveByPage=true" => "slider.pageCount" else "slider.slideCount"

slider.$slider          => Slider main wrapper
slider.$list            => Slides container
slider.$slides          => List of slides

promise = slider.previous();
promise = slider.next();
promise = slider.goto( slideIndex );

currentSlide = slider.getCurrentSlide();
slide = slider.getSlide(slideIndex);
slide = slider.getTheNthChildAfter(slideIndex, nthAfter);
slide = slider.getTheNthChildBefore(slideIndex, nthABefore);

boolean = slider.isEnable();

slider.destroy();
```

data.targetSlide and data.currentSlide contains:

```
{
    "$slide":                   $domElement,
    "id":                       $domElement.id,
    "delay":                    int, // in seconds
    "index":                    int,
    "position":                 int, // = index + 1
    "isFirst":                  boolean,
    "isLast":                   boolean,
    "isVisible":                boolean,
    "isActive":                 boolean
}
```

data.direction => 1 = next, -1 = previous


You can also handle events like this:

```
on( slider, {
    "eventsName": "start",
    "callback": data => console.log( 'start ', data )
});
on( slider, {
    "eventsName": "before",
    "callback": data => console.log( 'before ', data )
});
on( slider, {
    "eventsName": "beforeEach",
    "callback": data => console.log( 'beforeEach ', data )
});
on( slider, {
    "eventsName": "after",
    "callback": data => console.log( 'after ', data )
});
on( slider, {
    "eventsName": "afterEach",
    "callback": data => console.log( 'afterEach ', data )
});
```


### Slider controls

```
import { SliderControls } from 'MODULES'

let controls = new SliderControls(
    slider,
    {
        "$btPrev":              $domElement,
        "$btNext":              $domElement,
        "$pagination":          $domElement,
        "paginationItems":      selector
        "autoslide":            int, // in second
        "swipe":                false,
        "enableKeyboard":       false
    }
);

promise = controls.previous();
promise = controls.next();
promise = controls.goto( slideIndex );
boolean = controls.isEnable();

controls.destroy();
```

You can add a `data-delay` attribute (in second) on items to change the autoslide delay only for this items.

When the keyboard controls are activated:

* You can use ENTER and SPACE on the previous and next buttons
* You can use ARROW KEYS on the bullet pagination
* When the focus is in a slide, CTRL + UP to focus on the pagination,
* When the focus is in a slide, CTRL + PAGE UP to go to the previous slide and focus on the pagination
* When the focus is in a slide, CTRL + PAGE DOWN to go to the next slide and focus on the pagination

