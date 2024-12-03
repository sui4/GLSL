float box(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float sdf(vec3 p) {
    // return sphere(p, 0.05);
    return box(p,vec3(1., 1., 1.)* 0.17);
    // const float r = .1;
    // return length(p) - r;
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
};

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float zoffset = iTime;
    vec3 cp = vec3(0., 0., -1.0 + zoffset); // camera pos
    Light l;
    l.p = vec3(1., 2., 0.);
    l.i = 2.;
    l.p.z = zoffset;

    float reso = min(iResolution.x, iResolution.y);
    vec2 sp = (fragCoord - iResolution.xy * 0.5)/reso;
    
    vec3 ro = vec3(sp, 0. + zoffset);
    vec3 rd = normalize(ro - cp);
    vec3 rp = ro;
    const float EPS = 0.0001;
    vec3 col = vec3(.0);
    for(int i = 0; i < 256; ++i) {
        float ms = 0.4;
        vec3 mp = mod(rp, ms) - ms * 0.5;
        mp = vec3(
            mod(rp.x, ms) - ms * 0.5,
            rp.y + 0.5,
            mod(rp.z, ms) - ms * 0.5
        );
        float d = sdf(mp);
        if(d < EPS) {
            vec3 n = normal(mp);
            vec3 s2l = l.p - rp;
            vec3 sc = vec3(0.1, 0.3, 1.0);
            float c = dot(n, s2l);

            col = sc * c * l.i;
            // col = (n + 1.) * 0.5;
            break;
        }
        rp += rd * d;
        // rp = ro + rd * d;
    }

    // vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}
