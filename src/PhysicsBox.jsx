import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function PhysicsBox({ items = [], onSelectItem }) {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const spawnedCountRef = useRef(0);
  const imageCacheRef = useRef({});

  useEffect(() => {
    const { Engine, Render, Runner, Bodies, Composite, Events, Mouse, MouseConstraint, Query } = Matter;

    const container = sceneRef.current;
    const width = container.clientWidth || 360;
    const height = 280;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.1 },
    });
    engineRef.current = engine;

    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent',
      },
    });
    renderRef.current = render;

    // 邊界擋板
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(width / 2, height + 20, width * 2, 40, wallOptions);
    const leftWall = Bodies.rectangle(-10, height / 2, 20, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height * 2, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // 自訂繪製：繪製裁切為圓形的食物實體照片
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      const bodies = Composite.allBodies(engine.world);

      bodies.forEach((body) => {
        if (body.foodImage) {
          const { x, y } = body.position;
          const radius = body.circleRadius || 26;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(body.angle);

          // 繪製圓形裁切陰影與照片
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.clip();

          // 圖片快取繪製
          let img = imageCacheRef.current[body.foodImage];
          if (!img) {
            img = new Image();
            img.src = body.foodImage;
            imageCacheRef.current[body.foodImage] = img;
          }

          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
          } else {
            ctx.fillStyle = '#f3f4f6';
            ctx.fill();
          }

          // 外圈描邊
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.restore();
        }
      });
    });

    // 觸控拖曳與點擊
    const mouse = Mouse.create(render.canvas);
    mouse.pixelRatio = window.devicePixelRatio || 1;
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    let startPos = { x: 0, y: 0 };
    Events.on(mouseConstraint, 'mousedown', (e) => {
      startPos = { ...e.mouse.position };
    });
    Events.on(mouseConstraint, 'mouseup', (e) => {
      const endPos = e.mouse.position;
      const dist = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);
      if (dist < 5) {
        const bodies = Composite.allBodies(engine.world).filter((b) => !b.isStatic);
        const clicked = Query.point(bodies, endPos);
        if (clicked.length > 0 && clicked[0].mealData && onSelectItem) {
          onSelectItem(clicked[0].mealData);
        }
      }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 📱 手機陀螺儀（晃動手機食物隨重力翻滾）
    const handleOrientation = (event) => {
      if (engineRef.current && event.gamma !== null && event.beta !== null) {
        // gamma: 左/右傾斜 (-90 ~ 90), beta: 前/後傾斜 (-180 ~ 180)
        const gx = Math.min(Math.max(event.gamma / 30, -2), 2);
        const gy = Math.min(Math.max(event.beta / 30, -2), 2);
        engineRef.current.gravity.x = gx;
        engineRef.current.gravity.y = gy;
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [onSelectItem]);

  // 新增餐點照片落入沙盒
  useEffect(() => {
    if (!engineRef.current || items.length === 0) return;

    if (items.length > spawnedCountRef.current) {
      const newItems = items.slice(spawnedCountRef.current);
      const width = sceneRef.current.clientWidth || 360;

      newItems.forEach((meal, idx) => {
        setTimeout(() => {
          const { Bodies, Composite } = Matter;
          const dropX = width / 2 + (Math.random() * 100 - 50);

          const radius = 26; // 照片球半徑
          const body = Bodies.circle(dropX, -30, radius, {
            restitution: 0.45,
            friction: 0.3,
            density: 0.002,
          });

          // 綁定拍攝的食物照片
          body.foodImage = meal.photoUrl || (meal.emoji ? null : '/favicon.svg');
          body.mealData = meal;

          Composite.add(engineRef.current.world, body);
        }, idx * 150);
      });

      spawnedCountRef.current = items.length;
    }
  }, [items]);

  return (
    <div className="relative w-full h-[280px] rounded-3xl overflow-hidden border-2 border-dashed border-stone-200/80 bg-white/40 shadow-inner flex flex-col justify-end">
      <div ref={sceneRef} className="w-full h-full" />
      <div className="absolute top-3 left-4 text-[11px] font-semibold text-stone-400 pointer-events-none flex items-center gap-1.5">
        <span>🥗 食物沙盒</span>
        <span>•</span>
        <span className="text-[10px]">晃動手機可翻滾食物，點擊照片看詳情</span>
      </div>
      {items.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 pointer-events-none text-xs">
          <span className="text-3xl mb-1">📸</span>
          <span>今日還未加入食物照片，點擊下方「新增」拍照</span>
        </div>
      )}
    </div>
  );
}