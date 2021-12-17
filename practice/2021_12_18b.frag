/*  shadertoy
    - オブジェクトの重なりの考慮
    - smooth min
*/
// variable
const float EPS = 0.00001;
const float PI = 3.14159265;
float fov = PI / 6.;
vec3 co = vec3(0., 0., 2.);
vec3 lDir = normalize(vec3(0., -1.5, -1.));
const float size = 0.5;

// functions
float smoothMin(float d1, float d2, float k) {
    float h = exp(-k * d1) + exp(-k * d2);
    return -log(h) / k;
}
float dfTorus(vec3 pos, vec2 s) {
    vec2 rp = vec2(length(pos.xy) - s.x , pos.z);
    return length(rp) - s.y;
}
float dfBox(vec3 pos) {
    vec3 c = vec3(0., -0.3, 0.);
    return length(max(abs(pos - c) - vec3(size * 1.5, 0.1, size), 0.)) - 0.1;
}
float df(vec3 pos) {
    float d1 = dfBox(pos);
    float d2 = dfTorus(pos, vec2(size * 1.3, size * 0.3));
    // min = or, max = and
    return smoothMin(d1, d2, 10.);
    return min(d1, d2); // 和集合: どちらかに衝突してる場合
    return max(d1, d2); // 共通部分: 両方に衝突してる場合
    return max(d1, -d2); // d1 かつ not d2
    return max(-d1, d2); // not d1 かつ d2
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
    ro = co;
    for (int i=0; i < 124; i++) {
        float dist = df(ro);
        if(dist < EPS) {
            vec3 n = getNormal(ro);
            vec3 c = vec3(1.) * clamp(-dot(n, lDir), 0.1, 1.);
            fragColor = vec4(c, 1.);
            return;
        }
        ro = ro + rd * dist;
    }
    fragColor = vec4(vec3(0.), 1.);
}