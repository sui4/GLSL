// shadertoy
// レイマーチング(sphere)
// modによる反復
const float size = 0.5;
const float eps = 0.001;

// modを適用した位置を返す
vec3 trans(vec3 pos) {
    return mod(pos, 3.) - 1.5;
}

float sphere(vec3 pos, float rad) {
    vec3 rPos = trans(pos); 
    return length(rPos) - rad;
}

float box(vec3 pos, float size) {
    vec3 rPos = abs(trans(pos));
    return length(max(rPos - vec3(size), 0.));
}

// distance function
float df(vec3 pos, float size) {
    return box(pos, size);
    return sphere(pos, size);
}
// 微分で法線を求める
vec3 getNormal(vec3 pos, float size) {
    float d = 0.0001;
    return normalize(vec3(
        df(pos + vec3(d, 0., 0.), size) - df(pos - vec3(d, 0., 0.), size),
        df(pos + vec3(0., d, 0.), size) - df(pos - vec3(0., d, 0.), size),
        df(pos + vec3(0., 0., d), size) - df(pos - vec3(0., 0., d), size)
    ));
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 pos = (fragCoord * 2. - iResolution.xy)/ min(iResolution.x, iResolution.y);
    vec3 cameraPos = vec3(0., 0., 10.);
    float screenZ = cameraPos.z - 4.;
    vec3 lightDir = normalize(vec3(-0.5, -0.8, -1.));
    vec3 color = vec3(0.);

    vec3 rayDir = normalize(vec3(pos, screenZ) - cameraPos);
    vec3 rayPos = vec3(pos, screenZ);
    for (int i=0; i < 100; i++) {
        float dist = df(rayPos, size);
        
        if (dist < eps) {
            vec3 n = getNormal(rayPos, size);
            float intensity = clamp(dot(n, -lightDir), 0.1, 1.0);
            color = vec3(intensity);
            break;
        }
        rayPos = rayPos + rayDir * dist;
    }
    fragColor = vec4(color, 1.);
}