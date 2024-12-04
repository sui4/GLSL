float box(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float sdf(vec3 p) {
    float ms = 1.8;
    vec2 grid = floor(vec2(p.xz/ms));
    float t = mod(iTime, 100.);
    float height = sin(cos(grid.x + grid.y)) * (sin(t + grid.x * grid.y * t * 0.0004));
    vec3 mp = vec3(
        mod(p.x, ms) - ms * 0.5,
        p.y + 3.5,
        mod(p.z, ms) - ms * 0.5
    );
    p = mp;
    // return sphere(p, 0.05);
    float d = box(p,vec3(1., 1.5 * (height + 1.), 1.)* 0.4 * ms);
    return d * 0.2;
    // return min(d, length(mp.xz) * .4);
}

vec3 normal(vec3 ro) {
    const float d = 0.01;
    const vec3 x = vec3(1., 0., 0.) * d;
    const vec3 y = vec3(0., 1., 0.) * d;
    const vec3 z = vec3(0., 0., 1.) * d;
    return normalize(vec3(
        sdf(ro + x) - sdf(ro - x),
        sdf(ro + y) - sdf(ro - y),
        sdf(ro + z) - sdf(ro - z)
    ));
}
struct Light {
    vec3 p;
    float i; // intensity
    vec3 d;
};

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float zoffset = mod(iTime, 100.);
    vec3 cp = vec3(0., .6, -1.0 + zoffset); // camera pos
    Light l;
    l.p = vec3(1., 1., -1.);
    l.i = 0.8;
    l.p.z = zoffset;
    l.d = vec3(-.4, 1., -1.);

    float reso = min(iResolution.x, iResolution.y);
    vec2 sp = (fragCoord - iResolution.xy * 0.5)/reso;
    
    vec3 ro = vec3(sp, 0. + zoffset);
    vec3 rd = normalize(ro - cp);
    vec3 rp = ro;
    const float EPS = 0.0001;
    vec3 col = vec3(.0);
    for(int i = 0; i < 256; ++i) {
        float d = sdf(rp);
        if(d < EPS) {
            vec3 n = normal(rp);
            vec3 s2l = l.p - rp;
            vec3 sc = vec3(0.1, 0.3, 1.0);
            float c = dot(n, s2l);
            // float c = dot(n, l.d);

            col = sc * c * l.i;
            // col = (n + 1.) * 0.5;
            break;
        }
        rp += rd * d;
    }

    fragColor = vec4(col,1.0);
}
