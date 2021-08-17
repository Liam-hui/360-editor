const ItemShader = {
    uniforms: {  
        tex: { value: null },
        isHover: { value: false },
    },

    vertexShader: `
        varying vec2 vUv;

        void main()
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,

    fragmentShader: `    
        uniform sampler2D tex;
        uniform bool isHover;
        
        varying vec2 vUv;
        
        void main(void) {
            vec3 white = vec3(1.0, 1.0, 1.0);
            vec4 color = texture2D(tex, vUv);

            float mixValue = 0.0;
            if (isHover) mixValue = 0.4;

            vec3 c = color.rgb * ( 1.0 - mixValue ) + white * mixValue;
            gl_FragColor = vec4(c.rgb, color.a);
        }
    `,
}

export default ItemShader
  