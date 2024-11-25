varying vec3 vNormal;
varying vec3 eyeVector;

#define MAX_LIGHTS 5

uniform bool enableAtmosphere;
uniform float atmoOpacity;
uniform float atmoPower;
uniform float atmoCoefficient;
uniform vec3 atmoColor;
uniform vec3 atmoDiffusion;
//uniform vec3 atmoLightDirections[MAX_LIGHTS];
uniform vec3 atmoLightDirection;
uniform int atmoLights;


void main() {
    if (enableAtmosphere) {
        // base glow, diffusing as it expands
        float dotP = dot(vNormal, eyeVector);
        float factor = pow(dotP, atmoPower) * atmoCoefficient;
        vec3 bColor = vec3(atmoColor.r + atmoDiffusion.x,
            atmoColor.g + atmoDiffusion.y,
            atmoColor.b + atmoDiffusion.z);
        vec3 aColor = vec3(atmoColor.r + dotP * atmoDiffusion.x,
            atmoColor.g + dotP * atmoDiffusion.y,
            atmoColor.b + dotP * atmoDiffusion.z);

        // remove color from darkside
        vec3 norm = normalize(vNormal);
        float localOpacity = 1.0;
        //for (int i=0; i < atmoLights; i++) {
            vec4 posPrimary = viewMatrix * vec4(atmoLightDirection, 0.0);
            vec3 relDirPrimary = normalize(posPrimary.xyz);
        // FIXME multilight
        //    localOpacity *= 1.0 - smoothstep(0.9, -0.75, dot(norm, relDirPrimary));
        //}
        localOpacity *= 1.0 - smoothstep(0.9, -0.45, dot(norm, relDirPrimary));  // FIXME remove

        gl_FragColor = vec4(aColor, atmoOpacity * localOpacity) * factor;
    }
}
