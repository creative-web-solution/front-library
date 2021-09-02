import { strToDOM }         from '../../DOM/StrToDOM';
import PopinController      from './PopinController';
import Popin                from './Popin';
import { CLICK_EVENT_NAME } from './Tools';


export default class PopinBackground {

    #$bgLayer: HTMLElement;
    #isOpened: boolean;
    #options:  PopinOptionsType;
    #popin:    Popin | PopinController;


    get isOpened() {
        return this.#isOpened;
    }


    constructor( popin: Popin | PopinController, options: PopinOptionsType ) {
        this.#isOpened = false;
        this.#popin    = popin;
        this.#options  = options;
        this.#$bgLayer = strToDOM( options.templates!.bgLayer! ) as HTMLElement;

        document.body.appendChild( this.#$bgLayer );
    }


    open() {
        if ( this.#isOpened ) {
            return Promise.resolve();
        }

        if ( !this.#options.modal ) {
            this.#$bgLayer.addEventListener( CLICK_EVENT_NAME, this.#onBgClick );
        }

        return this.#options.animations!.openBg!( this.#$bgLayer ).then( () => {
            this.#isOpened = true;
        } );
    }


    close() {
        if ( !this.#isOpened ) {
            return Promise.resolve();
        }

        if ( !this.#options.modal ) {
            this.#$bgLayer.removeEventListener( CLICK_EVENT_NAME, this.#onBgClick );
        }

        return this.#options.animations!.closeBg!( this.#$bgLayer ).then( () => {
            this.#isOpened = false;
        } );
    }


    #onBgClick = () => {
        this.#popin.close();
    }


    destroy() {
        this.#$bgLayer.removeEventListener( CLICK_EVENT_NAME, this.#onBgClick );
    };
}
