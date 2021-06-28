# DragSlider


```js
import DragSlider from '@creative-web-solution/front-library/Modules/DragSlider'

const slider = new DragSlider( $slider, {
    "viewportSelector": "",
    "listSelector": "",
    "itemSelector": "",
    "dragClass": "",
    "lockedClass": "",
    "onDrag": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {},
    "onInit": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {},
    "onMouseEnter": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {},
    "onMouseLeave": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {},
    "onSnap": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {
        // Call at the begin of the snap animation
    },
    "onSnapUpdate": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {
        // Call during the snap animation
    },
    "onStartDrag": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {},
    "onStopDrag": ({ item, xPos, moveMaxSize, isAtStart, isAtEnd }) => {},
    "onChangeState": ( isActive ) => {},
    "swipeTresholdMin": 40 // in px,
    "swipeTresholdSize": 0.5 // in % (0.5 = 50% of the size of one item)
} );

slider.isActive;

slider.init();
slider.destroy();

slider.goToItem( $item );
slider.next();
slider.previous();
```

## Example


**HTML**

```html
<div class="slider">
    <div class="viewport">
        <ul class="list">
            <li class="item">Content</li>
            <li class="item">Content</li>
            <li class="item">Content</li>
            <li class="item">Content</li>
            <li class="item">Content</li>
        </ul>
    </div>
</div>
```


**CSS**

```css
.slider
    &:not(.is-active)
        .viewport
            overflow-x auto
            overflow-y hidden
            -webkit-overflow-scrolling touch
            -ms-overflow-style none
            scrollbar-width none

            &::-webkit-scrollbar
                display none

            &::-webkit-scrollbar-thumb
                opacity 0

    .viewport
        position relative
        overflow hidden

    .list
        display flex
        width 100%
        flex 0 0 100%

    .item
        box-sizing border-box
        width 100%

    &.is-dragging
        .viewport
            pointer-events none
            user-select none

        &
        .viewport
        .list
        .item
            cursor none
```


**Javascript**

```js
const slider = new DragSlider( document.querySelector( '.slider' ), {
    "viewportSelector": ".viewport",
    "listSelector": ".list",
    "itemSelector": ".item",
    "dragClass": "is-dragging"
} );
```
