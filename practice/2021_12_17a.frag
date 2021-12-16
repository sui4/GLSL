// shadertoy
// modによる繰り返し
float circle(vec2 pos, float radius) {
    return length(pos) - radius;
}
float rect(vec2 pos, float sidelen) {
    vec2 dist = pos - vec2(sidelen);
    return max(dist.x, dist.y);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 pos = (fragCoord * 2. -iResolution.xy) / min(iResolution.x, iResolution.y);
    pos.x = mod(pos.x, 0.3) - 0.15;
    pos.y = mod(pos.y, 0.3) - 0.15;
    vec3 col = vec3((rect(pos, 0.1) < 0.f ? 1. : 0.));
    fragColor = vec4(col, 1.);
}