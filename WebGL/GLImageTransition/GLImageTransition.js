import { aClass }                           from 'front-library/DOM/Class';
import { append }                           from 'front-library/DOM/Manipulation';
import { createMat4, orthoMat4, scaleMat4 } from 'front-library/WebGL/Tools/matrix';
import { defer }                            from 'front-library/Helpers/defer';


const VERTEX_SHADER_SOURCE = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main(void) {
    vTextureCoord = aTextureCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;


/**
 * Image transition based on WebGL and shaders
 *
 * @param {Object} options
 * @param {HTMLElement} [options.$wrapper=document.body]
 * @param {String} [options.context=webgl]
 * @param {Preset} preset
 * @param {String} [options.fitMode=GLImageTransition.FIT_COVER] - GLImageTransition.FIT_COVER | GLImageTransition.FIT_CONTAINS
 * @param {Number} [options.duration=1] - Transition duration in second
 * @param {Number[]} [options.backgroundColor=[0, 0, 0, 1]] - 0 <= color <= 1
 * @param {Number[]} [options.dummyTextureColor=[0, 0, 1, 1]] - Color displayed instead of the texture when an error occured on image loading. 0 <= color <= 1
 * @param {String} [options.canvasCssClass]
 * @param {Boolean} [options.fluid=false] - Should the canvas size respond to the browser's size change
 * @param {Function} [options.onImageLoading] - Called juste before the loading start
 * @param {Function} [options.onImageLoaded] - Called once the loading is done
 * @param {Function} [options.onImageError] - Called on image loading error
 *
 * @example see GLImageTransition.md
 */
export default function GLImageTransition( userOptions = {}) {
    let canvasSize, canvasAspect, rafID,
        isImage1, transition, lastLoopTime, deltaTime,
        imagesInfo;

    const SHADER_PRESET = userOptions.preset;
    const OPTIONS       = Object.assign( {}, DEFAULT_OPTIONS, userOptions );
    const DURATION      = OPTIONS.duration * 1000; // convert in ms

    const SELF          = this;

    const $CANVAS = document.createElement( 'canvas' );
    OPTIONS.canvasCssClass && aClass( $CANVAS, OPTIONS.canvasCssClass );

    append( $CANVAS, OPTIONS.$wrapper );

    const GL = $CANVAS.getContext( OPTIONS.context );

    if ( !GL ) {
        throw 'Unable to initialize WebGL. Your browser may not support it.';
    }

    // Convert 0 -> 1 colors in 0 -> 255
    OPTIONS.dummyTextureColor = OPTIONS.dummyTextureColor.map( v => v * 255 );


    const VERTEX_BUFFER = createBuffer( GL.ARRAY_BUFFER, new Float32Array([
        -1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
         1.0,  1.0, 0.0
    ]) );

    const TEXTURE_BUFFER = createBuffer( GL.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0
    ]) );

    const INDEX_BUFFER = createBuffer( GL.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        3, 2, 1,
        3, 1, 0
    ]) );


    const VERTEX_SHADER   = createShader( GL, GL.VERTEX_SHADER,   VERTEX_SHADER_SOURCE );
    const FRAGMENT_SHADER = createShader( GL, GL.FRAGMENT_SHADER, SHADER_PRESET.fsSource );

    const SHADER_PROGRAM = GL.createProgram();

    GL.attachShader( SHADER_PROGRAM, VERTEX_SHADER);
    GL.attachShader( SHADER_PROGRAM, FRAGMENT_SHADER);
    GL.linkProgram( SHADER_PROGRAM);

    if ( !GL.getProgramParameter( SHADER_PROGRAM, GL.LINK_STATUS ) ) {
      throw `Unable to initialize the shader program: ${ GL.getProgramInfoLog( SHADER_PROGRAM ) }`;
    }

    const A_VERTEX_POSITION   = GL.getAttribLocation( SHADER_PROGRAM, 'aVertexPosition' );
    const A_TEXTURE_COORDS    = GL.getAttribLocation( SHADER_PROGRAM, 'aTextureCoord' );

    const U_PROJECTION_MATRIX = GL.getUniformLocation( SHADER_PROGRAM, 'uProjectionMatrix' );
    const U_MODEL_VIEW_MATRIX = GL.getUniformLocation( SHADER_PROGRAM, 'uModelViewMatrix' );
    const U_SAMPLER           = GL.getUniformLocation( SHADER_PROGRAM, 'uSampler' );
    const U_SAMPLER_2         = GL.getUniformLocation( SHADER_PROGRAM, 'uSampler2' );
    const U_PROGRESS          = GL.getUniformLocation( SHADER_PROGRAM, 'uProgress' );
    const U_TIME              = GL.getUniformLocation( SHADER_PROGRAM, 'uTime' );
    const U_DELTA_TIME        = GL.getUniformLocation( SHADER_PROGRAM, 'uDeltaTime' );

    SHADER_PRESET.addUniform && SHADER_PRESET.addUniform( GL, SHADER_PROGRAM );

    const TEXTURE_1           = createTexture();
    const TEXTURE_2           = createTexture();

    canvasSize = {};
    transition = {
        "value":      0,
        "time":       0,
        "isTweening": false,
        "edge":       1,
        "direction":  1
    };
    lastLoopTime = 0;


    Object.defineProperties( this, {
        "$canvas": {
            "get": () => $CANVAS
        },
        "context": {
            "get": () => GL
        },
        "size": {
            "get": () => canvasSize
        },
        "aspect": {
            "get": () => canvasAspect
        }
    } );



    /**
     * Clean objects and remove all bindings
     */
    this.destroy = () => {
        GL.deleteBuffer( VERTEX_BUFFER );
        GL.deleteBuffer( TEXTURE_BUFFER );
        GL.deleteBuffer( INDEX_BUFFER );
        GL.deleteProgram( SHADER_PROGRAM );
        GL.deleteShader( FRAGMENT_SHADER );
        GL.deleteShader( VERTEX_SHADER );

        window.removeEventListener( 'resize', onResize );
    };


    /**
     *
     * @param {Number} width
     * @param {Number} height
     */
    this.updateCanvasSize = ( width, height ) => {
        if ( width === canvasSize.width && height === canvasSize.height ) {
            return;
        }

        canvasSize = {
            "width":  width,
            "height": height
        };

        canvasAspect = canvasSize.width / canvasSize.height;

        $CANVAS.setAttribute( 'width',  canvasSize.width );
        $CANVAS.setAttribute( 'height', canvasSize.height );
    };


    /**
     * Start the rendering loop
     */
    this.startRender = () => {
        rafID = requestAnimationFrame( render );
    };


    /**
     * Stop the rendering loop
     */
    this.stopRender = () => {
        cancelAnimationFrame( rafID );
    };


    /**
     * Load and init of the first displayed image
     *
     * @param {String} url
     *
     * @return {GLImageTransition}
     */
    this.loadAndInitImage = ( url ) => {
        loadImage( url, TEXTURE_1, true )
            .then( $image => {
                imagesInfo = {
                    "width":  $image.naturalWidth,
                    "height": $image.naturalHeight
                }

                imagesInfo.aspect = imagesInfo.width / imagesInfo.height;
            } );

        isImage1 = true;

        return this;
    };


    /**
     * Init of the first displayed image
     *
     * @param {HTMLImageElement} $image - This image is considered loaded
     *
     * @return {GLImageTransition}
     */
    this.initImage = ( $image ) => {

        setTexture( TEXTURE_1, $image );

        imagesInfo = {
            "width":  $image.naturalWidth,
            "height": $image.naturalHeight
        }

        imagesInfo.aspect = imagesInfo.width / imagesInfo.height;

        isImage1 = true;

        return this;
    };


    /**
     * Load and update the next image to display and start the transition between the 2 images
     *
     * @param {String} url
     *
     * @return {GLImageTransition}
     */
    this.loadAndChangeImage = ( url ) => {
        let currentTexture, transitionEdge;
        if ( transition.isTweening ) {
            return;
        }

        currentTexture      = isImage1 ? TEXTURE_2 : TEXTURE_1;
        transitionEdge = isImage1 ? 1 : 0;

        loadImage( url, currentTexture, false )
            .then( () => {
                tweenTransition( transitionEdge );
            } );

        return this;
    };


    /**
     * Update the next image to display and start the transition between the 2 images
     *
     * @param {HTMLImageElement} $image - This image is considered loaded
     *
     * @return {GLImageTransition}
     */
    this.changeImage = ( $image ) => {
        if ( transition.isTweening ) {
            return;
        }

        if ( isImage1 ) {
            setTexture( TEXTURE_2, $image );
            tweenTransition( 1 );

            return this;
        }

        setTexture( TEXTURE_1, $image );
        tweenTransition( 0 );

        return this;
    };


    function setTexture( texture, $image ) {
        GL.bindTexture( GL.TEXTURE_2D, texture );
        GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, $image);

        GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
        GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
        GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR );
    }


    function loadImage( url, texture, isInit ) {
        const DEFERRED       = defer();
        const $IMAGE = new Image();

        OPTIONS.onImageLoading && OPTIONS.onImageLoading.call( this, url, isInit );

        $IMAGE.addEventListener( 'load', function() {

            setTexture( texture, $IMAGE );

            OPTIONS.onImageLoaded && OPTIONS.onImageLoaded.call( this, url, isInit );

            DEFERRED.resolve( $IMAGE );
        } );


        $IMAGE.addEventListener( 'error', function() {
            OPTIONS.onImageError && OPTIONS.onImageError.call( this, url, isInit );

            setDummyTexture( texture );

            DEFERRED.resolve( $IMAGE );
        } );


        $IMAGE.src = url;

        return DEFERRED;
    }


    function getAspect() {
        let horizontalDrawAspect, verticalDrawAspect;


        if ( OPTIONS.fitMode ===  GLImageTransition.FIT_CONTAINS ) {
            horizontalDrawAspect = 1;
            verticalDrawAspect   = canvasAspect / imagesInfo.aspect;

            if ( verticalDrawAspect > 1 ) {
                horizontalDrawAspect /= verticalDrawAspect;
                verticalDrawAspect   = 1;
            }
        }
        else {
            horizontalDrawAspect = imagesInfo.aspect / canvasAspect;
            verticalDrawAspect   = 1;

            if ( horizontalDrawAspect < 1 ) {
                verticalDrawAspect   /= horizontalDrawAspect;
                horizontalDrawAspect = 1;
            }
        }

        return {
            "x": horizontalDrawAspect,
            "y": verticalDrawAspect
        };
    }


    function _tween() {
        if ( transition.time >= DURATION ) {
            transition.value      = transition.edge;
            transition.isTweening = false;
            isImage1              = !isImage1;
            SHADER_PRESET.onTransitionEnd && SHADER_PRESET.onTransitionEnd();
            return;
        }

        // the value of transition.value is between 0 and 1. So it's the same as the percentage of the duration
        const PERCENT   = transition.time / DURATION;

        if ( transition.direction === 1 ) {
            transition.value = PERCENT;
        }
        else {
            transition.value = 1 - PERCENT;
        }

        transition.time += deltaTime;

        requestAnimationFrame( _tween );
    }


    function tweenTransition( edge ) {
        if ( transition.isTweening ) {
            return;
        }

        transition.edge = edge;
        transition.time = 0;
        SHADER_PRESET.onTransitionStart && SHADER_PRESET.onTransitionStart();

        if ( edge > transition.value ) {
            transition.direction = 1;
        }
        else if ( edge < transition.value ) {
            transition.direction = -1;
        }

        transition.isTweening = true;

        requestAnimationFrame( _tween );
    }


    function render( time ) {

        deltaTime    = time - lastLoopTime;
        lastLoopTime = time;

        clear();

        if ( !imagesInfo ) {
            rafID = requestAnimationFrame( render );
            return;
        }

        const projectionMatrix = createMat4();
        const aspectDelta      = getAspect();

        orthoMat4( projectionMatrix, -1, 1, -1, 1, 0.0, 10.0 );

        const modelViewMatrix = createMat4();

        scaleMat4( modelViewMatrix, modelViewMatrix, [ aspectDelta.x, aspectDelta.y, 1, 1 ] );

        // Tell WebGL which indices to use to index the vertices
        GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, INDEX_BUFFER );

        // Tell WebGL to use our program when drawing

        GL.useProgram( SHADER_PROGRAM );


        // ATTRIBUTES

        GL.bindBuffer( GL.ARRAY_BUFFER, VERTEX_BUFFER );
        GL.vertexAttribPointer(
            A_VERTEX_POSITION,
            3,
            GL.FLOAT,
            false,
            0,
            0
        );
        GL.enableVertexAttribArray( A_VERTEX_POSITION );

        GL.bindBuffer( GL.ARRAY_BUFFER, TEXTURE_BUFFER );
        GL.vertexAttribPointer(
            A_TEXTURE_COORDS,
            2,
            GL.FLOAT,
            false,
            0,
            0
        );
        GL.enableVertexAttribArray( A_TEXTURE_COORDS );


        // UNIFORMS

        GL.uniformMatrix4fv( U_PROJECTION_MATRIX, false, projectionMatrix );
        GL.uniformMatrix4fv( U_MODEL_VIEW_MATRIX, false, modelViewMatrix );

        GL.uniform1f( U_PROGRESS,   transition.value );
        GL.uniform1f( U_TIME,       time );
        GL.uniform1f( U_DELTA_TIME, deltaTime );


        SHADER_PRESET.updateUniform && SHADER_PRESET.updateUniform( GL );


        GL.activeTexture( GL.TEXTURE0 );
        GL.bindTexture( GL.TEXTURE_2D, TEXTURE_1 );
        GL.uniform1i( U_SAMPLER, 0 );

        GL.activeTexture( GL.TEXTURE1 );
        GL.bindTexture( GL.TEXTURE_2D, TEXTURE_2 );
        GL.uniform1i( U_SAMPLER_2, 1 );


        GL.drawElements( GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0 );

        rafID = requestAnimationFrame( render );
    }


    function createTexture() {
        return setDummyTexture( GL.createTexture() );
    }


    function setDummyTexture( texture ) {
        const pixel = new Uint8Array( OPTIONS.dummyTextureColor );

        GL.bindTexture( GL.TEXTURE_2D, texture );

        GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA,
                        1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE,
                        pixel
                    );

        return texture;
    }


    function createShader( gl, type, source ) {
        const SHADER = gl.createShader( type );

        gl.shaderSource( SHADER, source );
        gl.compileShader( SHADER );

        if ( !gl.getShaderParameter( SHADER, gl.COMPILE_STATUS ) ) {
            const ERR = `An error occurred compiling the shaders: ${ gl.getShaderInfoLog( SHADER ) }`;
            gl.deleteShader( SHADER );
            throw ERR;
        }

        return SHADER;
    }


    function createBuffer( usage, data ) {
        const buffer = GL.createBuffer();

        GL.bindBuffer( usage, buffer );
        GL.bufferData( usage, data, GL.STATIC_DRAW );

        return buffer;
    }


    function clear() {
        // Clear the canvas
        GL.clearColor( ...OPTIONS.backgroundColor );

        // Clear everything
        GL.clearDepth( 1.0 );

        // Enable the depth test
        GL.enable( GL.DEPTH_TEST );

        // Near things obscure far things
        GL.depthFunc( GL.LEQUAL );

        // Clear the color buffer bit
        GL.clear( GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT );

        GL.viewport( 0, 0, canvasSize.width, canvasSize.height );
    }


    function onResize() {
        SELF.updateCanvasSize( $CANVAS.clientWidth, $CANVAS.clientHeight );
    }


    onResize();


    if ( OPTIONS.fluid ) {
        window.addEventListener( 'resize', onResize );
    }


    clear();
}


GLImageTransition.FIT_COVER    = 'cover';
GLImageTransition.FIT_CONTAINS = 'contains';


const DEFAULT_OPTIONS = {
    "$wrapper":          document.body,
    "context":           "webgl",
    "backgroundColor":   [ 0, 0, 0, 1 ],
    "dummyTextureColor": [ 0, 0, 1, 1 ],
    "duration":          1,
    "fitMode":           GLImageTransition.FIT_COVER
};
