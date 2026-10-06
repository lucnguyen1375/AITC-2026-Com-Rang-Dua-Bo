import { useEffect, useRef, useState } from 'react';
import { useJsonState } from '../services/storage';
import * as THREE from 'three';
import { Hand, Pause, Play, MoveUpRight } from 'lucide-react';
export default function CoachAvatar({ talking }: { talking: boolean }) {
 const mount = useRef<HTMLDivElement>(null); const talkingRef = useRef(talking); const waveRef = useRef(0); const pausedRef = useRef(false);
 const [paused,setPaused] = useJsonState('avatar-paused',false); const [fallback,setFallback] = useState(false);
 useEffect(()=>{talkingRef.current=talking;},[talking]);
 useEffect(()=>{pausedRef.current=paused;},[paused]);
 useEffect(()=>{
  const host=mount.current;if(!host)return;
  let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFallback(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(33,1,.1,100);camera.position.set(3.2,2.4,6.5);camera.lookAt(0,1.65,0);
  scene.add(new THREE.HemisphereLight(0xf4f6ff,0x7082c4,3));const key=new THREE.DirectionalLight(0xfff5e5,4);key.position.set(3,6,5);scene.add(key);const rim=new THREE.DirectionalLight(0x6688ff,3);rim.position.set(-3,3,-3);scene.add(rim);
  const white=new THREE.MeshStandardMaterial({color:0xf0f3ff,roughness:.38});const blue=new THREE.MeshStandardMaterial({color:0x2349d8,roughness:.65});const dark=new THREE.MeshStandardMaterial({color:0x122244,roughness:.42});const orange=new THREE.MeshStandardMaterial({color:0xff8950,roughness:.6});const sole=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7});
  const model=new THREE.Group();scene.add(model);
  function mesh(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Group|THREE.Mesh,x:number,y:number,z:number,sx=1,sy=1,sz=1){const shape=new THREE.Mesh(geometry,material);shape.position.set(x,y,z);shape.scale.set(sx,sy,sz);parent.add(shape);return shape;}
  const sphere=(material:THREE.Material,parent:THREE.Group|THREE.Mesh,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>mesh(new THREE.SphereGeometry(1,40,28),material,parent,x,y,z,sx,sy,sz);
  const capsule=(material:THREE.Material,parent:THREE.Group|THREE.Mesh,x:number,y:number,z:number,r:number,length:number)=>mesh(new THREE.CapsuleGeometry(r,length,8,24),material,parent,x,y,z);
  const body=sphere(blue,model,0,1.79,0,.46,.60,.29);sphere(white,model,0,2.24,0,.18,.13,.17);
  mesh(new THREE.BoxGeometry(.035,.7,.02),white,body,0,0,1.01);const badge=sphere(orange,model,-.17,1.98,.282,.085,.09,.02);badge.rotation.z=-.3;
  sphere(dark,model,0,1.22,0,.43,.23,.29);
  const head=new THREE.Group();head.position.set(0,2.65,0);model.add(head);sphere(white,head,0,0,0,.41,.43,.36);sphere(dark,head,0,-.02,.29,.325,.23,.115);
  sphere(white,head,-.12,.018,.395,.035,.055,.018);sphere(white,head,.12,.018,.395,.035,.055,.018);
  const smile=mesh(new THREE.TorusGeometry(.064,.008,8,30,Math.PI),orange,head,0,-.05,.409);smile.rotation.z=Math.PI;
  for(const side of [-1,1]){mesh(new THREE.CylinderGeometry(.13,.13,.07,28),orange,head,side*.415,0,0).rotation.z=Math.PI/2;sphere(white,head,side*.46,0,0,.045,.085,.085);}
  const band=mesh(new THREE.TorusGeometry(.405,.026,12,60,Math.PI),orange,head,0,.0,-.04);band.rotation.z=0;
  const arms:THREE.Group[]=[];
  for(const side of [-1,1]){
   const arm=new THREE.Group();arm.position.set(side*.43,2.08,0);arm.rotation.z=side*.13;model.add(arm);arms.push(arm);
   capsule(blue,arm,side*.03,-.16,0,.15,.2);capsule(white,arm,side*.055,-.46,.02,.115,.28);sphere(orange,arm,side*.06,-.72,.02,.13,.06,.13);sphere(white,arm,side*.06,-.80,.03,.125,.12,.10);
   const leg=new THREE.Group();leg.position.set(side*.21,1.15,0);leg.rotation.z=side*-.055;model.add(leg);capsule(dark,leg,0,-.21,0,.16,.24);capsule(white,leg,0,-.59,.02,.12,.28);sphere(orange,leg,0,-.9,.10,.19,.12,.31);sphere(sole,leg,0,-.99,.10,.20,.04,.32);mesh(new THREE.BoxGeometry(.17,.025,.15),white,leg,0,-.85,.32);
  }
  const platform=mesh(new THREE.CylinderGeometry(.75,.85,.10,64),white,scene as unknown as THREE.Group,0,.07,0);platform.rotation.y=.2;
  const ring=mesh(new THREE.TorusGeometry(.8,.016,8,64),orange,scene as unknown as THREE.Group,0,.14,0);ring.rotation.x=-Math.PI/2;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const clock=new THREE.Clock();let frame=0;let pointerX=0;let pointerY=0;let visible=true;let inView=true;let lastDraw=0;let dirty=true;
  const resize=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.zoom=width/height>1.2 && height>250 ? 1.35 : 1;camera.updateProjectionMatrix();dirty=true;});resize.observe(host);
  const pointer=(event:PointerEvent)=>{const rect=host.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5;dirty=true;};host.addEventListener('pointermove',pointer);
  const reset=()=>{pointerX=0;pointerY=0;dirty=true;};host.addEventListener('pointerleave',reset);const visibility=()=>{visible=!document.hidden;};document.addEventListener('visibilitychange',visibility);
  const intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;dirty=true;});intersection.observe(host);const animate=()=>{frame=requestAnimationFrame(animate);if(!visible||!inView)return;const t=clock.getElapsedTime();const moving=!pausedRef.current&&!reduced.matches;if(t-lastDraw<1/30 || (!moving&&!dirty))return;lastDraw=t;dirty=false;model.position.y=moving?Math.sin(t*1.8)*.025:0;model.rotation.y=THREE.MathUtils.lerp(model.rotation.y,pointerX*.3,.07);head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,pointerX*.35,.08);head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,pointerY*.16,.08);const wave=moving&&(talkingRef.current||performance.now()<waveRef.current);arms[1].rotation.z=wave?-.85+Math.sin(t*7)*.15:.13;arms[0].rotation.z=-.13+(moving?Math.sin(t*1.8)*.03:0);renderer.render(scene,camera);};animate();
  return()=>{cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',reset);document.removeEventListener('visibilitychange',visibility);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(m=>m.dispose());}});renderer.dispose();host.replaceChildren();};
 },[]);
 return <section className="coach-stage" aria-label="Vi, trợ lý 3D đồng hành"><div className="coach-stage-heading"><span className="live-dot"/><span>Luôn ở đây cùng bạn</span><MoveUpRight size={15}/></div><div className="coach-name"><h2>Chào bạn,<br/>{' '}mình là <span>Vi.</span></h2><p>Cùng bạn ăn tốt,<br/>tập đúng nhịp.</p></div><div className="avatar-mount" ref={mount} role="img" aria-label="Trợ lý Vi 3D mặc đồ thể thao xanh và cam, chuyển động và chào bạn">{fallback&&<div className="avatar-fallback"><Hand size={60}/><p>Thiết bị chưa hỗ trợ 3D.<br/>Bạn vẫn có thể trò chuyện với Vi.</p></div>}</div><div className="coach-controls"><button className="secondary" onClick={()=>{waveRef.current=performance.now()+2500;}}><Hand size={17}/>Chào Vi</button><button className="icon-button" aria-label={paused?'Bật chuyển động':'Tạm dừng chuyển động'} onClick={()=>{pausedRef.current=!paused;setPaused(!paused);}}>{paused?<Play size={17}/>:<Pause size={17}/>}</button></div><div className="coach-caption"><span className={talking?'coach-status talking':'coach-status'}>{talking?'Vi đang phản hồi':'Sẵn sàng lắng nghe'}</span><p>Nhân vật 3D · đồng hành cùng bạn</p></div></section>;
}
