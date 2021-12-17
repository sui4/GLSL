/*  shadertoy
    - smoothMin, アニメーション
*/
const float PI = 3.14159265;
const float EPS = 0.00001;
float fov = PI / 4.;
vec3 cp = vec3(0., 0., 2.);
vec3 ld = vec3(0., -1.5, -1.);

// functions
float smoothMin(float d1, float d2, float k) {
    float h = exp(-k * d1) + exp(-k * d2);
    return -log(h) / k;
}
float dfSphere(vec3 pos, vec3 center, float rad) {
    return length(pos - center) - rad;
}
float dfTorus(vec3 pos, vec3 center, vec2 size) {
    vec3 rp = pos - center;
    vec2 p = vec2(length(rp.xy) - size.x , rp.z);
    return length(p) - size.y;
}
float dfBox(vec3 pos, vec3 center, float size) {
    vec3 rp = pos - center;
    return length(max(abs(rp) - vec3(size), 0.)) - 0.1;
}
float df(vec3 pos) {
    vec3 c = vec3(cos(iTime), sin(iTime) * 1.5, 0.);
    float d1 = dfSphere(pos, c, 0.5);
    c = vec3(sin(iTime * 1.5) * 1.3, 0., 0.);
    float d2 = dfSphere(pos, c, 0.5);
    float d3 = dfTorus(pos, vec3(0.), vec2(1., 0.3));
    float r1 = smoothMin(d1, d2, 10.);
    float r2 = smoothMin(d2, d3, 10.);
    float r3 = smoothMin(d3, d1, 10.);    
    
    return smoothMin(r1, smoothMin(r2, r3, 10.), 10.);

}
vec3 getNormal(vec3 pos) {
    float d = 0.0001;
    return normalize(vec3(
        df(pos + vec3(d, 0., 0.)) - df(pos - vec3(d, 0., 0.)),
        df(pos + vec3(0., d, 0.)) - df(pos - vec3(0., d, 0.)),
        df(pos + vec3(0., 0., d)) - df(pos - vec3(0., 0., d))
    ));
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 pos = (fragCoord * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec3 ro, rd;
    rd = normalize(vec3(sin(fov) * pos, -cos(fov)));
    ro = cp;
    for(int i=0; i< 124; i++) {
        float dist = df(ro);
        if (dist < EPS) {
            vec3 n = getNormal(ro);
            vec3 c = vec3(1.) * clamp(-dot(n, ld), 0.1, 1.);
            fragColor = vec4(c, 1.);
            return;
        }
        ro = ro + rd * dist;
    }
    fragColor = vec4(vec3(0.), 1.);
}