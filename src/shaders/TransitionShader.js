import * as THREE from 'three'

const TransitionShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: null },
        zoom: { value: 1.0 },
        progress: { value: 0.0 },
        center: { value: new THREE.Vector2(0.5, 0.5) },
        blurDetail: { value: 20 },
    },
  
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float progress;
        uniform int blurDetail;
        uniform float zoom;
        uniform vec2 center;
        varying vec2 vUv;

        void main() {
            float blurAmount = progress * 10.0;

            vec2 uv = (vUv - center) * zoom + center;

            vec4 color = vec4(0, 0, 0, 1);
            for (int i = 0; i < blurDetail; i ++) {
                float amount = 1.0 - blurAmount * (1.0/1000.) * float(i);
                color.rgb += texture2D(tDiffuse, (uv - center) * amount + center).rgb;
            }
            color.rgb *= 1.0 / float(blurDetail);

            gl_FragColor = color;
        }
    `
}

export default TransitionShader