uniform vec3 glowView;
uniform float glowC;
uniform float glowP;
varying float intensity;

void main() {
    vec3 vNormal = normalize( normalMatrix * normal );
    vec3 vNormel = normalize( normalMatrix * glowView );
    intensity = pow( glowC - dot(vNormal, vNormel), glowP );
}