/* shadertoy
    - 円柱のdistance function
    - 回転
*/
const float EPS = 0.00001;
const float PI = 3.14159265;
const float fov = PI / 4.;

vec3 cp = vec3(0., 0., 2.);
vec3 ld = normalize(vec3(0., -1.5, -1.));

// angle: radian
// axis: 各軸に対する回転の程度 0 ~ 1
vec3 rotate(vec3 p, float angle, vec3 axis) {
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    mat3 m = mat3(
        a.x * a.x * r + c,       a.y * a.x * r + a.z * s, a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s, a.y * a.y * r + c,       a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s, a.y * a.z * r - a.x * s, a.z * a.z * r + c
    );
    return m * p;
}

float Torus(vec3 p, vec3 c, vec2 s) {
    vec3 rp = p - c;
    vec2 r = vec2(length(p.xy) - s.x, rp.z);
    return length(r) - s.y;
}

float box(vec3 p, vec3 c, vec3 s) {
    vec3 rp = p - c;
    return length(max(abs(rp) - s, 0.));
}

float cylinder(vec3 p, vec3 c, vec2 s) {
    vec3 rp = p - c;
    vec2 d = abs(vec2(length(rp.xy), rp.z)) - s;
    return min(max(d.x, d.y), 0.) // 両方負の場合の長さ
        + length(max(d, 0.)) // 両方正の場合
        - 0.1; // エッジに丸みをもたせる
    
    // vec3 dir = vec3(0., 1., 0.);
    // vec3 rp = abs(p - c) - dir * s.x;
    // if (dot(rp, dir) > 0.) {
    //     return rp.y;
    // } 
    // return length(rp.xz) - s.y;
}

float df(vec3 pos) {
    vec3 p = rotate(pos, radians(iTime * 10.0), vec3(1., 0., 1.));
    // return cylinder(p, vec3(0.), vec2(0.5, 0.4));
    return box(p, vec3(0.), vec3(0.5));
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
    for (int i=0; i<128; i++) {
        float dist = df(ro);
        if (dist < EPS) {
            vec3 n = getNormal(ro);
            float l = clamp(-dot(n, ld), 0.1, 1.);
            fragColor = vec4(vec3(l), 1.);
            return;
        }
        ro = ro + rd * dist;
    }
    fragColor = vec4(vec3(0.), 1.);
}
