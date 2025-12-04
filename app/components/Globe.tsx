'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

const vertex = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform float u_time;
  uniform float u_maxExtrusion;

  void main() {

    vec3 newPosition = position;
    if(u_maxExtrusion > 1.0) newPosition.xyz = newPosition.xyz * u_maxExtrusion + sin(u_time);
    else newPosition.xyz = newPosition.xyz * u_maxExtrusion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

  }
`;

const fragment = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform float u_time;
  uniform float u_brightness;

  vec3 colorA = vec3(0.196, 0.631, 0.886);
  vec3 colorB = vec3(0.192, 0.384, 0.498);
  vec3 brightGreen = vec3(0.0, 1.0, 0.4);

  void main() {

    vec3  color = vec3(0.0);
    float pct   = abs(sin(u_time));
          color = mix(colorA, colorB, pct);
    
    // 当跳跃时（u_brightness > 1.0），增加亮度并混合亮绿色
    if (u_brightness > 1.0) {
      float brightnessFactor = (u_brightness - 1.0) * 2.0; // 映射到 0-2
      color = mix(color, brightGreen, brightnessFactor * 0.8);
      color *= (1.0 + brightnessFactor * 1.5); // 增加整体亮度
    }

    gl_FragColor = vec4(color, 1.0);

  }
`;

export default function GlobeComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    controls: OrbitControls | null;
    baseMesh: THREE.Mesh | null;
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    baseMesh: null,
    animationId: null,
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    let sizes: { width: number; height: number };
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let raycaster: THREE.Raycaster;
    let mouse: THREE.Vector2;
    let isIntersecting: boolean;
    let twinkleTime: number;
    let materials: Array<{ material: THREE.ShaderMaterial; lon: number; lat: number }>;
    let material: THREE.ShaderMaterial;
    let baseMesh: THREE.Mesh;
    let minMouseDownFlag: boolean;
    let mouseDown: boolean;
    let grabbing: boolean;

    const setScene = () => {
      sizes = {
        width: container.offsetWidth,
        height: container.offsetHeight,
      };

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        30,
        sizes.width / sizes.height,
        1,
        1000
      );
      camera.position.z = 100;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const pointLight = new THREE.PointLight(0x081b26, 17, 200);
      pointLight.position.set(-50, 0, 60);
      scene.add(pointLight);
      scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1.5));

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      isIntersecting = false;
      minMouseDownFlag = false;
      mouseDown = false;
      grabbing = false;

      setControls();
      setBaseSphere();
      setShaderMaterial();
      setMap();
      resize();
      listenTo();

      // Store references
      sceneRef.current.scene = scene;
      sceneRef.current.camera = camera;
      sceneRef.current.renderer = renderer;
      sceneRef.current.controls = controls;
      sceneRef.current.baseMesh = baseMesh;
    };

    const setControls = () => {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.2;
      controls.enableDamping = true;
      controls.enableRotate = true;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.minPolarAngle = Math.PI / 2 - 0.5;
      controls.maxPolarAngle = Math.PI / 2 + 0.5;
    };

    const setBaseSphere = () => {
      const baseSphere = new THREE.SphereGeometry(19.5, 35, 35);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a4a6b,
        transparent: true,
        opacity: 0.9,
      });
      baseMesh = new THREE.Mesh(baseSphere, baseMaterial);
      scene.add(baseMesh);
    };

    const setShaderMaterial = () => {
      twinkleTime = 0.03;
      materials = [];
      material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          u_time: { value: 1.0 },
          u_maxExtrusion: { value: 1.0 },
          u_brightness: { value: 1.0 },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      });
    };

    const setMap = () => {
      const activeLatLon: { [key: number]: number[] } = {};
      const dotSphereRadius = 20;

      const readImageData = (imageData: Uint8ClampedArray) => {
        for (
          let i = 0, lon = -180, lat = 90;
          i < imageData.length;
          i += 4, lon++
        ) {
          if (!activeLatLon[lat]) activeLatLon[lat] = [];

          const red = imageData[i];
          const green = imageData[i + 1];
          const blue = imageData[i + 2];

          if (red < 80 && green < 80 && blue < 80)
            activeLatLon[lat].push(lon);

          if (lon === 180) {
            lon = -180;
            lat--;
          }
        }
      };

      const visibilityForCoordinate = (lon: number, lat: number) => {
        let visible = false;

        if (!activeLatLon[lat] || !activeLatLon[lat].length) return visible;

        const closest = activeLatLon[lat].reduce((prev, curr) => {
          return Math.abs(curr - lon) < Math.abs(prev - lon) ? curr : prev;
        });

        if (Math.abs(lon - closest) < 0.5) visible = true;

        return visible;
      };

      const calcPosFromLatLonRad = (lon: number, lat: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(dotSphereRadius * Math.sin(phi) * Math.cos(theta));
        const z = dotSphereRadius * Math.sin(phi) * Math.sin(theta);
        const y = dotSphereRadius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
      };

      const createMaterial = (timeValue: number, lon: number, lat: number) => {
        const mat = material.clone();
        mat.uniforms.u_time.value = timeValue * Math.sin(Math.random());
        materials.push({ material: mat, lon, lat });
        return mat;
      };

      const setDots = () => {
        const dotDensity = 2.5;
        let vector = new THREE.Vector3();

        for (let lat = 90, i = 0; lat > -90; lat--, i++) {
          const radius =
            Math.cos(Math.abs(lat) * (Math.PI / 180)) * dotSphereRadius;
          const circumference = radius * Math.PI * 2;
          const dotsForLat = circumference * dotDensity;

          for (let x = 0; x < dotsForLat; x++) {
            const long = -180 + (x * 360) / dotsForLat;

            if (!visibilityForCoordinate(long, lat)) continue;

            vector = calcPosFromLatLonRad(long, lat);

            const dotGeometry = new THREE.CircleGeometry(0.1, 5);
            dotGeometry.lookAt(vector);
            dotGeometry.translate(vector.x, vector.y, vector.z);

            const m = createMaterial(i, long, lat);
            const mesh = new THREE.Mesh(dotGeometry, m);

            scene.add(mesh);
          }
        }
      };

      const image = new Image();
      image.onload = () => {
        const imageCanvas = document.createElement('canvas');
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;

        const context = imageCanvas.getContext('2d');
        if (!context) return;
        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(
          0,
          0,
          imageCanvas.width,
          imageCanvas.height
        );
        readImageData(imageData.data);

        setDots();
      };

      image.src = '/world_alpha_mini.jpg';
    };

    const resize = () => {
      sizes = {
        width: container.offsetWidth,
        height: container.offsetHeight,
      };

      if (window.innerWidth > 700) camera.position.z = 100;
      else camera.position.z = 140;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
    };

    const mousemove = (event: MouseEvent) => {
      isIntersecting = false;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(baseMesh);
      if (intersects[0]) {
        isIntersecting = true;
        if (!grabbing) document.body.style.cursor = 'pointer';
      } else {
        if (!grabbing) document.body.style.cursor = 'default';
      }
    };

    const mousedown = () => {
      if (!isIntersecting) return;

      mouseDown = true;
      minMouseDownFlag = false;

      setTimeout(() => {
        minMouseDownFlag = true;
        if (!mouseDown) mouseup();
      }, 500);

      document.body.style.cursor = 'grabbing';
      grabbing = true;
    };

    const mouseup = () => {
      mouseDown = false;
      if (!minMouseDownFlag) return;

      grabbing = false;
      if (isIntersecting) document.body.style.cursor = 'pointer';
      else document.body.style.cursor = 'default';
    };

    const listenTo = () => {
      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', mousemove);
      window.addEventListener('mousedown', mousedown);
      window.addEventListener('mouseup', mouseup);
    };

    let animationId: number | null = null;

    // 判断是否在指定地区（中日韩、美国、欧洲）
    const isInTargetRegion = (lon: number, lat: number): boolean => {
      // 中日韩地区
      // 中国：约 73°E-135°E, 18°N-54°N
      // 日本：约 129°E-146°E, 24°N-46°N
      // 韩国：约 124°E-132°E, 33°N-43°N
      const inChina = lon >= 73 && lon <= 135 && lat >= 18 && lat <= 54;
      const inJapan = lon >= 129 && lon <= 146 && lat >= 24 && lat <= 46;
      const inKorea = lon >= 124 && lon <= 132 && lat >= 33 && lat <= 43;
      
      // 美国：约 66°W-125°W, 24°N-50°N（注意经度是负数）
      const inUSA = lon >= -125 && lon <= -66 && lat >= 24 && lat <= 50;
      
      // 欧洲：约 10°W-40°E, 35°N-72°N
      const inEurope = lon >= -10 && lon <= 40 && lat >= 35 && lat <= 72;
      
      return inChina || inJapan || inKorea || inUSA || inEurope;
    };

    const render = () => {
      materials.forEach((el) => {
        el.material.uniforms.u_time.value += twinkleTime;
        
        // 只对指定地区的粒子进行随机跳跃
        if (isInTargetRegion(el.lon, el.lat)) {
          // 随机跳跃：每帧有 0.1% 的概率让粒子跳跃
          if (Math.random() < 0.001) {
            // 增加跳跃强度（1.15 到 1.25 之间），让跳跃更明显
            const jumpValue = 1.15 + Math.random() * 0.1;
            // 亮度增强（1.5 到 2.5 之间），让闪烁更显眼
            const brightnessValue = 1.5 + Math.random() * 1.0;
            
            // 同时动画化大小和亮度
            gsap.to(el.material.uniforms.u_maxExtrusion, {
              value: jumpValue,
              duration: 0.15 + Math.random() * 0.15,
              ease: 'power2.out',
            });
            
            gsap.to(el.material.uniforms.u_brightness, {
              value: brightnessValue,
              duration: 0.1 + Math.random() * 0.1,
              ease: 'power2.out',
              onComplete: () => {
                // 快速恢复亮度
                gsap.to(el.material.uniforms.u_brightness, {
                  value: 1.0,
                  duration: 0.2 + Math.random() * 0.2,
                  ease: 'power2.in',
                });
              },
            });
            
            // 延迟恢复大小，让效果更持久
            gsap.to(el.material.uniforms.u_maxExtrusion, {
              value: 1.0,
              duration: 0.3 + Math.random() * 0.3,
              delay: 0.1,
              ease: 'power2.in',
            });
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };

    setScene();
    render();

    return () => {
      // Cleanup
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mousedown', mousedown);
      window.removeEventListener('mouseup', mouseup);

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }

      if (scene) {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
