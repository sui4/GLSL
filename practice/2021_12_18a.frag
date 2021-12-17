/*  shadertoy
    - fovを考慮したレイの定義について
    - planeの距離関数
    - torusの距離関数
    - 複数オブジェクトの描画
*/

// const
const float PI = 3.14159265;
const float EPS = 0.0001;
// camera
vec3 cPos = vec3(0., 0., 2.);
const float angle = 60.;
const float fov = 2. * PI * angle * 0.5 / 360.;

// light 
const vec3 lDir = normalize(vec3(0., -1.5, -1.));
//
vec3 trans(vec3 p) {
    return p;
    float s = 2.;
    return mod(p, s) - s/2.;
}
const float SIZE = 0.4;
float dfPlane(vec3 pos, float height) {
    return length(pos - vec3(0., height, 0.));
}
float dfPlane(vec3 pos, vec3 normal) {
    // + 1. はオフセット
    return dot(pos, normal) + 1.;
}
// r: ドーナツの半径 - thickness, 
// thickness: 太さ
float dfTorus(vec3 pos, float r, float thickness) {
    // xy平面上での距離を使って次元を落とす
    // xz(yz)平面へと射影する
    vec2 rp = vec2(length(pos.xy) - r , pos.z);
    return length(rp) - thickness;
}
float df(vec3 pos, float s) {
    float plane = dfPlane(pos, normalize(vec3(0., 1., 0.)));
    float torus = dfTorus(pos, s, s * 0.3);
    return min(plane, torus);
}
vec3 getNormal(vec3 p, float s) {
    float d = 0.0001;
    return normalize(vec3(
        df(p + vec3(d, 0., 0.), s) - df(p - vec3(d, 0., 0.), s),
        df(p + vec3(0., d, 0.), s) - df(p - vec3(0., d, 0.), s),
        df(p + vec3(0., 0., d), s) - df(p - vec3(0., 0., d), s)
    ));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 pos = (2. * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec3 color = vec3(0.);
    vec3 ro, rd;
    rd = normalize(vec3(sin(fov) * pos, -cos(fov)));
    ro = cPos;
    for(int i=0; i < 256 * 3; i++) {
        float dist = df(trans(ro), SIZE);
        if (dist < EPS) {
            vec3 n = getNormal(ro, SIZE);
            color = vec3(1.) * clamp(-dot(n, lDir), 0.1, 1.0);
        }
        ro = ro + rd * dist;
    }
    fragColor = vec4(color, 1.);
}