uniform sampler2D tDay;
uniform sampler2D tNight;
uniform vec3 dirPrimary;
uniform float magPrimary;
uniform vec3 dirSecondary;
uniform float magSecondary;
uniform vec3 dirTertiary;
uniform float magTertiary;
uniform vec3 glowColor;
varying float intensity;
#ifdef GL_ES
precision highp float;
#endif

uniform float height;
uniform vec2 resolution;
uniform sampler2D heightMap;

varying vec2 vUv;

void main() {
    float val = texture2D(heightMap, vUv).x;

    float valU = texture2D(heightMap, vUv + vec2(1.0 / resolution.x, 0.0)).x;
    float valV = texture2D(heightMap, vUv + vec2(0.0, 1.0 / resolution.y)).x;

    gl_FragColor = vec4((0.5 * normalize(vec3(val - valU, val - valV, height)) + 0.5), 1.0);

    // Planet shader functionality
    vec3 dayColor = texture2D(tDay, vUv).xyz;
    vec3 nightColor = texture2D(tNight, vUv).xyz;
    vec3 norm = normalize(vNormal);
    if (magPrimary > 0.0) {
        vec4 posPrimary = viewMatrix * vec4(dirPrimary, 0.0);
        vec3 relDirPrimary = normalize(posPrimary.xyz);
        float magP = clamp(magPrimary, 0.0, 1.0);
        if (!enableDiffuse)
        gl_FragColor.xyz = dayColor * magP;
        float starOneAngle = dot(norm, relDirPrimary);
        starOneAngle = clamp(starOneAngle * 10.0, -1.0, 1.0);
        float mixOneAmt = starOneAngle * 0.5 + 0.5;
        gl_FragColor.xyz = mix(nightColor, gl_FragColor.xyz, mixOneAmt * magP);
        // FIXME test multi-mixing for multiple light sources
        if (magSecondary > 0.0) {
            vec4 posSecondary = viewMatrix * vec4(dirSecondary, 0.0);
            vec3 relDirSecondary = normalize(posSecondary.xyz);
            float magS = clamp(magSecondary, 0.0, 1.0);
            float starTwoAngle = dot(norm, relDirSecondary);
            starTwoAngle = clamp(starTwoAngle * 10.0, -1.0, 1.0);
            float mixTwoAmt = starTwoAngle * 0.5 + 0.5;
            gl_FragColor.xyz = mix(nightColor, gl_FragColor.xyz, mixTwoAmt * magS);
            if (magTertiary > 0.0) {
                vec4 posTertiary = viewMatrix * vec4(dirTertiary, 0.0);
                vec3 relDirTertiary = normalize(posTertiary.xyz);
                float magT = clamp(magTertiary, 0.0, 1.0);
                float starThreeAngle = dot(norm, relDirTertiary);
                starThreeAngle = clamp(starThreeAngle * 10.0, -1.0, 1.0);
                float mixThreeAmt = starThreeAngle * 0.5 + 0.5;
                gl_FragColor.xyz = mix(nightColor, gl_FragColor.xyz, mixThreeAmt * magT);
            }
        }
    }
}
