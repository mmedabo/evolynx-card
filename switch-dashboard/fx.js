/* Visual effects only: shader background + pointer sheen. No data logic. */
(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce)document.querySelectorAll('svg.logo animate').forEach(a=>a.remove());
const c=document.getElementById('bg');if(!c)return;
const gl=c.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});
if(!gl){c.remove();return;} // CSS gradient on body stays as fallback
const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const fs=`precision mediump float;uniform vec2 r;uniform float t;
float n(vec2 p){return sin(p.x)*sin(p.y);}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*3.;float tt=t*.05;
for(int i=1;i<4;i++){float f=float(i);p+=vec2(.6/f*sin(f*p.y+tt+.3*f),.6/f*cos(f*p.x+tt*1.3+.5*f));}
float a=.5+.5*sin(p.x),b=.5+.5*cos(p.y);
vec3 navy=vec3(.04,.07,.19),indigo=vec3(.19,.17,.52),teal=vec3(.03,.42,.45);
vec3 col=mix(navy,indigo,a);col=mix(col,teal,b*.55);
col+=vec3(.25,.35,.55)*pow(max(0.,sin(p.x+p.y)),12.)*.25;
col*=.85+.15*uv.y;gl_FragColor=vec4(col,1.);}`;
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
const v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f){c.remove();return}
const pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){c.remove();return}
gl.useProgram(pr);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
const ur=gl.getUniformLocation(pr,'r'),ut=gl.getUniformLocation(pr,'t');
const small=Math.min(innerWidth,innerHeight)<700;
function size(){const scale=small?.35:Math.min(devicePixelRatio||1,1.5)*.5;const w=Math.max(1,Math.round(innerWidth*scale)),h=Math.max(1,Math.round(innerHeight*scale));if(c.width!==w||c.height!==h){c.width=w;c.height=h;gl.viewport(0,0,w,h)}gl.uniform2f(ur,w,h)}
let raf=0,t0=performance.now(),last=0;
function draw(now){gl.uniform1f(ut,(now-t0)/1000+20.);gl.drawArrays(gl.TRIANGLES,0,3)}
function loop(now){raf=requestAnimationFrame(loop);if(now-last<(small?50:33))return;last=now;draw(now)}
size();draw(performance.now());
addEventListener('resize',()=>{size();if(reduce||!raf)draw(performance.now())});
c.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;c.remove()});
if(!reduce){raf=requestAnimationFrame(loop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(!raf){raf=requestAnimationFrame(loop)}});}
/* pointer-following specular sheen (desktop only) */
if(matchMedia('(hover: hover) and (pointer: fine)').matches&&!reduce){
 document.addEventListener('pointermove',e=>{const el=e.target.closest&&e.target.closest('.tile,.card,.login .box,header');if(!el)return;const b=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-b.left)+'px');el.style.setProperty('--my',(e.clientY-b.top)+'px')},{passive:true});}
})();
