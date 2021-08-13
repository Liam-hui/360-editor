const MixShader = {
    uniforms: {
        tDiffuse: { value: null },
        tAdd: { value: null },
        progress: { value: 0.0 },
        isMix: { value: false }
    },
  
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
  
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tAdd;
        uniform float progress;
        uniform bool isMix;
        varying vec2 vUv;
        
        void main() {
            vec4 color = texture2D( tDiffuse, vUv );

            if (isMix) {
                vec4 add = texture2D( tAdd, vUv );
                gl_FragColor = mix(color, add, progress);
            }
            else
                gl_FragColor = color;
        }
    `
}

export default MixShader
  