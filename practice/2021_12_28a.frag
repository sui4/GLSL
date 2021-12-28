/* shadertoy
  - ray marching
  - trans関数の適用タイミングについて：
  df関数内で適用するのみだと，変形後の形状に基づいてライティングされる
  main関数内で適用し，返還後の座標をdf, normal関数に与えると，変形前の形状でライティングし，それをひねったり増やしたりする，という感じになる
*/
const float EPS = 0.00001;
const float PI = 3.14159265;
const float fov = PI / 6.;
const vec3 cPos = vec3(0., 0., 2.);

const vec3 ld = normalize(vec3(0., -1., -0.7));

vec3 twist(vec3 p, float power) {
  float s = sin(p.y * power);
  float c = cos(p.y * power);
  mat3 m = mat3(
    c, 0., -s,
    0., 1., 0.,
    s, 0., c
  );
  return m * p;
}
vec3 rotate(vec3 p) {
  float s = sin(iTime);
  float c = cos(iTime);
  mat3 m = mat3(
    c, 0., -s,
    0., 1., 0.,
    s, 0., c
  );
  return m * p;
}

vec3 trans(vec3 p) {
  float s = 5.;
  vec3 t =  mod(p, s) - s / 2.;
  return rotate(twist(p, 2.));
}

float df(vec3 p) {
  p = trans(p);
  vec3 q = abs(p) - vec3(0.5);
  return length(max(q,0.)) + min(max(q.x,max(q.y,q.z)),0.) - 0.1;
  return length(p) - 0.3;
}
vec3 calNormal(vec3 p) {
  float d = 0.001;
  return normalize(vec3(
    df(p + vec3(d, 0., 0.)) - df(p - vec3(d, 0., 0.)),
    df(p + vec3(0., d, 0.)) - df(p - vec3(0., d, 0.)),
    df(p + vec3(0., 0., d)) - df(p - vec3(0., 0., d))
  ));
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 pos = (fragCoord * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);

  vec3 ro, rd;
  rd = vec3(sin(fov * pos), -cos(fov));
  ro = cPos;
  vec3 col = vec3(0.1, 0.3, 0.4);
  for (int i = 0; i < 128; i++) {
    float dist = df(ro);
    if(abs(dist) < EPS) {
      vec3 n = calNormal(ro);
      float l = clamp(dot(-ld, n), 0.2, 1.0);
      col = vec3(1.) * l;
      break;
    }
    ro = ro + rd * dist * 0.8;
  }
  fragColor = vec4(col, 1.);
}