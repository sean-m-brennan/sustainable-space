uniform bool enableAtmosphere;

varying vec3 vNormal;
varying vec3 eyeVector;

void main() {
    if (enableAtmosphere) {
        // FIXME uniform
        vec4 mvPos = modelViewMatrix * vec4(position, 1.06);  // controls atmo thickness
        vNormal = normalize(normalMatrix * normal);
        eyeVector = normalize(mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
    }
}