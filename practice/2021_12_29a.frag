/* shadertoy
  - ray marching
  - boxへの球の映り込み(部分的な反射)
*/
const float EPS = 0.0001;
const float PI = 3.14159265;
const float fov = PI / 8.;
vec3 ld = normalize(vec3(0., -1., -0.));

vec3 trans(vec3 p) {
  float s = 7.;
  return mod(p, s) - s / 2.;
}

vec3 rotate(vec3 p) {
  float s = sin(iTime * 0.5);
  float c = cos(iTime * 0.5);
  mat3 m = mat3(
    c, 0., -s,
    0., 1., 0.,
    s, 0., c
  );
  return m * p;
}

float sphere(vec3 p) {
  // p = trans(p);
  vec3 center = vec3(4. * sin(iTime), 0.4, -3. + 4. * cos(iTime));
  return length(p - center) - 0.5;
}
float box(vec3 p) {
  // p = trans(p);
  p = rotate(p - vec3(0., 0., -3.));
  vec3 rp = abs(p) - vec3(1.0, 1.0, 1.0);
  return length(max(rp, 0.)) + min(max(rp.x, max(rp.y, rp.z)), 0.);
}
float df(vec3 p) {
  // p = trans(p);
  float d1 = sphere(p);
  float d2 = box(p);
  return min(d1, d2);
}

vec3 calNormal(vec3 p) {
  float d = 0.0001;
  return normalize(vec3(
    df(p + vec3(d, 0., 0.)) - df(p - vec3(d, 0., 0.)),
    df(p + vec3(0., d, 0.)) - df(p - vec3(0., d, 0.)),
    df(p + vec3(0., 0., d)) - df(p - vec3(0., 0., d))
  ));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 pos = (fragCoord * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec3 ro, rd;
  ro = vec3(0., 0., 2.);
  rd = vec3(sin(fov * pos), -cos(fov));
  vec3 col = vec3(0.3);
  int refNum = 0;
  for(int i=0; i < 128; i++) {
    float dbox = refNum == 0 ? box(ro) : 2000.;
    float dsphere = sphere(ro);

    if(abs(dbox) < EPS) {
      vec3 n = calNormal(ro);
      // col = vec3(0.8, 0.9, 0.3);
      rd = reflect(rd, n);
      refNum = 1;
      continue;
    }
    if(abs(dsphere) < EPS) {
      vec3 n = calNormal(ro);
      float l = clamp(dot(-ld, n), 0.2, 1.);
      col = vec3(l);
      break;
    }
    if(refNum == 0) {
      ro = ro + rd * min(dbox, dsphere);
    }
    else {
      ro = ro + rd * dsphere;
    }
    if(i == 127 && refNum == 1) {
      col = vec3(0.);
    }
  }
  fragColor = vec4(col, 1.);
}